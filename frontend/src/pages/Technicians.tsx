import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllTechnicians, useDeleteTechnician, useDeactivateTechnician, useGetAllJobs } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import TechnicianForm from '../components/TechnicianForm';
import { Plus, Search, Eye, Pencil, Trash2, Wrench, UserX } from 'lucide-react';
import { getTechnicianStatusColor } from '../lib/utils';
import { TechnicianStatus, type Technician } from '../backend';
import { toast } from 'sonner';

export default function Technicians() {
  const navigate = useNavigate();
  const { data: technicians, isLoading } = useGetAllTechnicians();
  const { data: jobs } = useGetAllJobs();
  const deleteTechnician = useDeleteTechnician();
  const deactivateTechnician = useDeactivateTechnician();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTechnician, setEditTechnician] = useState<Technician | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [deactivateId, setDeactivateId] = useState<bigint | null>(null);

  // Count assigned jobs per technician
  const jobCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const job of jobs ?? []) {
      if (job.assignedTechnician) {
        const key = job.assignedTechnician.toString();
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return map;
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (technicians ?? []).filter(t =>
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.specialization.toLowerCase().includes(q)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [technicians, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTechnician.mutateAsync(deleteId);
      toast.success('Technician deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete technician';
      toast.error(msg);
    } finally {
      setDeleteId(null);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await deactivateTechnician.mutateAsync(deactivateId);
      toast.success('Technician deactivated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deactivate technician';
      toast.error(msg);
    } finally {
      setDeactivateId(null);
    }
  };

  const activeCount = (technicians ?? []).filter(t => t.status === TechnicianStatus.active).length;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Technicians</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Staff and field technician management</p>
        </div>
        <Button onClick={() => { setEditTechnician(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Technician
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Staff</p>
            <p className="text-2xl font-display font-bold mt-0.5">{technicians?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-display font-bold mt-0.5 text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl font-display font-bold mt-0.5 text-muted-foreground">
              {(technicians?.length ?? 0) - activeCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-0">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or specialization..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-0">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            {filtered.length} technician{filtered.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Wrench className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No technicians found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Specialization</TableHead>
                    <TableHead className="font-semibold text-center">Jobs</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(tech => (
                    <TableRow key={tech.id.toString()} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{tech.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{tech.email || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{tech.phone || '—'}</TableCell>
                      <TableCell className="text-sm">{tech.specialization || '—'}</TableCell>
                      <TableCell className="text-center font-medium">
                        {jobCountMap.get(tech.id.toString()) ?? 0}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTechnicianStatusColor(tech.status)}`}>
                          {tech.status === TechnicianStatus.active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => navigate({ to: '/technicians/$id', params: { id: tech.id.toString() } })}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => { setEditTechnician(tech); setShowForm(true); }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          {tech.status === TechnicianStatus.active && (
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700"
                              onClick={() => setDeactivateId(tech.id)}
                              title="Deactivate"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(tech.id)}
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

      <TechnicianForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditTechnician(null); }}
        editTechnician={editTechnician}
      />

      <AlertDialog open={!!deactivateId} onOpenChange={v => !v && setDeactivateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Technician</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the technician as inactive. They will no longer appear in job assignment dropdowns.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Technician</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently delete this technician record.
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
