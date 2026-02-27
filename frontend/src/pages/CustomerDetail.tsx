import { useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import {
  useGetCustomer, useDeleteCustomer,
  useGetJobsByCustomer, useGetInvoicesByCustomer
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import CustomerForm from '../components/CustomerForm';
import { ArrowLeft, Pencil, Trash2, Mail, Phone, MapPin, Building2, AlertCircle } from 'lucide-react';
import {
  formatDate, formatCurrency, getJobStatusLabel, getJobStatusColor,
  getJobPriorityLabel, getJobPriorityColor, getPaymentStatusLabel,
  getPaymentStatusColor, getCustomerTypeLabel, getCustomerTypeColor
} from '../lib/utils';
import { toast } from 'sonner';

export default function CustomerDetail() {
  const { id } = useParams({ from: '/auth-layout/customers/$id' });
  const navigate = useNavigate();
  const customerId = BigInt(id);

  const { data: customer, isLoading } = useGetCustomer(customerId);
  const { data: jobs } = useGetJobsByCustomer(customerId);
  const { data: invoices } = useGetInvoicesByCustomer(customerId);
  const deleteCustomer = useDeleteCustomer();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteCustomer.mutateAsync(customerId);
      toast.success('Customer deleted');
      navigate({ to: '/customers' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete customer';
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

  if (!customer) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium">Customer not found</p>
          <Link to="/customers" className="mt-3 text-sm text-primary hover:underline">← Back to Customers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/customers' })}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">{customer.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCustomerTypeColor(customer.customerType)}`}>
              {getCustomerTypeLabel(customer.customerType)}
            </span>
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
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.company && (
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="text-sm font-medium">{customer.company}</p>
                </div>
              </div>
            )}
            {customer.email && (
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a href={`mailto:${customer.email}`} className="text-sm font-medium text-primary hover:underline">{customer.email}</a>
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium">{customer.address}</p>
                </div>
              </div>
            )}
            {customer.notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="jobs">
            <TabsList className="mb-4">
              <TabsTrigger value="jobs">Jobs ({jobs?.length ?? 0})</TabsTrigger>
              <TabsTrigger value="invoices">Invoices ({invoices?.length ?? 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="jobs">
              <Card className="shadow-card border-0">
                <CardContent className="p-0">
                  {!jobs || jobs.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground text-sm">No jobs for this customer</div>
                  ) : (
                    <div className="divide-y">
                      {jobs.map(job => (
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
            </TabsContent>
            <TabsContent value="invoices">
              <Card className="shadow-card border-0">
                <CardContent className="p-0">
                  {!invoices || invoices.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground text-sm">No invoices for this customer</div>
                  ) : (
                    <div className="divide-y">
                      {invoices.map(inv => (
                        <Link
                          key={inv.id.toString()}
                          to="/invoices/$id"
                          params={{ id: inv.id.toString() }}
                          className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                            <p className="text-xs text-muted-foreground">Due {formatDate(inv.dueDate)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">{formatCurrency(inv.total)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPaymentStatusColor(inv.paymentStatus)}`}>
                              {getPaymentStatusLabel(inv.paymentStatus)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CustomerForm open={showEdit} onClose={() => setShowEdit(false)} editCustomer={customer} />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{customer.name}"? This action cannot be undone.
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
