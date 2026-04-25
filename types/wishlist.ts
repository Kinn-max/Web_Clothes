export interface Wishlist {
  id: number
  user_id: number
  product_id: string
  created_at: string
}

export interface WishlistCreate {
  user_id: number
  product_id: string
}
