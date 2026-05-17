import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { CreatePaymentPayload, CreatePaymentResponse } from '@/types/payment'

export const usePayment = () => {
  const http = useHttp()
  const queryClient = useQueryClient()

  const useCreatePayment = () =>
    useMutation({
      mutationFn: (payload: CreatePaymentPayload) =>
        http.post<CreatePaymentResponse>('/payment/stripe/create', {
          order_id: payload.order_id,
          amount: payload.amount,
          order_desc: payload.order_desc ?? 'Thanh toan don hang GlowUp',
        }),
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ['payment'] })
        if (res?.payment_url) {
          window.location.href = res.payment_url
        }
      },
      onError: (err: any) => {
        console.error('[Stripe] Lỗi:', err)
      },
    })

  return { useCreatePayment }
}