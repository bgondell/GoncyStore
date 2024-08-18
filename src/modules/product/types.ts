export interface Option {
  id: string;
  title: string;
  category: string;
  description: string;
  image?: string;
  video?: string;
  price: number;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  image?: string;
  video?: string;
  options?: Record<Option["category"], Option[]>;
  price: number;
}
