import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllInventoryItems, useGetLowStockItems, useDeleteInventoryItem } from '../hooks/useQueries';
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
import InventoryForm from '../components/InventoryForm';
import { Plus, Search, Eye, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { type InventoryItem } from '../backend';
import { toast } from 'sonner';

const ALL = 'all';

export default function Inventory() {
  const navigate = useNavigate();
  const { data: items, isLoading } = useGetAllInventoryItems();
  const { data: lowStockItems } = useGetLowStockItems();
  const deleteItem = useDeleteInventoryItem();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const categories = useMemo(() => {
    const cats = new Set((items ?? []).map(i => i.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [items]);

  const lowStockIds = useMemo(() =>
    new Set((lowStockItems ?? []).map(i => i.id.toString())),
    [lowStockItems]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (items ?? []).filter(item => {
      if (categoryFilter !== ALL && item.category !== categoryFilter) return false;
      if (q && !item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [items, search, categoryFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteItem.mutateAsync(deleteId);
      toast.success('Item deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(msg);
    } finally {
      setDeleteId(null);
    }
  };

  const lowStockCount = lowStockItems?.length ?? 0;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Parts and stock management</p>
        </div>
        <Button onClick={() => { setEditItem(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Items</p>
            <p className="text-2xl font-display font-bold mt-0.5">{items?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Categories</p>
            <p className="text-2xl font-display font-bold mt-0.5">{categories.length}</p>
          </CardContent>
        </Card>
        <Card className={`shadow-card border-0 ${lowStockCount > 0 ? 'border-l-4 border-l-red-500' : ''}`}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {lowStockCount > 0 && <AlertTriangle className="w-3 h-3 text-red-500" />}
              Low Stock Alerts
            </p>
            <p className={`text-2xl font-display font-bold mt-0.5 ${lowStockCount > 0 ? 'text-red-600' : ''}`}>
              {lowStockCount}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-display font-bold mt-0.5">
              {formatCurrency((items ?? []).reduce((s, i) => s + Number(i.quantityInStock) * i.unitCost, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-0">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No inventory items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold text-center">In Stock</TableHead>
                    <TableHead className="font-semibold text-center">Min Threshold</TableHead>
                    <TableHead className="font-semibold text-right">Unit Cost</TableHead>
                    <TableHead className="font-semibold">Supplier</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(item => {
                    const isLow = lowStockIds.has(item.id.toString());
                    return (
                      <TableRow key={item.id.toString()} className={`hover:bg-muted/30 transition-colors ${isLow ? 'bg-red-50/50' : ''}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm font-mono">{item.sku || '—'}</TableCell>
                        <TableCell className="text-sm">
                          <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium">{item.category || '—'}</span>
                        </TableCell>
                        <TableCell className={`text-center font-semibold ${isLow ? 'text-red-600' : ''}`}>
                          {item.quantityInStock.toString()}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground text-sm">
                          {item.minimumStockThreshold.toString()}
                        </TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(item.unitCost)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{item.supplier || '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => navigate({ to: '/inventory/$id', params: { id: item.id.toString() } })}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => { setEditItem(item); setShowForm(true); }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <InventoryForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditItem(null); }}
        editItem={editItem}
      />

      <AlertDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently remove this item from inventory.
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
