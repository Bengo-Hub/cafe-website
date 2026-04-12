'use client';

import { Badge, Button, Card, Pagination } from '@/components/ui';
import {
    type OrderStatus,
    cancelOrder,
    fetchAdminOrders,
    updateOrderStatus,
    assignOrderRider,
} from '@/lib/api/orders';
import { fetchRiders } from '@/lib/api/riders';
import { CrudModal } from '@/components/dashboard/CrudModal';
import { AssignRiderForm } from '@/components/forms/AssignRiderForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    ChefHat,
    Clock,
    Loader2,
    Package,
    RefreshCw,
    Search,
    ShoppingBag,
    Truck,
    X,
    XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-500/10', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'text-brand-gold', bg: 'bg-brand-gold/10', icon: ChefHat },
  ready: { label: 'Ready', color: 'text-green-500', bg: 'bg-green-500/10', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-brand-orange', bg: 'bg-brand-orange/10', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
  refunded: { label: 'Refunded', color: 'text-gray-500', bg: 'bg-gray-500/10', icon: AlertTriangle },
};

const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'completed',
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'out_for_delivery',
  out_for_delivery: 'delivered',
  delivered: 'completed',
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatCurrency(amount: number, currency = 'KES') {
  return `${currency} ${amount.toLocaleString()}`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function OrderManagement() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [assignRiderOpen, setAssignRiderOpen] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState('');

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-orders', statusFilter, search, page, dateFrom, dateTo],
    queryFn: () =>
      fetchAdminOrders({
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        limit: 20,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
    refetchInterval: 30_000,
  });

  const listResponse = data?.data;
  const orders = listResponse?.data ?? [];
  const total = listResponse?.total ?? 0;
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null;

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      cancelOrder(orderId, reason),
    onSuccess: () => {
      setCancelDialogOpen(false);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const assignRiderMutation = useMutation({
    mutationFn: ({ orderId, riderId }: { orderId: string; riderId: string }) =>
      assignOrderRider(orderId, riderId),
    onSuccess: () => {
      setAssignRiderOpen(false);
      setSelectedRiderId('');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const { data: ridersRes } = useQuery({
    queryKey: ['admin-riders', 'active'],
    queryFn: () => fetchRiders({ status: 'active' }),
    enabled: assignRiderOpen,
  });

  const activeRiders = ridersRes ?? [];

  const handleAdvanceStatus = () => {
    if (!selectedOrder) return;
    const next = NEXT_STATUS[selectedOrder.status];
    if (next) {
      statusMutation.mutate({ orderId: selectedOrder.id, status: next });
    }
  };

  const handleCancelOrder = () => {
    if (!selectedOrder || !cancelReason.trim()) return;
    cancelMutation.mutate({ orderId: selectedOrder.id, reason: cancelReason.trim() });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary-brand md:text-4xl">
            Order Management
          </h1>
          <p className="font-light text-secondary-brand">
            Manage and track all active orders in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-brand opacity-40" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-10 w-56 rounded-xl border border-brand-beige/10 bg-brand-beige/5 pl-10 pr-4 text-sm text-primary-brand transition-all focus:border-brand-orange/50 focus:outline-none"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-brand-beige/10 bg-brand-beige/5 px-3 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-brand-beige/10 bg-brand-beige/5 px-3 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-brand-beige/10 bg-brand-beige/5 px-3 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
          />

          {/* Refresh */}
          <Button
            variant="outline"
            className="h-10 rounded-xl border-brand-beige/10 bg-brand-beige/5 px-3 text-primary-brand"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
          <span className="ml-3 text-secondary-brand">Loading orders...</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
          <p className="text-lg font-bold text-primary-brand">Failed to load orders</p>
          <p className="mb-4 text-sm text-secondary-brand">
            Check your connection and try again.
          </p>
          <Button onClick={() => refetch()} className="rounded-xl bg-brand-orange text-white">
            Retry
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="mb-3 h-10 w-10 text-secondary-brand opacity-30" />
          <p className="text-lg font-bold text-primary-brand">No orders found</p>
          <p className="text-sm text-secondary-brand">
            {statusFilter ? 'Try a different filter.' : 'Orders will appear here once placed.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Orders list */}
          <div className="space-y-3 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-60">
              {orders.length} order{orders.length !== 1 && 's'}
              {total > orders.length && ` of ${total}`}
            </p>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <motion.div
                    key={order.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                      isSelected
                        ? 'border-brand-orange bg-brand-orange/10 shadow-lg shadow-brand-orange/10'
                        : 'border-transparent bg-brand-beige/5 hover:border-brand-beige/20'
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="font-black text-primary-brand">{order.orderNumber}</p>
                        <p className="text-sm text-secondary-brand">{order.customerName || 'Guest'}</p>
                      </div>
                      <Badge className={`${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-secondary-brand opacity-60">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="h-3 w-3" />
                        <span>{order.items.length} items</span>
                      </div>
                      <span className="font-black text-primary-brand">
                        {formatCurrency(order.grandTotal, order.currency)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {/* Pagination */}
            <Pagination
              page={page}
              pageSize={20}
              total={total}
              onPageChange={setPage}
              itemLabel="orders"
            />
          </div>

          {/* Order detail */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <Card className="magical-card space-y-8 border-none p-8">
                {/* Order header */}
                <div className="flex items-center justify-between border-b border-brand-beige/10 pb-6">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-primary-brand md:text-3xl">
                      {selectedOrder.orderNumber}
                    </h2>
                    <p className="text-secondary-brand">
                      {selectedOrder.customerName || 'Guest'} &bull; {selectedOrder.channel}
                      {selectedOrder.deliveryAddress && ' (Delivery)'}
                    </p>
                    <p className="mt-1 text-xs text-secondary-brand opacity-60">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-40">
                      Total
                    </p>
                    <p className="text-2xl font-black text-brand-orange md:text-3xl">
                      {formatCurrency(selectedOrder.grandTotal, selectedOrder.currency)}
                    </p>
                    {selectedOrder.discountTotal > 0 && (
                      <p className="text-xs text-green-500">
                        Discount: -{formatCurrency(selectedOrder.discountTotal, selectedOrder.currency)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status timeline */}
                <div className="relative flex items-center justify-between overflow-x-auto px-2">
                  <div className="absolute inset-x-0 h-0.5 bg-brand-beige/10" />
                  {STATUS_FLOW.map((step, idx) => {
                    const stepIdx = STATUS_FLOW.indexOf(selectedOrder.status);
                    const isCompleted = idx <= stepIdx;
                    const isCurrent = step === selectedOrder.status;
                    const cfg = STATUS_CONFIG[step];
                    const Icon = cfg.icon;
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                            isCompleted
                              ? 'border-brand-orange bg-brand-orange text-white'
                              : 'border-brand-beige/20 bg-white text-secondary-brand dark:bg-brand-dark'
                          } ${isCurrent ? 'ring-2 ring-brand-orange/30 ring-offset-2' : ''}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className={`whitespace-nowrap text-[9px] font-black uppercase tracking-widest ${
                            isCompleted ? 'text-brand-orange' : 'text-secondary-brand opacity-40'
                          }`}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black tracking-tight text-primary-brand">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-brand-beige/10 bg-brand-beige/5 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10 font-black text-brand-orange">
                            {item.quantity}x
                          </div>
                          <span className="font-bold text-primary-brand">{item.name}</span>
                        </div>
                        <span className="font-black text-primary-brand">
                          {formatCurrency(item.totalPrice, selectedOrder.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals summary */}
                  <div className="space-y-1 rounded-xl bg-brand-beige/5 p-4 text-sm">
                    <div className="flex justify-between text-secondary-brand">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}</span>
                    </div>
                    {selectedOrder.deliveryFee > 0 && (
                      <div className="flex justify-between text-secondary-brand">
                        <span>Delivery Fee</span>
                        <span>
                          {formatCurrency(selectedOrder.deliveryFee, selectedOrder.currency)}
                        </span>
                      </div>
                    )}
                    {selectedOrder.discountTotal > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>Discount</span>
                        <span>
                          -{formatCurrency(selectedOrder.discountTotal, selectedOrder.currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-brand-beige/10 pt-1 font-black text-primary-brand">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.grandTotal, selectedOrder.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer & delivery info */}
                {(selectedOrder.deliveryAddress || selectedOrder.instructions) && (
                  <div className="space-y-2 rounded-xl border border-brand-beige/10 bg-brand-beige/5 p-4">
                    {selectedOrder.deliveryAddress && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-40">
                          Delivery Address
                        </p>
                        <p className="text-sm text-primary-brand">{selectedOrder.deliveryAddress}</p>
                      </div>
                    )}
                    {selectedOrder.instructions && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-secondary-brand opacity-40">
                          Special Instructions
                        </p>
                        <p className="text-sm text-primary-brand">{selectedOrder.instructions}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 border-t border-brand-beige/10 pt-6">
                  {NEXT_STATUS[selectedOrder.status] && (
                    <Button
                      className="h-12 rounded-2xl bg-brand-orange px-6 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-orange/20 hover:bg-brand-orange/90"
                      onClick={handleAdvanceStatus}
                      disabled={statusMutation.isPending}
                    >
                      {statusMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {STATUS_CONFIG[NEXT_STATUS[selectedOrder.status]!].label}
                    </Button>
                  )}
                  {selectedOrder.deliveryAddress && !['delivered', 'completed', 'cancelled', 'refunded'].includes(selectedOrder.status) && (
                    <Button
                      variant="outline"
                      className="h-12 rounded-2xl border-brand-orange/20 bg-brand-orange/5 px-6 text-xs font-black uppercase tracking-widest text-brand-orange hover:bg-brand-orange/10"
                      onClick={() => setAssignRiderOpen(true)}
                    >
                      Assign Rider
                    </Button>
                  )}
                  {!['cancelled', 'refunded', 'completed', 'delivered'].includes(
                    selectedOrder.status,
                  ) && (
                    <Button
                      variant="outline"
                      className="h-12 rounded-2xl border-red-500/20 bg-red-500/5 px-6 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {/* Status Override */}
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => statusMutation.mutate({ orderId: selectedOrder.id, status: e.target.value as OrderStatus })}
                    className="h-12 rounded-2xl border border-brand-beige/10 bg-brand-beige/5 px-4 text-xs font-black uppercase tracking-widest text-primary-brand focus:border-brand-orange/50 focus:outline-none"
                  >
                    {Object.keys(STATUS_CONFIG).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s as OrderStatus].label}
                      </option>
                    ))}
                  </select>
                </div>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingBag className="mb-3 h-10 w-10 text-secondary-brand opacity-20" />
                <p className="text-secondary-brand">Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel dialog */}
      {cancelDialogOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-brand-dark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-primary-brand">Cancel Order</h3>
              <button
                onClick={() => {
                  setCancelDialogOpen(false);
                  setCancelReason('');
                }}
                className="rounded-lg p-1 hover:bg-brand-beige/10"
              >
                <X className="h-5 w-5 text-secondary-brand" />
              </button>
            </div>
            <p className="mb-4 text-sm text-secondary-brand">
              Cancel order <strong>{selectedOrder.orderNumber}</strong>? This action cannot be
              undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={3}
              className="mb-4 w-full rounded-xl border border-brand-beige/10 bg-brand-beige/5 p-3 text-sm text-primary-brand focus:border-brand-orange/50 focus:outline-none"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => {
                  setCancelDialogOpen(false);
                  setCancelReason('');
                }}
              >
                Keep Order
              </Button>
              <Button
                className="flex-1 rounded-xl bg-red-500 text-white hover:bg-red-600"
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Cancel Order
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Assign Rider Dialog */}
      <CrudModal
        isOpen={assignRiderOpen}
        onClose={() => setAssignRiderOpen(false)}
        title="Assign Delivery Rider"
        description="Select an active rider to fulfill this order"
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedOrder && selectedRiderId) {
            assignRiderMutation.mutate({ orderId: selectedOrder.id, riderId: selectedRiderId });
          }
        }}
        submitLabel="Assign Rider"
        isSubmitting={assignRiderMutation.isPending}
      >
        <AssignRiderForm
          orderNumber={selectedOrder?.orderNumber || ''}
          riders={activeRiders}
          selectedRiderId={selectedRiderId}
          onRiderChange={setSelectedRiderId}
        />
      </CrudModal>
    </div>
  );
}
