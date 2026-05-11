// types/address.ts

export interface Address {
  id: number
  user_id: number
  full_name: string    
  phone: string        
  address: string      
  city?: string        
  district?: string
  ward?: string
  is_default: boolean
  created_at: string
  updated_at: string
  is_deleted?: boolean
}

export interface AddressCreate {
  full_name: string    
  phone: string        
  address: string      
  city?: string        
  district?: string
  ward?: string
  is_default?: boolean
}

export interface AddressUpdate extends Partial<AddressCreate> {}