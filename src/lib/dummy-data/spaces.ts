export interface BookableSpace {
  id: string;
  name: string;
  description: string;
  capacity: number;
  hourlyRate: number;
  dailyRate: number;
  amenities: string[];
  image: string;
  category: 'coworking' | 'boardroom' | 'office' | 'conference' | 'accommodation';
}

export const dummySpaces: BookableSpace[] = [
  {
    id: 'space-1',
    name: 'Executive Boardroom',
    description: 'Premium boardroom with video conferencing facilities and city views',
    capacity: 12,
    hourlyRate: 2500,
    dailyRate: 15000,
    amenities: ['Wi-Fi', 'Projector', 'Whiteboard', 'Video Conference', 'Coffee/Tea', 'Air Conditioning'],
    image: '/images/spaces/boardroom.jpg',
    category: 'boardroom',
  },
  {
    id: 'space-2',
    name: 'Hot Desk',
    description: 'Flexible workspace in our vibrant co-working area',
    capacity: 1,
    hourlyRate: 200,
    dailyRate: 1000,
    amenities: ['Wi-Fi', 'Power Outlets', 'Coffee/Tea', 'Natural Light'],
    image: '/images/spaces/coworking.jpg',
    category: 'coworking',
  },
  {
    id: 'space-3',
    name: 'Conference Hall',
    description: 'Large conference hall perfect for seminars and workshops',
    capacity: 80,
    hourlyRate: 5000,
    dailyRate: 35000,
    amenities: ['Wi-Fi', 'Projector', 'Sound System', 'Stage', 'Catering Available', 'Air Conditioning'],
    image: '/images/spaces/conference.jpg',
    category: 'conference',
  },
  {
    id: 'space-4',
    name: 'Private Office',
    description: 'Dedicated private office for teams of 4-6 people',
    capacity: 6,
    hourlyRate: 1500,
    dailyRate: 8000,
    amenities: ['Wi-Fi', 'Desks', 'Chairs', 'Whiteboard', 'Storage', 'Coffee/Tea'],
    image: '/images/spaces/private-office.jpg',
    category: 'office',
  },
  {
    id: 'space-5',
    name: 'Executive Suite',
    description: 'Luxurious accommodation for business travelers',
    capacity: 2,
    hourlyRate: 0,
    dailyRate: 12000,
    amenities: ['Wi-Fi', 'King Bed', 'Work Desk', 'Ensuite Bathroom', 'Breakfast Included', 'TV'],
    image: '/images/spaces/suite.jpg',
    category: 'accommodation',
  },
];
