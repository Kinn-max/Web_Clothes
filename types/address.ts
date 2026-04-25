export interface Address {
  id: number
  user_id: number
  label?: string
  full_address: string
  province?: string
  district?: string
  ward?: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface AddressCreate {
  label?: string
  full_address: string
  province?: string
  district?: string
  ward?: string
  is_default?: boolean
}

export interface AddressUpdate extends Partial<AddressCreate> {}
