import { useQuery } from '@tanstack/vue-query'
import type { StripePayment, StripePaymentsResponse, StripePaymentDetail } from '@/types/StripePayment'

export const useStripePayments = () => {
  const http = useHttp()

  const useGetPayments = (limit = 10) =>
    useQuery({
      queryKey: ['stripe-payments', limit],
      queryFn: () => http.get<StripePaymentsResponse>(`/payment/stripe/payments?limit=${limit}`),
      staleTime: 30_000, // cache 30 giây
    })

  const useGetPaymentDetail = (paymentId: Ref<string | null>) =>
    useQuery({
      queryKey: ['stripe-payment', paymentId],
      queryFn: () => http.get<StripePaymentDetail>(`/payment/stripe/payments/${paymentId.value}`),
      enabled: computed(() => !!paymentId.value),
    })

  // Helpers
  const formatStatus = (status: string) => {
    switch (status) {
      case 'succeeded': return { label: 'Thành công', cls: 'bg-emerald-100 text-emerald-700' }
      case 'failed':    return { label: 'Thất bại',   cls: 'bg-rose-100 text-rose-700' }
      case 'canceled':  return { label: 'Đã hủy',     cls: 'bg-slate-100 text-slate-600' }
      case 'processing':return { label: 'Đang xử lý', cls: 'bg-amber-100 text-amber-700' }
      default:          return { label: status,        cls: 'bg-slate-100 text-slate-600' }
    }
  }

  const formatDate = (unix: number) => {
    return new Date(unix * 1000).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  return { useGetPayments, useGetPaymentDetail, formatStatus, formatDate, formatVND }
}