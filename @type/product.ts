export interface Product {
  id?: number | string;
  name: string;
  brand: string;
  gender: string;
  price: number;
  quantity: number;
  description: string;
  images: string[] | string;
  category_id?: number | string;
}

