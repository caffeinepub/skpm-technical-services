import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateInventoryItem, useUpdateInventoryItem } from '../hooks/useQueries';
import { type InventoryItem } from '../backend';
import { nowTimestamp } from '../lib/utils';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  editItem?: InventoryItem | null;
}

export default function InventoryForm({ open, onClose, editItem }: Props) {
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [minThreshold, setMinThreshold] = useState('5');
  const [unitCost, setUnitCost] = useState('0');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setSku(editItem.sku);
      setCategory(editItem.category);
      setQuantity(editItem.quantityInStock.toString());
      setMinThreshold(editItem.minimumStockThreshold.toString());
      setUnitCost(editItem.unitCost.toString());
      setSupplier(editItem.supplier);
      setNotes(editItem.notes);
    } else {
      setName('');
      setSku('');
      setCategory('');
      setQuantity('0');
      setMinThreshold('5');
      setUnitCost('0');
      setSupplier('');
      setNotes('');
    }
  }, [editItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const now = nowTimestamp();
    const data: InventoryItem = {
      id: editItem?.id ?? BigInt(0),
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim(),
      quantityInStock: BigInt(parseInt(quantity) || 0),
      minimumStockThreshold: BigInt(parseInt(minThreshold) || 0),
      unitCost: parseFloat(unitCost) || 0,
      supplier: supplier.trim(),
      notes: notes.trim(),
      createdAt: editItem?.createdAt ?? now,
      updatedAt: now,
    };
    try {
      if (editItem) {
        await updateItem.mutateAsync({ id: editItem.id, item: data });
        toast.success('Item updated');
      } else {
        await createItem.mutateAsync(data);
        toast.success('Item added to inventory');
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save item';
      toast.error(msg);
    }
  };

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{editItem ? 'Edit Item' : 'Add Inventory Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="iname">Item Name *</Label>
              <Input
                id="iname"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. HVAC Filter"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU / Part #</Label>
              <Input
                id="sku"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="PART-001"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="HVAC, Electrical..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="Supplier name"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qty">Qty in Stock</Label>
              <Input
                id="qty"
                type="number"
                min="0"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minQty">Min Threshold</Label>
              <Input
                id="minQty"
                type="number"
                min="0"
                value={minThreshold}
                onChange={e => setMinThreshold(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost">Unit Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={e => setUnitCost(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inotes">Notes</Label>
            <Textarea
              id="inotes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional notes..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editItem ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
