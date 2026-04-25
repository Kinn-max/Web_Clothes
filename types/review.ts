export interface Review {
  id: number
  user_id: number
  product_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
}

export interface ReviewCreate {
  user_id: number
  product_id: string
  rating: number
  comment?: string
}

export interface ReviewUpdate {
  rating?: number
  comment?: string
}

export interface ReviewParams {
  product_id?: string
  user_id?: number
  rating?: number
}

export interface ReviewStats {
  product_id: string
  average_rating: number
  total_reviews: number
  rating_distribution: Record<number, number>
}
