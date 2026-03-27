// composables/useVnpay.ts
import { ref } from "vue";

export const useVnpay = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const createPayment = async (payload: {
    orderId: number;
    bankCode?: string;
  }) => {
    loading.value = true;
    error.value = null;

    console.log('🚀 Creating payment with:', payload);

    try {
      // ✅ GỌI TRỰC TIẾP BACKEND
      const res: any = await $fetch('http://localhost:8081/api/vnpay/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      console.log('✅ Payment created:', res);

      const paymentUrl = res?.data?.paymentUrl;

      if (!paymentUrl) {
        throw new Error('Không nhận được URL thanh toán');
      }

      // 🚀 Redirect to VNPay
      window.location.href = paymentUrl;
      
      return res;
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      error.value = err?.data?.message || err.message || 'Không thể tạo thanh toán';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    createPayment,
  };
};