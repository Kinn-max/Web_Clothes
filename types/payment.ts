export interface CreatePaymentPayload {
    order_id: string 
    amount:number
    order_desc?:string
    bank_code?:string
}

export interface CreatePaymentResponse {
    payment_url:string
}