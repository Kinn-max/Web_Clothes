/**
 * Address Types
 */

export interface Address {
  id: string;          
  user_id: string;      
  contact_name: string;
  phone: string;
  address_type: AddressType;
  detail_address: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: number;   
  updated_at?: number;
}

export interface AddressFormData {
  contact_name: string;
  phone: string;
  address_type: AddressType;
  detail_address: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}
export interface CreateAddressPayload {
    user_id: number;
    contact_name: string;
    phone: string;
    address_type: string;
    detail_address: string;
    latitude?: number | null;
    longitude?: number | null;
    is_default: boolean;
}

export interface UpdateAddressPayload {
    contact_name: string;
    phone: string;
    address_type: string;
    detail_address: string;
    latitude?: number | null;
    longitude?: number | null;
    is_default: boolean;
}

export type AddressType = "Nhà riêng" | "Văn phòng" | "Khác";

export const ADDRESS_TYPES: AddressType[] = ["Nhà riêng", "Văn phòng", "Khác"];