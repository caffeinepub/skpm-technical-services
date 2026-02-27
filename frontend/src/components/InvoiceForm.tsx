import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllCustomers, useGetJobsByCustomer, useCreateInvoice, useUpdateInvoice } from '../hooks/useQueries';
import { PaymentStatus, type Invoice, type LineItem } from '../backend';
import { nowTimestamp, dateInputToTimestamp, timestampToDateInput } from '../lib/utils';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  editInvoice?: Invoice | null;
}

const PAYMENT_STATUSES = [
  { value: PaymentStatus.unpaid, label: 'Unpaid' },
  { value: PaymentStatus.partial, label: 'Partial' },
  { value: PaymentStatus.paid, label: 'Paid' },
  { value: PaymentStatus.overdue, label: 'Overdue' },
];

export default function InvoiceForm({ open, onClose, editInvoice }: Props) {
  const { data: customers } = useGetAllCustomers();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const [customerId, setCustomerId] = useState('');
  const [jobId, setJobId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState('8.25');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.unpaid);
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);

  const { data: customerJobs } = useGetJobsByCustomer(customerId ? BigInt(customerId) : null);

  useEffect(() => {
    if (editInvoice) {
      setCustomerId(editInvoice.customerId.toString());
      setJobId(editInvoice.jobId?.toString() ?? '');
      setIssueDate(timestampToDateInput(editInvoice.issueDate));
      setDueDate(timestampToDateInput(editInvoice.dueDate));
      setTaxRate(editInvoice.taxRate.toString());
      setPaymentStatus(editInvoice.paymentStatus);
      setNotes(editInvoice.notes);
      setLineItems(editInvoice.lineItems.length > 0 ? editInvoice.lineItems : [{ description: '', quantity: 1, unitPrice: 0 }]);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      setCustomerId(''); setJobId(''); setIssueDate(today); setDueDate(due);
      setTaxRate('8.25'); setPaymentStatus(PaymentStatus.unpaid); setNotes('');
      setLineItems([{ description: '', quantity: 1, unitPrice: 0 }]);
    }
  }, [editInvoice, open]);

  const subtotal = useMemo(() =>
    lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [lineItems]
  );
  const tax = subtotal * (parseFloat(taxRate) || 0) / 100;
  const total = subtotal + tax;

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addLineItem = () => setLineItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  const removeLineItem = (index: number) => setLineItems(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !issueDate || !dueDate) return;
    const now = nowTimestamp();
    const invoiceNumber = editInvoice?.invoiceNumber ?? `INV-${Date.now().toString().slice(-6)}`;
    const data: Invoice = {
      id: editInvoice?.id ?? BigInt(0),
      invoiceNumber,
      customerId: BigInt(customerId),
      jobId: jobId ? BigInt(jobId) : undefined,
      issueDate: dateInputToTimestamp(issueDate),
      dueDate: dateInputToTimestamp(dueDate),
      lineItems,
      subtotal,
      taxRate: parseFloat(taxRate) || 0,
      total,
      paymentStatus,
      notes: notes.trim(),
      createdAt: editInvoice?.createdAt ?? now,
      updatedAt: now,
    };
    try {
      if (editInvoice) {
        await updateInvoice.mutateAsync({ id: editInvoice.id, invoice: data });
        toast.success('Invoice updated');
      } else {
        await createInvoice.mutateAsync(data);
        toast.success('Invoice created');
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save invoice';
      toast.error(msg);
    }
  };

  const isPending = createInvoice.isPending || updateInvoice.isPending;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{editInvoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <Select value={customerId} onValueChange={v => { setCustomerId(v); setJobId(''); }}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers?.map(c => <SelectItem key={c.id.toString()} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Linked Job (optional)</Label>
              <Select value={jobId} onValueChange={setJobId} disabled={!customerId}>
                <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {customerJobs?.map(j => <SelectItem key={j.id.toString()} value={j.id.toString()}>{j.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input id="issueDate" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={v => setPaymentStatus(v as PaymentStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-1 h-7 text-xs">
                <Plus className="w-3 h-3" /> Add Item
              </Button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Unit Price</span>
                <span className="col-span-1"></span>
              </div>
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    className="col-span-6 h-8 text-sm"
                    value={item.description}
                    onChange={e => updateLineItem(index, 'description', e.target.value)}
                    placeholder="Description"
                  />
                  <Input
                    className="col-span-2 h-8 text-sm text-center"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={e => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    className="col-span-3 h-8 text-sm text-right"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={e => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  <Button
                    type="button" variant="ghost" size="icon"
                    className="col-span-1 h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tax</span>
                <Input
                  type="number" min="0" max="100" step="0.01"
                  value={taxRate}
                  onChange={e => setTaxRate(e.target.value)}
                  className="h-6 w-16 text-xs text-center"
                />
                <span className="text-muted-foreground text-xs">%</span>
              </div>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-1.5">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invNotes">Notes</Label>
            <Textarea id="invNotes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Payment terms, notes..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !customerId || !issueDate || !dueDate}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editInvoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
