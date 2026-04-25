export interface ConversionEvent {
  id: number
  user_id?: number
  product_id: string
  event_type: string
  ar_session_id?: number
  created_at: string
}

export interface ConversionCreate {
  user_id?: number
  product_id: string
  event_type: string
  ar_session_id?: number
}

export interface ConversionParams {
  product_id?: string
  user_id?: number
  event_type?: string
}

export interface ConversionFunnel {
  product_id: string
  events: Record<string, number>
}

export interface ConversionOverview {
  total_events: number
  by_type: Record<string, number>
}
