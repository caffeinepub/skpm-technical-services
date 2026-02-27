import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTechnician, useUpdateTechnician } from '../hooks/useQueries';
import { TechnicianStatus, type Technician } from '../backend';
import { nowTimestamp } from '../lib/utils';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  editTechnician?: Technician | null;
}

export default function TechnicianForm({ open, onClose, editTechnician }: Props) {
  const createTechnician = useCreateTechnician();
  const updateTechnician = useUpdateTechnician();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [skills, setSkills] = useState('');
  const [status, setStatus] = useState<TechnicianStatus>(TechnicianStatus.active);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editTechnician) {
      setName(editTechnician.name);
      setEmail(editTechnician.email);
      setPhone(editTechnician.phone);
      setSpecialization(editTechnician.specialization);
      setSkills(editTechnician.skills.join(', '));
      setStatus(editTechnician.status);
      setNotes(editTechnician.notes);
    } else {
      setName(''); setEmail(''); setPhone(''); setSpecialization('');
      setSkills(''); setStatus(TechnicianStatus.active); setNotes('');
    }
  }, [editTechnician, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const now = nowTimestamp();
    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    const data: Technician = {
      id: editTechnician?.id ?? BigInt(0),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      specialization: specialization.trim(),
      skills: skillsArray,
      status,
      notes: notes.trim(),
      createdAt: editTechnician?.createdAt ?? now,
      updatedAt: now,
    };
    try {
      if (editTechnician) {
        await updateTechnician.mutateAsync({ id: editTechnician.id, technician: data });
        toast.success('Technician updated');
      } else {
        await createTechnician.mutateAsync(data);
        toast.success('Technician added');
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save technician';
      toast.error(msg);
    }
  };

  const isPending = createTechnician.isPending || updateTechnician.isPending;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{editTechnician ? 'Edit Technician' : 'Add Technician'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tname">Full Name *</Label>
              <Input id="tname" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="temail">Email</Label>
              <Input id="temail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@company.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tphone">Phone</Label>
              <Input id="tphone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="555-0100" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spec">Specialization</Label>
              <Input id="spec" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="HVAC, Electrical..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input id="skills" value={skills} onChange={e => setSkills(e.target.value)} placeholder="HVAC Installation, Refrigeration, Electrical" />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as TechnicianStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={TechnicianStatus.active}>Active</SelectItem>
                <SelectItem value={TechnicianStatus.inactive}>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tnotes">Notes</Label>
            <Textarea id="tnotes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Additional notes..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editTechnician ? 'Update Technician' : 'Add Technician'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
