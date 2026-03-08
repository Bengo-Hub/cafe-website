'use client';

import { Card } from '@/components/ui';
import { fetchAdminOrders, type Order } from '@/lib/api/orders';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    Loader2,
    Package,
    ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';

function formatCurrency(amount: number, currency = 'KES') {
  return `${currency} ${amount.toLocaleString()}`;
}

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfTodayISO() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export default function StaffDashboard() {
  const todayStart = todayISO();
  const todayEnd = endOfTodayISO();

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ['dashboard-orders', todayStart, todayEnd],
    queryFn: () =>
      fetchAdminOrders({
        limit: 50,
        date_from: todayStart,
        date_to: todayEnd,
      }),
  });

  const { data: recentRes } = useQuery({
    queryKey: ['dashboard-recent-orders'],
    queryFn: () => fetchAdminOrders({ limit: 10 }),
  });

  const list = ordersRes?.data;
  const orders = list?.data ?? [];
  const recentOrders = recentRes?.data?.data ?? [];

  const ordersToday = orders.length;
  const revenueToday = orders.reduce((sum: number, o: Order) => sum + (o.total ?? 0), 0);
  const preparing = orders.filter((o: Order) => o.status === 'preparing').length;
  const ready = orders.filter((o: Order) => o.status === 'ready').length;

  const stats = [
    { label: 'Orders Today', value: ordersToday, icon: ShoppingBag, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
    { label: 'Preparing', value: preparing, icon: Clock, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
    { label: 'Ready for Pickup', value: ready, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: "Today's Revenue", value: formatCurrency(revenueToday), icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-primary-brand tracking-tight">Staff Dashboard</h1>
        <p className="text-secondary-brand font-light">Welcome back! Here&apos;s what&apos;s happening at Urban Loft today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
          </div>
        ) : (
          stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-6 magical-card border-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-brand opacity-60">{stat.label}</p>
                    <p className="text-3xl font-black text-primary-brand mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Recent Orders Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-primary-brand tracking-tight">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm font-bold text-brand-orange hover:underline">
            View All
          </Link>
        </div>

        <Card className="magical-card border-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-beige/10">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Order</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Customer</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Items</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Status</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Total</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/5">
                {recentOrders.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-secondary-brand">
                      No recent orders.
                    </td>
                  </tr>
                ) : (
                  recentOrders.slice(0, 10).map((order: Order) => (
                    <tr key={order.id} className="group hover:bg-brand-orange/5 transition-colors">
                      <td className="p-6 font-bold text-primary-brand">{order.order_number}</td>
                      <td className="p-6 text-secondary-brand">{order.customer_name}</td>
                      <td className="p-6 text-secondary-brand text-sm">{order.items?.length ?? 0} items</td>
                      <td className="p-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-orange/10 text-brand-orange">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-6 font-black text-primary-brand">
                        {formatCurrency(order.total ?? 0, order.currency)}
                      </td>
                      <td className="p-6">
                        <Link
                          href="/dashboard/orders"
                          className="text-xs font-black uppercase tracking-widest text-brand-orange hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
