/** The public site's navigation, shared by the header and the footer. */

export type NavLink = { name: string; href: string; note?: string };
export type NavItem = NavLink | { name: string; items: NavLink[] };

export const NAV: NavItem[] = [
  // The menu is the online store's catalogue; the header and footer swap this for the store link.
  { name: 'Menu', href: '/menu' },
  {
    name: 'Services',
    items: [
      { name: 'Work hub', href: '/services/hub', note: 'Desks, meeting rooms and fast Wi-Fi' },
      { name: 'Rooms', href: '/services/accommodation', note: 'Stay a night or a week' },
      { name: 'Events and catering', href: '/services/events', note: 'Venue hire, parties and outside catering' },
      { name: 'All services', href: '/services' },
    ],
  },
  { name: 'Events', href: '/events' },
  {
    name: 'About',
    items: [
      { name: 'Our story', href: '/about' },
      { name: 'Loyalty rewards', href: '/loyalty', note: 'Earn points each time you buy' },
      { name: 'Careers', href: '/careers' },
      { name: 'Franchising', href: '/franchising' },
      { name: 'Questions and answers', href: '/faq' },
    ],
  },
  { name: 'Contact', href: '/contact' },
];
