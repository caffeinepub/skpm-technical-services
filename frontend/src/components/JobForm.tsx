import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllCustomers, useGetAllTechnicians, useCreateJob, useUpdateJob } from '../hooks/useQueries';
import { JobStatus, JobPriority, TechnicianStatus, type Job } from '../backend';
import { nowTimestamp, dateInputToTimestamp, timestampToDateInput } from '../lib/utils';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  editJob?: Job | null;
  defaultDate?: string;
}

const PRIORITIES = [
  { value: JobPriority.low, label: 'Low' },
  { value: JobPriority.medium, label: 'Medium' },
  { value: JobPriority.high, label: 'High' },
  { value: JobPriority.urgent, label: 'Urgent' },
];

const STATUSES = [
  { value: JobStatus.new_, label: 'New' },
  { value: JobStatus.inProgress, label: 'In Progress' },
  { value: JobStatus.onHold, label: 'On Hold' },
  { value: JobStatus.completed, label: 'Completed' },
  { value: JobStatus.cancelled, label: 'Cancelled' },
];

export default function JobForm({ open, onClose, editJob, defaultDate }: Props) {
  const { data: customers } = useGetAllCustomers();
  const { data: technicians } = useGetAllTechnicians();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [priority, setPriority] = useState<JobPriority>(JobPriority.medium);
  const [status, setStatus] = useState<JobStatus>(JobStatus.new_);
  const [scheduledDate, setScheduledDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editJob) {
      setTitle(editJob.title);
      setDescription(editJob.description);
      setCustomerId(editJob.customerId.toString());
      setTechnicianId(editJob.assignedTechnician?.toString() ?? '');
      setPriority(editJob.priority);
      setStatus(editJob.status);
      setScheduledDate(timestampToDateInput(editJob.scheduledDate));
      setLocation(editJob.location);
      setNotes(editJob.notes);
    } else {
      setTitle('');
      setDescription('');
      setCustomerId('');
      setTechnicianId('');
      setPriority(JobPriority.medium);
      setStatus(JobStatus.new_);
      setScheduledDate(defaultDate ?? '');
      setLocation('');
      setNotes('');
    }
  }, [editJob, open, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerId) return;
    const now = nowTimestamp();
    const jobData: Job = {
      id: editJob?.id ?? BigInt(0),
      title: title.trim(),
      description: description.trim(),
      customerId: BigInt(customerId),
      assignedTechnician: technicianId ? BigInt(technicianId) : undefined,
      priority,
      status,
      scheduledDate: scheduledDate ? dateInputToTimestamp(scheduledDate) : undefined,
      location: location.trim(),
      notes: notes.trim(),
      createdAt: editJob?.createdAt ?? now,
      updatedAt: now,
    };
    try {
      if (editJob) {
        await updateJob.mutateAsync({ id: editJob.id, job: jobData });
        toast.success('Job updated successfully');
      } else {
        await createJob.mutateAsync(jobData);
        toast.success('Job created successfully');
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save job';
      toast.error(msg);
    }
  };

  const isPending = createJob.isPending || updateJob.isPending;
  const activeTechs = technicians?.filter(t => t.status === TechnicianStatus.active) ?? [];

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{editJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. HVAC Inspection"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Describe the work to be done..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers?.map(c => (
                    <SelectItem key={c.id.toString()} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Technician</Label>
              <Select value={technicianId} onValueChange={setTechnicianId}>
                <SelectTrigger><SelectValue placeholder="Assign technician" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {activeTechs.map(t => (
                    <SelectItem key={t.id.toString()} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={v => setPriority(v as JobPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as JobStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Address"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional notes..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !title.trim() || !customerId}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {editJob ? 'Updating...' : 'Creating...'}
                </span>
              ) : editJob ? 'Update Job' : 'Create Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
