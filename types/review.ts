// types/review.ts

// ── Response từ backend ────────────────────────────────────
export interface Review {
  id: number
  user_id: number
  firestore_product_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
  is_deleted?: boolean
  display_name?: string    
  avatar_url?: string      
  // FE-only fields
  username?: string
  full_name?: string
  is_anonymous?: boolean
  has_purchased?: boolean
  media_urls?: string[]
}

// ── Tạo review mới ────────────────────────────────────────
export interface ReviewCreate {
  user_id: number
  firestore_product_id: string  
  rating: number
  comment?: string
  media_urls?: string[]
}

// ── Cập nhật review ───────────────────────────────────────
export interface ReviewUpdate {
  rating?: number
  comment?: string
}

// ── Stats response ─────────────────────────────────────────
export interface ReviewStats {
  avg_rating: number            
  total_reviews: number          
  distribution: Record<string, number> 
}

// ── Paginated response dùng chung ──────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}