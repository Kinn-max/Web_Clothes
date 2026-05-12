// types/address.ts
export type AddressType = 'Nhà riêng' | 'Cơ quan' | 'Khác'
export const ADDRESS_TYPES: AddressType[] = ['Nhà riêng', 'Cơ quan', 'Khác']
export interface Address {
  id: number
  user_id: number
  full_name: string    
  phone: string     
  address_type: AddressType   
  address: string      
  city?: string        
  district?: string
  ward?: string
  latitude?: number | null
  longitude?: number | null
  is_default: boolean
  created_at: string
  updated_at: string
  is_deleted?: boolean
}

export interface AddressCreate {
  full_name: string    
  phone: string  
  address_type: AddressType      
  address: string      
  city?: string        
  district?: string
  ward?: string
  latitude?: number | null
  longitude?: number | null
  is_default?: boolean
}
export interface AddressUpdate {
  full_name?: string
  phone?: string
  address_type?: AddressType  
  address?: string
  city?: string
  district?: string
  ward?: string
  latitude?: number | null    
  longitude?: number | null   
  is_default?: boolean
}
export interface AddressFormData {
  full_name: string
  phone: string
  address_type: AddressType
  address: string
  city?: string
  district?: string
  ward?: string
  latitude: number | null
  longitude: number | null
  is_default: boolean
}

