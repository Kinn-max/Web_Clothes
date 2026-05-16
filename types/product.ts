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

// Dùng trong chatbot — product đã được map ra từ backend
export interface ChatProduct extends Pick<Product, 'id' | 'name' | 'brand' | 'price'> {
  images: string[]; // luôn là array, đã parse
  score?: number;
}

// Raw response từ backend chatbot (images còn là JSON string)
export interface RawChatProduct extends Pick<Product, 'name' | 'brand' | 'price'> {
  id: string;
  images: string;
  score?: number;
}