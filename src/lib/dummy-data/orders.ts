export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress?: string;
  logisticsTask?: LogisticsTask;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface LogisticsTask {
  id: string;
  orderId: string;
  riderName: string;
  riderPhone: string;
  vehicle: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
  etaMinutes: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'arrived' | 'completed';
}

export const dummyOrder: Order = {
  id: 'order-12345',
  customerName: 'John Doe',
  customerPhone: '+254712345678',
  items: [
    { id: 'item-1', name: 'Urban Loft Burger', quantity: 1, price: 850 },
    { id: 'item-5', name: 'Cappuccino', quantity: 2, price: 250 },
  ],
  total: 1350,
  status: 'out_for_delivery',
  createdAt: '2025-12-19T14:30:00Z',
  deliveryAddress: 'Busia Town, Near Market',
  logisticsTask: {
    id: 'task-67890',
    orderId: 'order-12345',
    riderName: 'James Ochieng',
    riderPhone: '+254723456789',
    vehicle: 'Motorcycle - KCA 123B',
    currentLocation: { lat: 0.4607, lng: 34.1638 },
    etaMinutes: 15,
    status: 'in_transit',
  },
};
