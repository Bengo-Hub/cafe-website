/**
 * Category slug to display name mapping (from menuCategories)
 * Category slug to image path - strategic placement: only categories with dedicated images
 */
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  breakfast: 'Breakfast',
  burgers: 'Burgers & Combos',
  pizzas: 'Pizzas',
  mains: 'Main Meals',
  platters: 'Platters',
  salads: 'Salads & Sandwiches',
  sides: 'Sides & Snacks',
  'hot-coffee': 'Hot Coffee',
  tea: 'Tea & Hot Drinks',
  iced: 'Iced Coffee & Tea',
  juices: 'Juices & Smoothies',
  desserts: 'Shakes & Desserts',
  mocktails: 'Mocktails',
  cocktails: 'Cocktails',
  beer: 'Beer & Energy Drinks',
  spirits: 'Spirits',
  wines: 'Wines',
  water: 'Water & Soda',
  retail: 'Retail',
};

/**
 * Strategic category images - one per category for section headers.
 * Not all categories have images; place them where they add visual interest.
 */
export const CATEGORY_IMAGES: Record<string, string> = {
  breakfast: '/images/menu/breakfast.jpg',
  burgers: '/images/menu/burger.jpg',
  pizzas: '/images/menu/margherita-pizza.jpg',
  mains: '/images/menu/main-course-1.jpg',
  platters: '/images/menu/main-course-2.jpg',
  salads: '/images/menu/salad.jpg',
  'hot-coffee': '/images/menu/espresso.jpg',
  desserts: '/images/menu/chocolate-lava-cake.jpg',
};

/** Images for menu hero slideshow - varied menu visuals */
export const MENU_SLIDESHOW_IMAGES: { src: string; alt: string }[] = [
  { src: '/images/services/thecafe.jpg', alt: 'Urban Loft Cafe' },
  { src: '/images/menu/breakfast.jpg', alt: 'Breakfast' },
  { src: '/images/menu/burger.jpg', alt: 'Burgers & Combos' },
  { src: '/images/menu/margherita-pizza.jpg', alt: 'Pizzas' },
  { src: '/images/menu/main-course-1.jpg', alt: 'Main Meals - Beef' },
  { src: '/images/menu/main-course-2.jpg', alt: 'Main Meals - Chicken' },
  { src: '/images/menu/salad.jpg', alt: 'Salads' },
  { src: '/images/menu/espresso.jpg', alt: 'Hot Coffee' },
  { src: '/images/menu/cappuccino.jpg', alt: 'Cappuccino' },
  { src: '/images/menu/chocolate-lava-cake.jpg', alt: 'Desserts' },
];
