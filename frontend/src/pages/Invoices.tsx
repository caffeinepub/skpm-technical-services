import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllInvoices, useGetAllCustomers, useDeleteInvoice, useMarkInvoicePaid } from '../hooks/useQueries';
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
import InvoiceForm from '../components/InvoiceForm';
import { Plus, Search, Eye, Pencil, Trash2, FileText, CheckCircle } from 'lucide-react';
import { formatDate, formatCurrency, getPaymentStatusLabel, getPaymentStatusColor } from '../lib/utils';
import { PaymentStatus, type Invoice } from '../backend';
import { toast } from 'sonner';

const ALL = 'all';

export default function Invoices() {
  const navigate = useNavigate();
  const { data: invoices, isLoading } = useGetAllInvoices();
  const { data: customers } = useGetAllCustomers();
  const deleteInvoice = useDeleteInvoice();
  const markPaid = useMarkInvoicePaid();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const customerMap = useMemo(() => new Map(customers?.map(c => [c.id.toString(), c.name]) ?? []), [customers]);

  const filtered = useMemo(() => {
    return (invoices ?? []).filter(inv => {
      if (statusFilter !== ALL && inv.paymentStatus !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const customerName = customerMap.get(inv.customerId.toString()) ?? '';
        if (!inv.invoiceNumber.toLowerCase().includes(q) && !customerName.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }, [invoices, statusFilter, search, customerMap]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInvoice.mutateAsync(deleteId);
      toast.success('Invoice deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete invoice';
      toast.error(msg);
    } finally {
      setDeleteId(null);
    }
  };

  const handleMarkPaid = async (id: bigint) => {
    try {
      await markPaid.mutateAsync(id);
      toast.success('Invoice marked as paid');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update invoice';
      toast.error(msg);
    }
  };

  const totalRevenue = filtered.filter(i => i.paymentStatus === PaymentStatus.paid).reduce((s, i) => s + i.total, 0);
  const totalPending = filtered.filter(i => i.paymentStatus !== PaymentStatus.paid).reduce((s, i) => s + i.total, 0);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Billing and payment management</p>
        </div>
        <Button onClick={() => { setEditInvoice(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New Invoice
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Invoices', value: (invoices ?? []).length.toString(), color: 'text-foreground' },
          { label: 'Collected', value: formatCurrency(totalRevenue), color: 'text-green-600' },
          { label: 'Outstanding', value: formatCurrency(totalPending), color: 'text-amber-600' },
          { label: 'Overdue', value: (invoices ?? []).filter(i => i.paymentStatus === PaymentStatus.overdue).length.toString(), color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="shadow-card border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-xl font-display font-bold mt-0.5 ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices or customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Statuses</SelectItem>
                <SelectItem value={PaymentStatus.unpaid}>Unpaid</SelectItem>
                <SelectItem value={PaymentStatus.partial}>Partial</SelectItem>
                <SelectItem value={PaymentStatus.paid}>Paid</SelectItem>
                <SelectItem value={PaymentStatus.overdue}>Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-0">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Invoice #</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Issue Date</TableHead>
                    <TableHead className="font-semibold">Due Date</TableHead>
                    <TableHead className="font-semibold">Total</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(inv => (
                    <TableRow key={inv.id.toString()} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium font-mono text-sm">{inv.invoiceNumber}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {customerMap.get(inv.customerId.toString()) ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(inv.issueDate)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(inv.total)}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPaymentStatusColor(inv.paymentStatus)}`}>
                          {getPaymentStatusLabel(inv.paymentStatus)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.paymentStatus !== PaymentStatus.paid && (
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700"
                              onClick={() => handleMarkPaid(inv.id)}
                              title="Mark as paid"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => navigate({ to: '/invoices/$id', params: { id: inv.id.toString() } })}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => { setEditInvoice(inv); setShowForm(true); }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(inv.id)}
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

      <InvoiceForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditInvoice(null); }}
        editInvoice={editInvoice}
      />

      <AlertDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
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
