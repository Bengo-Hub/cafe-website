'use client';

import { Card } from '@/components/ui';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Calendar,
    Download,
    PieChart,
    TrendingUp
} from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi, AnalyticsSummary } from '@/lib/api/analytics';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';

export default function StaffAnalytics() {
  const { data: summary, isLoading, error } = useQuery<AnalyticsSummary>({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary(),
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => analyticsApi.getInventoryStats(),
  });

  if (isLoading) return <div className="p-10 animate-pulse text-center">Loading insights...</div>;
  if (error) return <div className="p-10 text-red-500 text-center">Failed to load analytics. Ensure you have a PROFESSIONAL plan.</div>;

  const stats = [
    { label: 'Total Revenue', value: `KES ${(summary?.totalRevenue ?? 0).toLocaleString()}`, change: '+14%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Orders', value: (summary?.totalOrders ?? 0).toString(), change: '+8%', icon: BarChart3, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
    { label: 'Inventory Items', value: (inventory?.total_items ?? 0).toString(), change: 'Stable', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Avg. Order', value: `KES ${((summary?.totalRevenue ?? 0) / (summary?.totalOrders || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, change: '-2%', icon: PieChart, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

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
        {stats.map((stat, idx) => (
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

      <div className="grid gap-10 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-10 magical-card border-none">
          <h2 className="text-xl font-black text-primary-brand mb-8">Revenue Trend</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.trend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(val) => `KES ${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-8 magical-card border-none space-y-6">
            <h3 className="text-lg font-black text-primary-brand">Top Selling Items</h3>
            <div className="space-y-4">
              {summary?.topSellingItems.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-brand-beige/5 flex items-center justify-center text-xs font-black text-brand-orange">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-bold text-primary-brand truncate max-w-[150px]">
                      {item.nameSnapshot}
                    </span>
                  </div>
                  <span className="text-sm font-black text-secondary-brand">{item.quantity} units</span>
                </div>
              ))}
              {summary?.topSellingItems.length === 0 && (
                <p className="text-center text-sm text-secondary-brand opacity-40 py-10">No sales data yet</p>
              )}
            </div>
          </Card>

          <Card className="p-8 magical-card border-none bg-brand-dark text-white">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-5 w-5 text-brand-orange" />
              <h3 className="text-lg font-black">Metrics Distribution</h3>
            </div>
            <div className="space-y-4">
              {summary?.ordersByStatus && Object.entries(summary.ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-brand-beige/60 capitalize">{status.replace('_', ' ')}</span>
                  <span className="font-black text-brand-orange">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
