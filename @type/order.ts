import type { Voucher } from './voucher';


export interface OrderItem {
  product_id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  images: string[];
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;          
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
  paymentMethod: "COD" | "Banking";
  paymentStatus?: "paid" | "unpaid";
  shippingAddress: ShippingAddress;
  voucherId?: string;
  voucherCode?: string;
  createdAt: any;       
}
