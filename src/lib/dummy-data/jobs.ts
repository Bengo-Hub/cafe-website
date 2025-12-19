export type JobType = 'full-time' | 'part-time' | 'contract';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string[];
  responsibilities: string[];
  postedDate: string;
  salary?: string;
}

export const dummyJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Barista',
    department: 'Service',
    location: 'Busia',
    type: 'full-time',
    description: 'Join our team as a senior barista and craft exceptional coffee experiences for our customers.',
    requirements: [
      '3+ years of barista experience',
      'Expertise in latte art',
      'Excellent customer service skills',
      'Knowledge of coffee origins and roasting',
      'Ability to train junior baristas',
    ],
    responsibilities: [
      'Prepare and serve high-quality coffee beverages',
      'Maintain cleanliness of coffee station',
      'Train and mentor junior staff',
      'Ensure consistent beverage quality',
      'Handle customer inquiries and special requests',
    ],
    postedDate: '2025-12-10',
    salary: 'KES 35,000 - 45,000',
  },
  {
    id: 'job-2',
    title: 'Head Chef',
    department: 'Kitchen',
    location: 'Busia',
    type: 'full-time',
    description: 'Lead our kitchen team in creating innovative and delicious menu items that delight our customers.',
    requirements: [
      '5+ years of chef experience',
      'Menu development expertise',
      'Kitchen management skills',
      'Food safety certifications',
      'Creativity in recipe development',
    ],
    responsibilities: [
      'Oversee kitchen operations',
      'Develop and update menu items',
      'Manage kitchen staff and schedules',
      'Ensure food safety standards',
      'Control food costs and inventory',
    ],
    postedDate: '2025-12-08',
    salary: 'KES 60,000 - 80,000',
  },
  {
    id: 'job-3',
    title: 'Service Supervisor',
    department: 'Service',
    location: 'Busia',
    type: 'full-time',
    description: 'Supervise our front-of-house team and ensure exceptional customer experiences.',
    requirements: [
      '2+ years in hospitality management',
      'Strong leadership skills',
      'Excellent communication abilities',
      'Problem-solving mindset',
      'Customer service orientation',
    ],
    responsibilities: [
      'Supervise service staff',
      'Handle customer complaints',
      'Ensure service standards',
      'Manage reservations',
      'Train new employees',
    ],
    postedDate: '2025-12-15',
    salary: 'KES 40,000 - 50,000',
  },
  {
    id: 'job-4',
    title: 'Marketing Coordinator',
    department: 'Marketing',
    location: 'Busia',
    type: 'full-time',
    description: 'Drive our marketing initiatives and grow our brand presence in the region.',
    requirements: [
      'Degree in Marketing or related field',
      'Social media marketing experience',
      'Content creation skills',
      'Event planning experience',
      'Strong writing skills',
    ],
    responsibilities: [
      'Manage social media accounts',
      'Create marketing content',
      'Plan and execute events',
      'Track marketing metrics',
      'Coordinate promotions',
    ],
    postedDate: '2025-12-12',
    salary: 'KES 45,000 - 60,000',
  },
];
