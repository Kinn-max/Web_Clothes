export interface Store {
  id: string
  user_id?: number
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  banner_url?: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface StoreCreate {
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  is_active?: boolean
  user_id?: number
}

export interface StoreUpdate extends Partial<StoreCreate> {}
