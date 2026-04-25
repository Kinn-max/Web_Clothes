export interface User {
  id: number
  firebase_uid: string
  email: string
  display_name?: string
  phone?: string
  avatar_url?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface UserCreate {
  firebase_uid: string
  email: string
  display_name?: string
  phone?: string
  avatar_url?: string
}

export interface UserUpdate {
  display_name?: string
  phone?: string
  avatar_url?: string
}
