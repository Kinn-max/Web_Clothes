export interface ShippingProvider {
  id: number;
  name: string;
  code: string;
  logo?: string;
  contact_phone?: string;
  contact_email?: string;
  base_fee: number;
  is_active: boolean;
}

export interface ShippingMethod {
  id: number;
  provider_id: number;
  name: string;
  code: string;
  description?: string;
  fixed_fee: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  provider_name?: string;
  provider_code?: string;
  provider_logo?: string;
}

export interface ShippingTracking {
  id: number;
  order_id: number;
  status: ShippingStatus;
  location?: string;
  description?: string;
  updated_by?: number;
  updated_by_name?: string;
  created_at: string;
}

export type ShippingStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready_to_ship"
  | "picking_up"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed"
  | "returning"
  | "returned"
  | "cancelled";

export interface CreateTrackingPayload {
  status: ShippingStatus;
  location?: string;
  description?: string;
}