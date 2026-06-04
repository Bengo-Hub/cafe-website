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
    name: 'Josephine Kock',
    role: '',
    content:
      'The urban loft Busia is the place to stop for a meal when in Busia. You are welcomed by a homely atmosphere, and equally competent and friendly staff . We had cocktails Mojito, i give thumbs up for it, tried pancakes and samosas which were tasty. Main course was grilled meat and Hawaii pizza which was excellent but it lacked the ham which is the main ingredient for the Hawaii pizza . All in all the food was excellent made with love. I gave a four star because some things on the menu were lacking.5 points to the rest rooms which is also very important.',
    avatar: '/images/team/placeholder-team.svg',
    rating: 4,
  },
  {
    id: '2',
    name: 'Maureen Onyango',
    role: '',
    content:
      'I love the ambience amidst the flowers art and jazz. Great place to hang out. The board games and cards are brilliant.',
    avatar: '/images/team/placeholder-team.svg',
    rating: 5,
  },
  {
    id: '3',
    name: 'Vincent Kabiru',
    role: 'Local Guide',
    content:
      'It is a cool place to relax, read a novel, have a romantic date or just meet up with a friend. Though prices are on the higher side for Busia town.',
    avatar: '/images/team/placeholder-team.svg',
    rating: 5,
  },
];
