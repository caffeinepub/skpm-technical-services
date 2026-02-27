import { useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import {
  useGetInventoryItem, useDeleteInventoryItem, useGetAllJobs, useRecordStockUsage
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InventoryForm from '../components/InventoryForm';
import { ArrowLeft, Pencil, Trash2, AlertCircle, AlertTriangle, Package, MinusCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { toast } from 'sonner';

export default function InventoryDetail() {
  const { id } = useParams({ from: '/auth-layout/inventory/$id' });
  const navigate = useNavigate();
  const itemId = BigInt(id);

  const { data: item, isLoading } = useGetInventoryItem(itemId);
  const { data: jobs } = useGetAllJobs();
  const deleteItem = useDeleteInventoryItem();
  const recordUsage = useRecordStockUsage();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [usageJobId, setUsageJobId] = useState('');
  const [usageQty, setUsageQty] = useState('1');

  const handleDelete = async () => {
    try {
      await deleteItem.mutateAsync(itemId);
      toast.success('Item deleted');
      navigate({ to: '/inventory' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(msg);
    }
  };

  const handleRecordUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageJobId || !usageQty) return;
    try {
      await recordUsage.mutateAsync({
        itemId,
        jobId: BigInt(usageJobId),
        quantityUsed: BigInt(parseInt(usageQty) || 1),
      });
      toast.success('Stock usage recorded');
      setShowUsage(false);
      setUsageJobId('');
      setUsageQty('1');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record usage';
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

  if (!item) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium">Item not found</p>
          <Link to="/inventory" className="mt-3 text-sm text-primary hover:underline">← Back to Inventory</Link>
        </div>
      </div>
    );
  }

  const isLowStock = Number(item.quantityInStock) <= Number(item.minimumStockThreshold);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/inventory' })}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
              {item.name}
              {isLowStock && <AlertTriangle className="w-5 h-5 text-red-500" />}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">{item.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowUsage(true)} className="gap-1.5">
            <MinusCircle className="w-3.5 h-3.5" /> Record Usage
          </Button>
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
            <CardTitle className="text-sm font-semibold">Item Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLowStock && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Low stock alert: Only {item.quantityInStock.toString()} units remaining (minimum: {item.minimumStockThreshold.toString()})</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium">{item.category || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Supplier</p>
                <p className="font-medium">{item.supplier || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quantity in Stock</p>
                <p className={`font-bold text-lg ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                  {item.quantityInStock.toString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Minimum Threshold</p>
                <p className="font-medium">{item.minimumStockThreshold.toString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unit Cost</p>
                <p className="font-medium">{formatCurrency(item.unitCost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="font-medium">{formatCurrency(Number(item.quantityInStock) * item.unitCost)}</p>
              </div>
            </div>
            {item.notes && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">{item.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="w-4 h-4" /> Stock Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">SKU</span>
              <span className="font-mono font-medium">{item.sku || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{formatDateTime(item.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span className="font-medium">{formatDateTime(item.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <InventoryForm open={showEdit} onClose={() => setShowEdit(false)} editItem={item} />

      {/* Record Usage Dialog */}
      <Dialog open={showUsage} onOpenChange={v => !v && setShowUsage(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Record Stock Usage</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordUsage} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Item</Label>
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">Available: {item.quantityInStock.toString()} units</p>
            </div>
            <div className="space-y-1.5">
              <Label>Linked Job *</Label>
              <Select value={usageJobId} onValueChange={setUsageJobId}>
                <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                <SelectContent>
                  {jobs?.map(j => (
                    <SelectItem key={j.id.toString()} value={j.id.toString()}>{j.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="usageQty">Quantity Used *</Label>
              <Input
                id="usageQty"
                type="number"
                min="1"
                max={item.quantityInStock.toString()}
                value={usageQty}
                onChange={e => setUsageQty(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUsage(false)}>Cancel</Button>
              <Button type="submit" disabled={recordUsage.isPending || !usageJobId}>
                {recordUsage.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Recording...
                  </span>
                ) : 'Record Usage'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
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
