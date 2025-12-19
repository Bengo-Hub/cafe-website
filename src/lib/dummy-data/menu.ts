export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'halal' | 'dairy-free';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  dietaryTags?: DietaryTag[];
  featured?: boolean;
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}

export const menuCategories: MenuCategory[] = [
  { id: 'all', name: 'All Items' },
  { id: 'mains', name: 'Main Courses' },
  { id: 'salads', name: 'Salads & Bowls' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'breakfast', name: 'Breakfast' },
];

export const dummyMenuItems: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Urban Loft Burger',
    description: 'Premium beef patty, caramelized onions, aged cheddar, special sauce on a brioche bun',
    price: 850,
    category: 'mains',
    image: '/images/menu/burger.jpg',
    available: true,
    featured: true,
    nutritionInfo: { calories: 650, protein: 35, carbs: 45, fat: 28 },
  },
  {
    id: 'item-2',
    name: 'Grilled Chicken Salad',
    description: 'Fresh greens, grilled chicken breast, avocado, cherry tomatoes, honey mustard dressing',
    price: 720,
    category: 'salads',
    image: '/images/menu/salad.jpg',
    available: true,
    dietaryTags: ['gluten-free', 'halal'],
    featured: true,
    nutritionInfo: { calories: 420, protein: 38, carbs: 22, fat: 18 },
  },
  {
    id: 'item-3',
    name: 'Espresso',
    description: 'Rich, bold espresso shot from Ethiopian single-origin beans',
    price: 180,
    category: 'beverages',
    image: '/images/menu/espresso.jpg',
    available: true,
  },
  {
    id: 'item-4',
    name: 'Margherita Pizza',
    description: 'Wood-fired pizza with fresh mozzarella, San Marzano tomatoes, basil, olive oil',
    price: 950,
    category: 'mains',
    image: '/images/menu/margherita-pizza.jpg',
    available: true,
    dietaryTags: ['vegetarian'],
  },
  {
    id: 'item-5',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and velvety microfoam',
    price: 250,
    category: 'beverages',
    image: '/images/menu/cappuccino.jpg',
    available: true,
  },
  {
    id: 'item-6',
    name: 'Vegan Buddha Bowl',
    description: 'Quinoa, roasted vegetables, tahini dressing, chickpeas, mixed greens',
    price: 680,
    category: 'salads',
    image: '/images/menu/salad.jpg',
    available: true,
    dietaryTags: ['vegan', 'gluten-free', 'dairy-free'],
  },
  {
    id: 'item-7',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, vanilla ice cream',
    price: 450,
    category: 'desserts',
    image: '/images/menu/chocolate-lava-cake.jpg',
    available: true,
    dietaryTags: ['vegetarian'],
  },
  {
    id: 'item-8',
    name: 'Full English Breakfast',
    description: 'Eggs, bacon, sausage, baked beans, mushrooms, grilled tomato, toast',
    price: 750,
    category: 'breakfast',
    image: '/images/menu/breakfast.jpg',
    available: true,
    featured: true,
  },
];
