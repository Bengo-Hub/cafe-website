export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export const teamMembers: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Sarah Mwangi',
    role: 'Director',
    bio: 'Visionary leader with 15+ years in hospitality management. Sarah founded Urban Loft Cafe with a mission to redefine the cafe experience in East Africa.',
    image: '/images/team/team-1.jpg',
    social: {
      email: 'sarah@urbanloftcafe.com',
    },
  },
  {
    id: 'team-2',
    name: 'Michael Omondi',
    role: 'General Manager',
    bio: 'Operations expert ensuring excellence in every detail. Michael brings 10 years of experience from leading hotel chains.',
    image: '/images/team/team-2.jpg',
    social: {
      email: 'michael@urbanloftcafe.com',
    },
  },
  {
    id: 'team-3',
    name: 'Grace Wanjiru',
    role: 'Chief Operations Officer',
    bio: 'Driving operational efficiency and customer satisfaction. Grace specializes in process optimization and quality control.',
    image: '/images/team/team-1.jpg',
    social: {
      email: 'grace@urbanloftcafe.com',
    },
  },
  {
    id: 'team-4',
    name: 'David Kibet',
    role: 'Finance Manager',
    bio: 'Managing financial strategy and growth. David ensures fiscal responsibility while supporting business expansion.',
    image: '/images/team/team-2.jpg',
  },
];
