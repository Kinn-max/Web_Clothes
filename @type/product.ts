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

export interface Review {
  id?: number | string;
  user_id: number | string;
  product_id: number | string;
  rating: number; // 1-5
  comment: string;
  created_at?: string;
  is_anonymous?: boolean;
  has_purchased?: boolean;
  media_urls?: string[]; // images and videos
  username?: string;
}

export interface ReviewRequest {
  rating: number;
  comment: string;
  is_anonymous?: boolean;
  media_urls?: string[];
}
