'use client';

import { Badge, Button, Card } from '@/components/ui';
import { fetchMenuItems, type MenuItem } from '@/lib/api/catalog';
import { fetchBulkAvailability, type StockAvailability } from '@/lib/api/inventory';
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
import { adjustStock, createInventoryItem, deleteInventoryItem, updateInventoryItem } from '@/lib/api/inventory';
import { StockAdjustmentForm } from '@/components/forms/StockAdjustmentForm';
import { InventoryItemForm } from '@/components/forms/InventoryItemForm';

export default function InventoryOverview() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const skuParam = searchParams.get('search');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals state
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState('0');
  const [adjustmentReason, setAdjustmentReason] = useState('Restock');
  
  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    unit: 'pcs',
    initial_quantity: '0',
  });

  const [editingItem, setEditingItem] = useState<{sku: string, name: string, unit: string} | null>(null);

  useEffect(() => {
    if (skuParam) {
      setSearch(skuParam);
    }
  }, [skuParam]);

  // Fetch all menu items to get SKUs
  const { data: itemsRes, isLoading: loadingItems } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: () => fetchMenuItems({ limit: 200 }),
  });

  const items = itemsRes?.data?.items ?? [];
  const skus = items.map((i: MenuItem) => i.sku).filter(Boolean);

  // Fetch stock availability for all SKUs
  const {
    data: stockData,
    isLoading: loadingStock,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['inventory-stock', skus],
    queryFn: () => fetchBulkAvailability(skus),
    enabled: skus.length > 0,
    refetchInterval: 60_000,
  });

  // Merge items with stock data
  const inventory = useMemo(() => {
    const stockMap = new Map<string, StockAvailability>();
    stockData?.forEach((s) => stockMap.set(s.sku, s));

    return items
      .map((item: MenuItem) => ({
        ...item,
        stock: stockMap.get(item.sku) || null,
        quantity: stockMap.get(item.sku)?.quantity ?? 0,
        reserved: stockMap.get(item.sku)?.reserved ?? 0,
      }))
      .filter((item) => {
        if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filter === 'low') return item.quantity > 0 && item.quantity <= 10;
        if (filter === 'out') return item.quantity === 0;
        return true;
      });
  }, [items, stockData, search, filter]);

  const totalItems = items.length;
  const lowStockCount = items.filter((i: MenuItem) => {
    const s = stockData?.find((s) => s.sku === i.sku);
    return s && s.quantity > 0 && s.quantity <= 10;
  }).length;
  const outOfStockCount = items.filter((i: MenuItem) => {
    const s = stockData?.find((s) => s.sku === i.sku);
    return s && s.quantity === 0;
  }).length;

  const isLoading = loadingItems || loadingStock;

  const adjustStockMutation = useMutation({
    mutationFn: (data: { sku: string; adjustment: number; reason: string }) =>
      adjustStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-stock'] });
      setIsAdjustmentModalOpen(false);
      setAdjustmentValue('0');
      setAdjustmentReason('Restock');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      setIsItemModalOpen(false);
      setNewItem({ sku: '', name: '', unit: 'pcs', initial_quantity: '0' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ sku, data }: { sku: string; data: any }) => updateInventoryItem(sku, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (sku: string) => deleteInventoryItem(sku),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
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
            placeholder="Search by name..."
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
      ) : inventory.length === 0 ? (
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
                <th className="pb-3 pr-4">Price</th>
                <th className="pb-3 pr-4">In Stock</th>
                <th className="pb-3 pr-4">Reserved</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const isLow = item.quantity > 0 && item.quantity <= 10;
                const isOut = item.quantity === 0;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-brand-beige/5 transition-colors hover:bg-brand-beige/5"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-bold text-primary-brand">{item.name}</p>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-secondary-brand">{item.sku}</td>
                    <td className="py-3 pr-4 font-black text-primary-brand">
                      {item.currency} {item.price.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`font-black ${isOut ? 'text-red-500' : isLow ? 'text-yellow-600' : 'text-green-600'}`}
                      >
                        {item.quantity} {item.stock?.unit || 'pcs'}
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
                          onClick={() => setEditingItem({ sku: item.sku, name: item.name, unit: item.stock?.unit || 'pcs' })}
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
        description="Registry a new product SKU in the inventory system"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate({
            ...newItem,
            initial_quantity: parseFloat(newItem.initial_quantity),
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
              sku: editingItem.sku,
              data: { name: editingItem.name, unit: editingItem.unit }
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
