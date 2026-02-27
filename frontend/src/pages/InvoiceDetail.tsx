import { useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useGetInvoice, useGetAllCustomers, useGetAllJobs, useDeleteInvoice, useMarkInvoicePaid } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import InvoiceForm from '../components/InvoiceForm';
import { ArrowLeft, Pencil, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import {
  formatDate, formatCurrency, getPaymentStatusLabel, getPaymentStatusColor
} from '../lib/utils';
import { PaymentStatus } from '../backend';
import { toast } from 'sonner';

export default function InvoiceDetail() {
  const { id } = useParams({ from: '/auth-layout/invoices/$id' });
  const navigate = useNavigate();
  const invoiceId = BigInt(id);

  const { data: invoice, isLoading } = useGetInvoice(invoiceId);
  const { data: customers } = useGetAllCustomers();
  const { data: jobs } = useGetAllJobs();
  const deleteInvoice = useDeleteInvoice();
  const markPaid = useMarkInvoicePaid();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const customer = customers?.find(c => c.id === invoice?.customerId);
  const job = jobs?.find(j => j.id === invoice?.jobId);

  const handleDelete = async () => {
    try {
      await deleteInvoice.mutateAsync(invoiceId);
      toast.success('Invoice deleted');
      navigate({ to: '/invoices' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete invoice';
      toast.error(msg);
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markPaid.mutateAsync(invoiceId);
      toast.success('Invoice marked as paid');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update invoice';
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

  if (!invoice) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium">Invoice not found</p>
          <Link to="/invoices" className="mt-3 text-sm text-primary hover:underline">← Back to Invoices</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/invoices' })}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-mono font-bold text-foreground">{invoice.invoiceNumber}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPaymentStatusColor(invoice.paymentStatus)}`}>
              {getPaymentStatusLabel(invoice.paymentStatus)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.paymentStatus !== PaymentStatus.paid && (
            <Button size="sm" onClick={handleMarkPaid} className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
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
        <Card className="shadow-card border-0 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                {customer ? (
                  <Link to="/customers/$id" params={{ id: customer.id.toString() }} className="font-medium text-primary hover:underline">
                    {customer.name}
                  </Link>
                ) : <p className="font-medium">—</p>}
              </div>
              {job && (
                <div>
                  <p className="text-xs text-muted-foreground">Linked Job</p>
                  <Link to="/jobs/$id" params={{ id: job.id.toString() }} className="font-medium text-primary hover:underline">
                    {job.title}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Issue Date</p>
                <p className="font-medium">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Line Items</p>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold text-xs">Description</TableHead>
                    <TableHead className="font-semibold text-xs text-center">Qty</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Unit Price</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{item.description}</TableCell>
                      <TableCell className="text-sm text-center">{item.quantity}</TableCell>
                      <TableCell className="text-sm text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({invoice.taxRate}%)</span>
                <span className="font-medium">{formatCurrency(invoice.total - invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1.5 text-base">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>

            {invoice.notes && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice #</span>
              <span className="font-mono font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Due</span>
              <span className="font-bold text-lg">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                {getPaymentStatusLabel(invoice.paymentStatus)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <InvoiceForm open={showEdit} onClose={() => setShowEdit(false)} editInvoice={invoice} />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoice.invoiceNumber}? This action cannot be undone.
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
