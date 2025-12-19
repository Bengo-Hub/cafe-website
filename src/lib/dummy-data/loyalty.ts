export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyAccount {
  userId: string;
  points: number;
  tier: LoyaltyTier;
  nextRewardAt: number;
  lifetimeSpent: number;
  memberSince: string;
  rewards: Reward[];
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  available: boolean;
  imageUrl?: string;
}

export const dummyLoyaltyAccount: LoyaltyAccount = {
  userId: 'user-123',
  points: 2500,
  tier: 'silver',
  nextRewardAt: 5000,
  lifetimeSpent: 25000,
  memberSince: '2024-06-15',
  rewards: [
    {
      id: 'reward-1',
      name: 'Free Coffee',
      description: 'Any coffee of your choice',
      pointsRequired: 500,
      available: true,
    },
    {
      id: 'reward-2',
      name: 'Free Main Course',
      description: 'Any main course from our menu',
      pointsRequired: 2000,
      available: true,
    },
    {
      id: 'reward-3',
      name: 'Free Lunch for Two',
      description: 'Complete lunch meal for two people',
      pointsRequired: 5000,
      available: false,
    },
    {
      id: 'reward-4',
      name: 'Birthday Special',
      description: 'Free birthday cake and meal on your special day',
      pointsRequired: 0,
      available: true,
    },
  ],
};

export const loyaltyTierBenefits = {
  bronze: {
    pointsPerSpend: 1,
    benefits: ['Earn 1 point per KES 100', 'Birthday treat', 'Member-only offers'],
  },
  silver: {
    pointsPerSpend: 1.5,
    benefits: ['Earn 1.5 points per KES 100', 'Priority bookings', 'Exclusive events access'],
  },
  gold: {
    pointsPerSpend: 2,
    benefits: ['Earn 2 points per KES 100', 'Free delivery', 'Early access to new menu items'],
  },
  platinum: {
    pointsPerSpend: 3,
    benefits: ['Earn 3 points per KES 100', 'VIP treatment', 'Personalized menu recommendations'],
  },
};
