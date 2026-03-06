'use client';

import { Card } from '@/components/ui';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    Package,
    ShoppingBag,
    TrendingUp
} from 'lucide-react';

export default function StaffDashboard() {
  const stats = [
    { label: 'Active Orders', value: '12', icon: ShoppingBag, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
    { label: 'Preparing', value: '5', icon: Clock, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
    { label: 'Ready for Pickup', value: '3', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Dispatched', value: '4', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-primary-brand tracking-tight">Staff Dashboard</h1>
        <p className="text-secondary-brand font-light">Welcome back! Here's what's happening at Urban Loft today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
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
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-500">
                <TrendingUp className="h-3 w-3" />
                <span>+12% from yesterday</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-primary-brand tracking-tight">Recent Orders</h2>
          <button className="text-sm font-bold text-brand-orange hover:underline">View All</button>
        </div>
        
        <Card className="magical-card border-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-beige/10">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Order ID</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Customer</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Items</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Status</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Total</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-secondary-brand opacity-40">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/5">
                {[
                  { id: '#ORD-7281', customer: 'John Doe', items: '2x Cappuccino, 1x Burger', status: 'Preparing', total: 'KES 1,450' },
                  { id: '#ORD-7282', customer: 'Jane Smith', items: '1x Latte, 1x Croissant', status: 'Ready', total: 'KES 850' },
                  { id: '#ORD-7283', customer: 'Mike Ross', items: '3x Espresso', status: 'Confirmed', total: 'KES 900' },
                ].map((order, idx) => (
                  <tr key={idx} className="group hover:bg-brand-orange/5 transition-colors">
                    <td className="p-6 font-bold text-primary-brand">{order.id}</td>
                    <td className="p-6 text-secondary-brand">{order.customer}</td>
                    <td className="p-6 text-secondary-brand text-sm">{order.items}</td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'Ready' ? 'bg-green-500/10 text-green-500' : 
                        order.status === 'Preparing' ? 'bg-brand-gold/10 text-brand-gold' : 
                        'bg-brand-orange/10 text-brand-orange'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-6 font-black text-primary-brand">{order.total}</td>
                    <td className="p-6">
                      <button className="text-xs font-black uppercase tracking-widest text-brand-orange hover:underline">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
