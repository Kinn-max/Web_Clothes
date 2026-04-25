export interface ProductView {
  id: number
  product_id: string
  user_id?: number
  viewed_at: string
}

export interface ProductViewCreate {
  product_id: string
  user_id?: number
}

export interface ProductViewParams {
  product_id?: string
  user_id?: number
}

export interface TopProduct {
  product_id: string
  view_count: number
}
