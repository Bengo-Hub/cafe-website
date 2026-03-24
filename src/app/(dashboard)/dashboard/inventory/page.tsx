'use client';

import { Badge, Button, Card, Pagination } from '@/components/ui';
import {
  fetchInventoryItems,
  fetchBulkAvailability,
  fetchInventorySummary,
  type InventoryItem,
  type StockAvailability,
  adjustStock,
  createInventoryItem,
  deleteInventoryItem,
  updateInventoryItem,
} from '@/lib/api/inventory';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowDown,
  Box,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CrudModal } from '@/components/dashboard/CrudModal';
import { StockAdjustmentForm } from '@/components/forms/StockAdjustmentForm';
import { InventoryItemForm } from '@/components/forms/InventoryItemForm';

export default function InventoryOverview() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const skuParam = searchParams.get('search');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Modals state
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState('0');
  const [adjustmentReason, setAdjustmentReason] = useState('Restock');

  const [newItem, setNewItem] = useState<{
    name: string;
    description?: string;
    category_id?: string;
    unit_id?: string;
    type?: string;
    initial_quantity?: string | number;
    reorder_level?: string | number;
  }>({
    name: '',
    type: 'GOODS',
    initial_quantity: '1',
    reorder_level: '1',
  });

  const [editingItem, setEditingItem] = useState<{
    sku?: string;
    name: string;
    description?: string;
    category_id?: string;
    unit_id?: string;
    type?: string;
  } | null>(null);

  useEffect(() => {
    if (skuParam) {
      setSearch(skuParam);
    }
  }, [skuParam]);

  // Fetch inventory items from inventory-api
  const { data: itemsRes, isLoading: loadingItems, refetch } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: () => fetchInventoryItems(),
  });

  const allItems: InventoryItem[] = itemsRes?.data ?? [];

  // Fetch stock availability for all SKUs
  const skus = allItems.map((i) => i.sku).filter(Boolean);
  const {
    data: stockData,
    isLoading: loadingStock,
    isError,
  } = useQuery({
    queryKey: ['inventory-stock', skus],
    queryFn: () => fetchBulkAvailability(skus),
    enabled: skus.length > 0,
    refetchInterval: 60_000,
  });

  // Fetch summary for stats
  const { data: summary } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: fetchInventorySummary,
  });

  // Merge items with stock data, apply filters and pagination
  const inventory = useMemo(() => {
    const stockMap = new Map<string, StockAvailability>();
    stockData?.forEach((s) => stockMap.set(s.sku, s));

    return allItems
      .map((item) => {
        const stock = stockMap.get(item.sku);
        return {
          ...item,
          stock: stock || null,
          quantity: stock?.available ?? 0,
          on_hand: stock?.on_hand ?? 0,
          reserved: stock?.reserved ?? 0,
          unit_of_measure: stock?.unit_of_measure || '',
        };
      })
      .filter((item) => {
        if (search && !item.name.toLowerCase().includes(search.toLowerCase()) &&
            !item.sku.toLowerCase().includes(search.toLowerCase())) return false;
        if (filter === 'low') return item.quantity > 0 && item.quantity <= 10;
        if (filter === 'out') return item.quantity === 0;
        return true;
      });
  }, [allItems, stockData, search, filter]);

  // Client-side pagination
  const totalFiltered = inventory.length;
  const paginatedInventory = inventory.slice((page - 1) * pageSize, page * pageSize);

  const totalItems = summary?.total_items ?? allItems.length;
  const lowStockCount = summary?.low_stock_items ?? 0;
  const outOfStockCount = summary?.out_of_stock_items ?? 0;

  const isLoading = loadingItems || loadingStock;

  const adjustStockMutation = useMutation({
    mutationFn: (data: { sku: string; adjustment: number; reason: string }) =>
      adjustStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-stock'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      setIsAdjustmentModalOpen(false);
      setAdjustmentValue('0');
      setAdjustmentReason('Restock');
      toast.success('Stock adjusted successfully');
    },
    onError: (err: Error) => toast.error(`Stock adjustment failed: ${err.message}`),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      setIsItemModalOpen(false);
      setNewItem({ name: '', type: 'GOODS', initial_quantity: '1', reorder_level: '1' });
      toast.success('Inventory item created');
    },
    onError: (err: Error) => toast.error(`Failed to create item: ${err.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: ({ sku, data }: { sku: string; data: any }) => updateInventoryItem(sku, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      setEditingItem(null);
      toast.success('Item updated');
    },
    onError: (err: Error) => toast.error(`Failed to update: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (sku: string) => deleteInventoryItem(sku),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      toast.success('Item deleted');
    },
    onError: (err: Error) => toast.error(`Failed to delete: ${err.message}`),
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary-brand md:text-4xl">
            Inventory
          </h1>
          <p className="font-light text-secondary-brand">
            Track stock levels and availability across your menu.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-brand-beige/10 text-primary-brand"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button
            className="h-10 rounded-xl bg-brand-orange text-white"
            onClick={() => setIsItemModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Stock Item
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border border-brand-beige/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
                Total Items
              </p>
              <p className="text-2xl font-black text-primary-brand">{totalItems}</p>
            </div>
          </div>
        </Card>
        <Card className="border border-brand-beige/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
              <ArrowDown className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-yellow-600">
                Low Stock
              </p>
              <p className="text-2xl font-black text-yellow-600">{lowStockCount}</p>
            </div>
          </div>
        </Card>
        <Card className="border border-brand-beige/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-500">
                Out of Stock
              </p>
              <p className="text-2xl font-black text-red-500">{outOfStockCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex gap-2">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                filter === f
                  ? 'bg-foreground text-background'
                  : 'bg-brand-beige/5 text-secondary-brand hover:bg-brand-beige/10'
              }`}
            >
              {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-brand opacity-40" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-56 rounded-xl border border-brand-beige/10 bg-brand-beige/5 pl-10 pr-4 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Inventory table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
          <p className="font-bold text-primary-brand">Failed to load inventory data</p>
          <p className="mb-4 text-sm text-secondary-brand">
            The inventory service may be unavailable.
          </p>
          <Button onClick={() => refetch()} className="rounded-xl bg-brand-orange text-white">
            Retry
          </Button>
        </div>
      ) : paginatedInventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Box className="mb-3 h-10 w-10 text-secondary-brand opacity-30" />
          <p className="font-bold text-primary-brand">No items found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-beige/10 text-left text-xs font-black uppercase tracking-widest text-secondary-brand opacity-60">
                <th className="pb-3 pr-4">Item</th>
                <th className="pb-3 pr-4">SKU</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">In Stock</th>
                <th className="pb-3 pr-4">Reserved</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInventory.map((item) => {
                const isLow = item.quantity > 0 && item.quantity <= 10;
                const isOut = item.quantity === 0;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-brand-beige/5 transition-colors hover:bg-brand-beige/5"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-bold text-primary-brand">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-secondary-brand truncate max-w-[200px]">{item.description}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-secondary-brand">{item.sku}</td>
                    <td className="py-3 pr-4">
                      <Badge className="bg-brand-beige/10 text-secondary-brand text-[10px]">
                        {item.type}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`font-black ${isOut ? 'text-red-500' : isLow ? 'text-yellow-600' : 'text-green-600'}`}
                      >
                        {item.quantity} {item.unit_of_measure || 'pcs'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-secondary-brand">{item.reserved}</td>
                    <td className="py-3 pr-4">
                      {isOut ? (
                        <Badge className="bg-red-500/10 text-red-500">Out of Stock</Badge>
                      ) : isLow ? (
                        <Badge className="bg-yellow-500/10 text-yellow-600">Low Stock</Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-600">In Stock</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSku(item.sku);
                            setIsAdjustmentModalOpen(true);
                          }}
                          className="p-2 rounded-lg hover:bg-brand-orange/10 text-brand-orange"
                          title="Adjust Stock"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingItem({
                            sku: item.sku,
                            name: item.name,
                            description: item.description,
                            category_id: item.category_id,
                            unit_id: item.unit_id,
                            type: item.type,
                          })}
                          className="p-2 rounded-lg hover:bg-brand-beige/10 text-secondary-brand"
                          title="Edit Details"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete inventory record for ${item.sku}?`)) {
                              deleteMutation.mutate(item.sku);
                            }
                          }}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={totalFiltered}
        onPageChange={setPage}
        itemLabel="inventory items"
      />

      {/* Adjustment Modal */}
      <CrudModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title="Adjust Stock Levels"
        description={`Update inventory for SKU: ${selectedSku}`}
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedSku) {
            adjustStockMutation.mutate({
              sku: selectedSku,
              adjustment: parseFloat(adjustmentValue),
              reason: adjustmentReason,
            });
          }
        }}
        submitLabel="Update Inventory"
        isSubmitting={adjustStockMutation.isPending}
      >
        <StockAdjustmentForm
          adjustmentValue={adjustmentValue}
          adjustmentReason={adjustmentReason}
          onValueChange={setAdjustmentValue}
          onReasonChange={setAdjustmentReason}
        />
      </CrudModal>

      {/* Add Item Modal */}
      <CrudModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="Add Inventory Item"
        description="Register a new product in the inventory system"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate({
            ...newItem,
            initial_quantity: parseFloat(String(newItem.initial_quantity ?? '1')),
            reorder_level: parseFloat(String(newItem.reorder_level ?? '1')),
          });
        }}
        submitLabel="Create Item"
        isSubmitting={createMutation.isPending}
      >
        <InventoryItemForm
          data={newItem}
          onChange={(data) => setNewItem(data)}
        />
      </CrudModal>

      {/* Edit Item Modal */}
      {editingItem && (
        <CrudModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title="Edit Inventory Details"
          description={`Updating record for ${editingItem.sku}`}
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate({
              sku: editingItem.sku!,
              data: {
                name: editingItem.name,
                description: editingItem.description,
                category_id: editingItem.category_id,
                unit_id: editingItem.unit_id,
                type: editingItem.type,
              },
            });
          }}
          submitLabel="Save Changes"
          isSubmitting={updateMutation.isPending}
        >
          <InventoryItemForm
            data={editingItem}
            onChange={(data) => setEditingItem(data)}
            isEdit
          />
        </CrudModal>
      )}
    </div>
  );
}
