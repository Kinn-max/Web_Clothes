
export interface StripePayment {
  id: string
  amount: number
  amount_vnd: number
  currency: string
  status: string
  order_id: string
  created: number
  payment_method_details: {
    brand: string
    last4: string
  } | null
}

export interface StripePaymentsResponse {
  data: StripePayment[]
  total: number
}
export interface StripePaymentDetail {
  id: string
  amount: number
  amount_vnd: number
  currency: string
  status: string
  order_id: string
  created: number
  receipt_url: string | null
  payment_method_details: {
    brand: string | null
    last4: string | null
    exp_month: number | null
    exp_year: number | null
  } | null
  billing_details: {
    name: string | null
    email: string | null
  } | null
}