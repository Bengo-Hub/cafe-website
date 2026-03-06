export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: 'weekly' | 'special' | 'holiday';
  price?: number;
  availableSlots?: number;
}

export const dummyEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Pizza Friday',
    description: 'Unlimited wood-fired pizzas every Friday. Book your table now!',
    date: '2025-12-26',
    time: '18:00 - 22:00',
    location: 'Urban Loft Busia',
    image: '/images/events/pizza-friday.jpg',
    category: 'weekly',
    price: 1500,
    availableSlots: 45,
  },
  {
    id: 'event-2',
    name: 'Couples Night',
    description: 'Romantic dinner for two with live music and special menu',
    date: '2025-12-27',
    time: '19:00 - 23:00',
    location: 'Urban Loft Busia',
    image: '/images/events/couples-night.jpg',
    category: 'special',
    price: 3500,
    availableSlots: 20,
  },
  {
    id: 'event-3',
    name: 'Game Night',
    description: 'Board games, trivia, and good food with friends',
    date: '2025-12-28',
    time: '17:00 - 21:00',
    location: 'Urban Loft Busia',
    image: '/images/events/events-3.jpg',
    category: 'weekly',
    price: 800,
    availableSlots: 60,
  },
  {
    id: 'event-4',
    name: 'New Year Celebration',
    description: 'Ring in 2026 with us! Live band, special menu, and champagne toast',
    date: '2025-12-31',
    time: '20:00 - 02:00',
    location: 'All Branches',
    image: '/images/events/events-4.jpg',
    category: 'holiday',
    price: 5000,
    availableSlots: 100,
  },
];
