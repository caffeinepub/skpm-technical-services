import { useState, useMemo } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  useGetAllJobs, useGetAllCustomers, useGetAllTechnicians, useDeleteJob
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import JobForm from '../components/JobForm';
import { Plus, Search, Eye, Pencil, Trash2, Briefcase } from 'lucide-react';
import {
  formatDate, getJobStatusLabel, getJobStatusColor,
  getJobPriorityLabel, getJobPriorityColor
} from '../lib/utils';
import { JobStatus, JobPriority, type Job } from '../backend';
import { toast } from 'sonner';

const ALL = 'all';

export default function Jobs() {
  const navigate = useNavigate();
  const { data: jobs, isLoading } = useGetAllJobs();
  const { data: customers } = useGetAllCustomers();
  const { data: technicians } = useGetAllTechnicians();
  const deleteJob = useDeleteJob();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [priorityFilter, setPriorityFilter] = useState(ALL);
  const [techFilter, setTechFilter] = useState(ALL);
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const customerMap = useMemo(() => new Map(customers?.map(c => [c.id.toString(), c.name]) ?? []), [customers]);
  const techMap = useMemo(() => new Map(technicians?.map(t => [t.id.toString(), t.name]) ?? []), [technicians]);

  const filtered = useMemo(() => {
    return (jobs ?? []).filter(j => {
      if (statusFilter !== ALL && j.status !== statusFilter) return false;
      if (priorityFilter !== ALL && j.priority !== priorityFilter) return false;
      if (techFilter !== ALL && j.assignedTechnician?.toString() !== techFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const customerName = customerMap.get(j.customerId.toString()) ?? '';
        if (!j.title.toLowerCase().includes(q) && !customerName.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
  }, [jobs, statusFilter, priorityFilter, techFilter, search, customerMap]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteJob.mutateAsync(deleteId);
      toast.success('Job deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete job';
      toast.error(msg);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage work orders and field assignments</p>
        </div>
        <Button onClick={() => { setEditJob(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New Job
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs or customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Statuses</SelectItem>
                <SelectItem value={JobStatus.new_}>New</SelectItem>
                <SelectItem value={JobStatus.inProgress}>In Progress</SelectItem>
                <SelectItem value={JobStatus.onHold}>On Hold</SelectItem>
                <SelectItem value={JobStatus.completed}>Completed</SelectItem>
                <SelectItem value={JobStatus.cancelled}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Priorities</SelectItem>
                <SelectItem value={JobPriority.low}>Low</SelectItem>
                <SelectItem value={JobPriority.medium}>Medium</SelectItem>
                <SelectItem value={JobPriority.high}>High</SelectItem>
                <SelectItem value={JobPriority.urgent}>Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={techFilter} onValueChange={setTechFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Technician" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Technicians</SelectItem>
                {technicians?.map(t => (
                  <SelectItem key={t.id.toString()} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            {filtered.length} job{filtered.length !== 1 ? 's' : ''} found
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Briefcase className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No jobs found</p>
              <p className="text-sm mt-1">Try adjusting your filters or create a new job</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Technician</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Scheduled</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(job => (
                    <TableRow key={job.id.toString()} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium max-w-48 truncate">{job.title}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {customerMap.get(job.customerId.toString()) ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {job.assignedTechnician ? techMap.get(job.assignedTechnician.toString()) ?? '—' : 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getJobPriorityColor(job.priority)}`}>
                          {getJobPriorityLabel(job.priority)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getJobStatusColor(job.status)}`}>
                          {getJobStatusLabel(job.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(job.scheduledDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => navigate({ to: '/jobs/$id', params: { id: job.id.toString() } })}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => { setEditJob(job); setShowForm(true); }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(job.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <JobForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditJob(null); }}
        editJob={editJob}
      />

      <AlertDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
