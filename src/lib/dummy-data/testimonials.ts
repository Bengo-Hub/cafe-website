export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Freelance Designer',
    content:
      'Urban Loft is my favorite place to work. The coffee is amazing, and the atmosphere is perfect for productivity. The high-speed Wi-Fi is a lifesaver!',
    avatar: '/images/team/placeholder-team.svg',
    rating: 5,
  },
  {
    id: '2',
    name: 'David Mwangi',
    role: 'Software Engineer',
    content:
      'I love the community here. I\'ve met so many interesting people at the networking events. Plus, the food is consistently delicious.',
    avatar: '/images/team/placeholder-team.svg',
    rating: 5,
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'Student',
    content:
      'The best study spot in town! It\'s quiet enough to focus but has a great vibe. The staff are always friendly and welcoming.',
    avatar: '/images/team/placeholder-team.svg',
    rating: 4,
  },
];
