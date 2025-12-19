'use client';

import { Badge, Button, Card } from '@/components/ui';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    Filter,
    Package,
    Search,
    ShoppingBag,
    Truck
} from 'lucide-react';
import { useState } from 'react';

const ORDERS = [
  { 
    id: '#ORD-7281', 
    customer: 'John Doe', 
    items: [
      { name: 'Cappuccino', qty: 2, price: 'KES 700' },
      { name: 'Urban Loft Burger', qty: 1, price: 'KES 750' }
    ],
    status: 'Preparing', 
    total: 'KES 1,450',
    time: '12:45 PM',
    type: 'Delivery'
  },
  { 
    id: '#ORD-7282', 
    customer: 'Jane Smith', 
    items: [
      { name: 'Latte', qty: 1, price: 'KES 400' },
      { name: 'Butter Croissant', qty: 1, price: 'KES 450' }
    ],
    status: 'Ready', 
    total: 'KES 850',
    time: '1:15 PM',
    type: 'Pickup'
  },
  { 
    id: '#ORD-7283', 
    customer: 'Mike Ross', 
    items: [
      { name: 'Espresso', qty: 3, price: 'KES 900' }
    ],
    status: 'Confirmed', 
    total: 'KES 900',
    time: '1:30 PM',
    type: 'Delivery'
  },
];

const STATUS_STEPS = [
  { label: 'Confirmed', icon: CheckCircle2, color: 'text-blue-500' },
  { label: 'Preparing', icon: Clock, color: 'text-brand-gold' },
  { label: 'Ready', icon: CheckCircle2, color: 'text-green-500' },
  { label: 'Packaged', icon: Package, color: 'text-purple-500' },
  { label: 'Dispatched', icon: Truck, color: 'text-brand-orange' },
];

export default function OrderManagement() {
  const [selectedOrder, setSelectedOrder] = useState(ORDERS[0]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary-brand tracking-tight">Order Management</h1>
          <p className="text-secondary-brand font-light">Manage and track all active orders in real-time.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-brand opacity-40" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="h-12 pl-12 pr-6 rounded-xl bg-brand-beige/5 border border-brand-beige/10 text-primary-brand focus:outline-none focus:border-brand-orange/50 transition-all w-64"
            />
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-xl border-brand-beige/10 bg-brand-beige/5 text-primary-brand">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Orders List */}
        <div className="lg:col-span-1 space-y-4">
          {ORDERS.map((order) => (
            <motion.div
              key={order.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedOrder(order)}
              className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all ${
                selectedOrder.id === order.id 
                  ? 'bg-brand-orange/10 border-brand-orange shadow-lg shadow-brand-orange/10' 
                  : 'bg-brand-beige/5 border-transparent hover:border-brand-beige/20'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-lg font-black text-primary-brand">{order.id}</p>
                  <p className="text-sm text-secondary-brand">{order.customer}</p>
                </div>
                <Badge className={
                  order.status === 'Ready' ? 'bg-green-500/10 text-green-500' : 
                  order.status === 'Preparing' ? 'bg-brand-gold/10 text-brand-gold' : 
                  'bg-brand-orange/10 text-brand-orange'
                }>
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-secondary-brand opacity-60">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{order.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-3 w-3" />
                  <span>{order.items.length} items</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Details */}
        <div className="lg:col-span-2">
          <Card className="magical-card border-none p-10 space-y-10">
            <div className="flex items-center justify-between border-b border-brand-beige/10 pb-8">
              <div>
                <h2 className="text-3xl font-black text-primary-brand tracking-tight">Order Details</h2>
                <p className="text-secondary-brand font-light">Order {selectedOrder.id} • {selectedOrder.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-secondary-brand opacity-40 uppercase tracking-widest">Total Amount</p>
                <p className="text-3xl font-black text-brand-orange">{selectedOrder.total}</p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="relative flex justify-between items-center px-4">
              <div className="absolute left-0 right-0 h-0.5 bg-brand-beige/10 -z-10"></div>
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = STATUS_STEPS.findIndex(s => s.label === selectedOrder.status) >= idx;
                return (
                  <div key={idx} className="flex flex-col items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted ? 'bg-brand-orange border-brand-orange text-white' : 'bg-brand-light dark:bg-brand-dark border-brand-beige/20 text-secondary-brand'
                    }`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-brand-orange' : 'text-secondary-brand opacity-40'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Items List */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-primary-brand tracking-tight">Order Items</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-brand-beige/5 border border-brand-beige/10">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange font-black">
                        {item.qty}x
                      </div>
                      <span className="font-bold text-primary-brand">{item.name}</span>
                    </div>
                    <span className="font-black text-primary-brand">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-brand-beige/10">
              <Button className="h-14 px-8 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-orange/20">
                Update Status
              </Button>
              <Button variant="outline" className="h-14 px-8 rounded-2xl border-brand-beige/10 bg-brand-beige/5 text-primary-brand font-black uppercase tracking-widest text-xs">
                Print Receipt
              </Button>
              <Button variant="outline" className="h-14 px-8 rounded-2xl border-red-500/20 bg-red-500/5 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500/10">
                Cancel Order
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
