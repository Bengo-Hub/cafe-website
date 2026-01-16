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
    role: 'Service Lead',
    bio: 'Dedicated service professional ensuring every guest feels welcome. Sarah leads our front-of-house team with warmth and efficiency.',
    image: '/images/team/sarah-mwangi.jpg',
    social: {
      email: 'sarah@urbanloftcafe.com',
    },
  },
  {
    id: 'team-2',
    name: 'Michael Omondi',
    role: 'Operations Manager',
    bio: 'Operations expert ensuring excellence in every detail. Michael coordinates service delivery and maintains our high standards.',
    image: '/images/team/omondi-michael.jpg',
    social: {
      email: 'michael@urbanloftcafe.com',
    },
  },
  {
    id: 'team-3',
    name: 'David Kibet',
    role: 'Head Chef',
    bio: 'Culinary artist crafting unforgettable dining experiences. David brings creativity and passion to every dish that leaves our kitchen.',
    image: '/images/team/david-kibet.jpg',
    social: {
      email: 'david@urbanloftcafe.com',
    },
  },
  {
    id: 'team-4',
    name: 'Grace Wanjiru',
    role: 'Guest Relations Manager',
    bio: 'Driving customer satisfaction and memorable experiences. Grace ensures every visit to Urban Loft exceeds expectations.',
    image: '/images/team/grace-wanjiru-2.jpg',
    social: {
      email: 'grace@urbanloftcafe.com',
    },
  },
];
