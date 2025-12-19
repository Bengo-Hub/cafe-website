'use client';

import { Card } from '@/components/ui';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Calendar,
    Download,
    PieChart,
    TrendingUp,
    Users
} from 'lucide-react';

export default function StaffAnalytics() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary-brand tracking-tight">Analytics</h1>
          <p className="text-secondary-brand font-light">Insights and performance metrics for Urban Loft Cafe.</p>
        </div>
        
        <button className="h-12 px-6 rounded-xl bg-brand-beige/5 border border-brand-beige/10 text-primary-brand font-bold text-sm flex items-center gap-2 hover:bg-brand-beige/10 transition-all">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </header>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: 'KES 142,500', change: '+14%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Total Orders', value: '342', change: '+8%', icon: BarChart3, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
          { label: 'New Customers', value: '48', change: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Avg. Order Value', value: 'KES 416', change: '-2%', icon: PieChart, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-6 magical-card border-none">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className={`text-xs font-black ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-secondary-brand opacity-60">{stat.label}</p>
                <p className="text-2xl font-black text-primary-brand mt-1">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analytics Placeholder */}
      <div className="grid gap-10 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-10 magical-card border-none min-h-[500px] flex flex-col items-center justify-center text-center space-y-6">
          <div className="h-24 w-24 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <BarChart3 className="h-12 w-12" />
          </div>
          <div className="max-w-md">
            <h2 className="text-2xl font-black text-primary-brand">Superset Dashboard Integration</h2>
            <p className="text-secondary-brand mt-2 font-light">
              This section will embed real-time interactive dashboards from Apache Superset once the analytics service is fully integrated.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="h-2 w-24 bg-brand-orange/20 rounded-full overflow-hidden">
              <div className="h-full bg-brand-orange w-2/3 animate-pulse" />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-8 magical-card border-none space-y-6">
            <h3 className="text-lg font-black text-primary-brand">Top Selling Items</h3>
            <div className="space-y-4">
              {[
                { name: 'Urban Loft Burger', sales: 124, trend: 'up' },
                { name: 'Cappuccino', sales: 98, trend: 'up' },
                { name: 'Caramel Latte', sales: 76, trend: 'down' },
                { name: 'Club Sandwich', sales: 64, trend: 'up' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-brand-beige/5 flex items-center justify-center text-xs font-black text-brand-orange">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-bold text-primary-brand">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-secondary-brand">{item.sales}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 magical-card border-none bg-brand-dark text-white">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-5 w-5 text-brand-orange" />
              <h3 className="text-lg font-black">Peak Hours</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-beige/60">12:00 PM - 02:00 PM</span>
                <span className="font-black text-brand-orange">High</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-beige/60">08:00 AM - 10:00 AM</span>
                <span className="font-black text-brand-gold">Medium</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-beige/60">04:00 PM - 06:00 PM</span>
                <span className="font-black text-brand-gold">Medium</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
