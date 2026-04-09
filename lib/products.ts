export interface Product {
  id: number;
  name: string;
  slug: string;
  image: string;
  images: string[]; // Multiple images for gallery
  price: number;
  originalPrice: number | null;
  category: string;
  categorySlug: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  features: string[];
  sizes: string[];
  colors: {
    name: string;
    code: string;
    colorClass: string;
    imageKey: string;
  }[];
  rating: number;
  reviews: number;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'T-Shirt Tech HackITa',
    slug: 'tshirt-tech-hackita',
    image: '/images/products/tshirt-1.jpg',
    images: [
      '/images/products/tshirt-1.jpg',
      '/images/products/tshirt-1-back.jpg',
      '/images/products/tshirt-1-detail.jpg',
    ],
    price: 29.99,
    originalPrice: 39.99,
    category: 'Nuovi Arrivi',
    categorySlug: 'new-arrivals',
    badge: '🔥 Hot',
    badgeColor: 'text-orange-500',
    description: 'La T-Shirt Tech HackITa è realizzata in cotone 100% organico, con un design esclusivo che celebra la passione per la tecnologia. Perfetta per gli eventi tech, il lavoro o il tempo libero.',
    features: [
      'Cotone 100% organico',
      'Stampa di alta qualità resistente al lavaggio',
      'Taglio moderno e confortevole',
      'Disponibile in diverse taglie e colori',
      'Prodotto etico e sostenibile'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', code: 'black', colorClass: 'bg-black', imageKey: 'black' },
      { name: 'White', code: 'white', colorClass: 'bg-white border border-gray-300', imageKey: 'white' },
      { name: 'Navy', code: 'navy', colorClass: 'bg-blue-900', imageKey: 'navy' },
      { name: 'Red', code: 'red', colorClass: 'bg-red-600', imageKey: 'red' },
      { name: 'Gray', code: 'gray', colorClass: 'bg-gray-600', imageKey: 'gray' },
    ],
    rating: 4.5,
    reviews: 24,
    inStock: true,
  },
  {
    id: 2,
    name: 'Tazza Smart Mug',
    slug: 'tazza-smart-mug',
    image: '/images/products/mug-1.jpg',
    images: [
      '/images/products/mug-1.jpg',
      '/images/products/mug-1-angle.jpg',
    ],
    price: 19.99,
    originalPrice: null,
    category: 'Nuovi Arrivi',
    categorySlug: 'new-arrivals',
    badge: '🔥 Hot',
    badgeColor: 'text-orange-500',
    description: 'La Tazza Smart Mug HackITa mantiene la tua bevanda alla temperatura perfetta per ore. Design moderno e tecnologia avanzata per gli amanti del caffè.',
    features: [
      'Controllo temperatura digitale',
      'Batteria ricaricabile USB-C',
      'App compatibile per iOS e Android',
      'Design ergonomico',
      'Capacità 350ml'
    ],
    sizes: ['One Size'],
    colors: [
      { name: 'Black', code: 'black', colorClass: 'bg-black', imageKey: 'black' },
      { name: 'White', code: 'white', colorClass: 'bg-white border border-gray-300', imageKey: 'white' },
    ],
    rating: 4.8,
    reviews: 12,
    inStock: true,
  },
  // Add more products as needed
];

export function getProductById(id: number): Product | undefined {
  return products.find(product => product.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(product => product.slug === slug);
}

export function getRelatedProducts(category: string, currentId: number): Product[] {
  return products
    .filter(product => product.category === category && product.id !== currentId)
    .slice(0, 4);
}