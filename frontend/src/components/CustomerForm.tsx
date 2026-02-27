import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useQueries';
import { CustomerType, type Customer } from '../backend';
import { nowTimestamp } from '../lib/utils';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  editCustomer?: Customer | null;
}

export default function CustomerForm({ open, onClose, editCustomer }: Props) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.residential);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editCustomer) {
      setName(editCustomer.name);
      setCompany(editCustomer.company);
      setEmail(editCustomer.email);
      setPhone(editCustomer.phone);
      setAddress(editCustomer.address);
      setCustomerType(editCustomer.customerType);
      setNotes(editCustomer.notes);
    } else {
      setName(''); setCompany(''); setEmail(''); setPhone('');
      setAddress(''); setCustomerType(CustomerType.residential); setNotes('');
    }
  }, [editCustomer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const now = nowTimestamp();
    const data: Customer = {
      id: editCustomer?.id ?? BigInt(0),
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      customerType,
      notes: notes.trim(),
      createdAt: editCustomer?.createdAt ?? now,
      updatedAt: now,
    };
    try {
      if (editCustomer) {
        await updateCustomer.mutateAsync({ id: editCustomer.id, customer: data });
        toast.success('Customer updated');
      } else {
        await createCustomer.mutateAsync(data);
        toast.success('Customer created');
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save customer';
      toast.error(msg);
    }
  };

  const isPending = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{editCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cname">Full Name *</Label>
              <Input id="cname" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cemail">Email</Label>
              <Input id="cemail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="555-0100" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, City, State" />
          </div>
          <div className="space-y-1.5">
            <Label>Customer Type</Label>
            <Select value={customerType} onValueChange={v => setCustomerType(v as CustomerType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={CustomerType.residential}>Residential</SelectItem>
                <SelectItem value={CustomerType.commercial}>Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cnotes">Notes</Label>
            <Textarea id="cnotes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Additional notes..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
