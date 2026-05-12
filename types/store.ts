export interface Store {
  id: string           
  user_id: number
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  banner_url?: string
  distance_km?: number    
  manager_name?: string   
  address_detail?: string 
  latitude?: number       
  longitude?: number      
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// ── Tạo store mới ─────────────────────────────────────────
export interface StoreCreate {
  name: string
  user_id: number
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  banner_url?: string
  distance_km?: number
  manager_name?: string
  address_detail?: string
  latitude?: number
  longitude?: number
  is_active?: boolean
}

// ── Cập nhật store ─────────────────────────────────────────
export interface StoreUpdate {
  name?: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  banner_url?: string
  distance_km?: number
  manager_name?: string
  address_detail?: string
  latitude?: number
  longitude?: number
  is_active?: boolean
}