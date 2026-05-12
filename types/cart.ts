export interface CartItem {
  product_id: string
  quantity: number
  added_at: number
  name: string
  price: number
  brand: string
  images: string[]
  gender: string
  description: string
}

export interface Cart {
  user_id: string
  cart_id: string
  items: CartItem[]
  total_quantity: number
  total_price: number
}

export interface AddToCartPayload {
  product_id: string | number
  name: string
  price: number
  brand: string
  images: string[]
  gender?: string
  description?: string
}