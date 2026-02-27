import { useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import {
  useGetTechnician, useDeleteTechnician, useDeactivateTechnician, useGetJobsByTechnician
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import TechnicianForm from '../components/TechnicianForm';
import { ArrowLeft, Pencil, Trash2, Mail, Phone, AlertCircle, UserX } from 'lucide-react';
import {
  formatDate, formatDateTime, getJobStatusLabel, getJobStatusColor,
  getJobPriorityLabel, getJobPriorityColor, getTechnicianStatusColor
} from '../lib/utils';
import { TechnicianStatus } from '../backend';
import { toast } from 'sonner';

export default function TechnicianDetail() {
  const { id } = useParams({ from: '/auth-layout/technicians/$id' });
  const navigate = useNavigate();
  const techId = BigInt(id);

  const { data: technician, isLoading } = useGetTechnician(techId);
  const { data: jobs } = useGetJobsByTechnician(techId);
  const deleteTechnician = useDeleteTechnician();
  const deactivateTechnician = useDeactivateTechnician();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTechnician.mutateAsync(techId);
      toast.success('Technician deleted');
      navigate({ to: '/technicians' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete technician';
      toast.error(msg);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateTechnician.mutateAsync(techId);
      toast.success('Technician deactivated');
      setShowDeactivate(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deactivate technician';
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

  if (!technician) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium">Technician not found</p>
          <Link to="/technicians" className="mt-3 text-sm text-primary hover:underline">← Back to Technicians</Link>
        </div>
      </div>
    );
  }

  const completedJobs = (jobs ?? []).filter(j => j.status === 'completed' as unknown);
  const activeJobs = (jobs ?? []).filter(j => j.status !== 'completed' as unknown && j.status !== 'cancelled' as unknown);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/technicians' })}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">{technician.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTechnicianStatusColor(technician.status)}`}>
                {technician.status === TechnicianStatus.active ? 'Active' : 'Inactive'}
              </span>
              {technician.specialization && (
                <span className="text-xs text-muted-foreground">{technician.specialization}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {technician.status === TechnicianStatus.active && (
            <Button variant="outline" size="sm" onClick={() => setShowDeactivate(true)} className="gap-1.5 text-amber-600 border-amber-300 hover:bg-amber-50">
              <UserX className="w-3.5 h-3.5" /> Deactivate
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)} className="gap-1.5">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <Card className="shadow-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {technician.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${technician.email}`} className="text-sm font-medium text-primary hover:underline">{technician.email}</a>
                  </div>
                </div>
              )}
              {technician.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{technician.phone}</p>
                  </div>
                </div>
              )}
              {technician.notes && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{technician.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {technician.skills.length > 0 && (
            <Card className="shadow-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {technician.skills.map((skill, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full font-medium">{skill}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Jobs</span>
                <span className="font-bold">{jobs?.length ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Jobs</span>
                <span className="font-medium text-amber-600">{activeJobs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium text-green-600">{completedJobs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">{formatDateTime(technician.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card border-0 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Job History ({jobs?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!jobs || jobs.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">No jobs assigned to this technician</div>
            ) : (
              <div className="divide-y">
                {[...jobs].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt)).map(job => (
                  <Link
                    key={job.id.toString()}
                    to="/jobs/$id"
                    params={{ id: job.id.toString() }}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(job.scheduledDate)}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getJobPriorityColor(job.priority)}`}>
                        {getJobPriorityLabel(job.priority)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getJobStatusColor(job.status)}`}>
                        {getJobStatusLabel(job.status)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TechnicianForm open={showEdit} onClose={() => setShowEdit(false)} editTechnician={technician} />

      <AlertDialog open={showDeactivate} onOpenChange={setShowDeactivate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Technician</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {technician.name} as inactive. They will no longer appear in job assignment dropdowns.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Technician</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{technician.name}"? This action cannot be undone.
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
