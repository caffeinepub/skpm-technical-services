import { useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import {
  useGetJob, useGetAllCustomers, useGetAllTechnicians,
  useDeleteJob, useGetStockUsageByJob, useGetAllInventoryItems
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import JobForm from '../components/JobForm';
import {
  ArrowLeft, Pencil, Trash2, MapPin, Calendar, User, Briefcase,
  AlertCircle, Package
} from 'lucide-react';
import {
  formatDate, formatDateTime, getJobStatusLabel, getJobStatusColor,
  getJobPriorityLabel, getJobPriorityColor
} from '../lib/utils';
import { toast } from 'sonner';

export default function JobDetail() {
  const { id } = useParams({ from: '/auth-layout/jobs/$id' });
  const navigate = useNavigate();
  const jobId = BigInt(id);

  const { data: job, isLoading } = useGetJob(jobId);
  const { data: customers } = useGetAllCustomers();
  const { data: technicians } = useGetAllTechnicians();
  const { data: stockUsage } = useGetStockUsageByJob(jobId);
  const { data: inventoryItems } = useGetAllInventoryItems();
  const deleteJob = useDeleteJob();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const customer = customers?.find(c => c.id === job?.customerId);
  const technician = technicians?.find(t => t.id === job?.assignedTechnician);
  const inventoryMap = new Map(inventoryItems?.map(i => [i.id.toString(), i.name]) ?? []);

  const handleDelete = async () => {
    try {
      await deleteJob.mutateAsync(jobId);
      toast.success('Job deleted');
      navigate({ to: '/jobs' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete job';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium">Job not found</p>
          <Link to="/jobs" className="mt-3 text-sm text-primary hover:underline">← Back to Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/jobs' })}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">{job.title}</h1>
            <p className="text-sm text-muted-foreground">Job #{job.id.toString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} className="gap-1.5">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <Card className="shadow-card border-0 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getJobStatusColor(job.status)}`}>
                {getJobStatusLabel(job.status)}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getJobPriorityColor(job.priority)}`}>
                {getJobPriorityLabel(job.priority)} Priority
              </span>
            </div>

            {job.description && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-foreground">{job.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  {customer ? (
                    <Link to="/customers/$id" params={{ id: customer.id.toString() }} className="text-sm font-medium text-primary hover:underline">
                      {customer.name}
                    </Link>
                  ) : <p className="text-sm font-medium">—</p>}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Technician</p>
                  {technician ? (
                    <Link to="/technicians/$id" params={{ id: technician.id.toString() }} className="text-sm font-medium text-primary hover:underline">
                      {technician.name}
                    </Link>
                  ) : <p className="text-sm font-medium text-muted-foreground">Unassigned</p>}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Scheduled Date</p>
                  <p className="text-sm font-medium">{formatDate(job.scheduledDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{job.location || '—'}</p>
                </div>
              </div>
            </div>

            {job.notes && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{job.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="shadow-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDateTime(job.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">{formatDateTime(job.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Stock Usage */}
          {stockUsage && stockUsage.length > 0 && (
            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4" /> Parts Used
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stockUsage.map(usage => (
                  <div key={usage.id.toString()} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate">
                      {inventoryMap.get(usage.itemId.toString()) ?? `Item #${usage.itemId}`}
                    </span>
                    <span className="font-medium ml-2">×{usage.quantityUsed.toString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <JobForm
        open={showEdit}
        onClose={() => setShowEdit(false)}
        editJob={job}
      />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{job.title}"? This action cannot be undone.
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
