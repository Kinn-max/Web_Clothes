export interface ARSession {
  id: number
  user_id?: number
  garment_id?: number
  session_start: string
  session_end?: string
  is_converted: boolean
  created_at: string
}

export interface ARSessionCreate {
  user_id?: number
  garment_id?: number
  session_start?: string
}

export interface ARSessionParams {
  user_id?: number
  garment_id?: number
  is_converted?: boolean
}

export interface ARSessionStats {
  total_sessions: number
  converted_sessions: number
  conversion_rate: number
}
