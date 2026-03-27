import type {
  ShippingProvider,
  ShippingMethod,
  ShippingTracking,
  CreateTrackingPayload,
} from "@/@type/shipping";

export const useShipping = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ============= PUBLIC METHODS =============

  // Lấy danh sách nhà vận chuyển
  const getProviders = async (): Promise<ShippingProvider[]> => {
    loading.value = true;
    error.value = null;
    try {
      const res: any = await $fetch(`${baseURL}/shipping/providers`);
      return res.data || res;
    } catch (err: any) {
      error.value = err.data?.message || "Không thể lấy danh sách nhà vận chuyển";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Lấy phương thức vận chuyển
  const getMethods = async (providerId?: number): Promise<ShippingMethod[]> => {
    loading.value = true;
    error.value = null;
    try {
      const query = providerId ? `?providerId=${providerId}` : "";
      const res: any = await $fetch(`${baseURL}/shipping/methods${query}`);
      return res.data || res;
    } catch (err: any) {
      error.value = err.data?.message || "Không thể lấy phương thức vận chuyển";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Lấy phí của 1 phương thức
  const getMethodFee = async (methodId: number) => {
    loading.value = true;
    error.value = null;
    try {
      const res: any = await $fetch(`${baseURL}/shipping/methods/${methodId}/fee`);
      return res.data || res;
    } catch (err: any) {
      error.value = err.data?.message || "Không thể lấy phí vận chuyển";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Tính phí vận chuyển
  const calculateFee = async (methodId: number, distance?: number) => {
    loading.value = true;
    error.value = null;
    try {
      const res: any = await $fetch(`${baseURL}/shipping/calculate-fee`, {
        method: "POST",
        body: { methodId, distance },
      });
      return res.data || res;
    } catch (err: any) {
      error.value = err.data?.message || "Không thể tính phí vận chuyển";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ============= CUSTOMER METHODS =============

  // Lấy lịch sử tracking đơn hàng
  const getTrackingHistory = async (
    orderId: number | string
  ): Promise<ShippingTracking[]> => {
    loading.value = true;
    error.value = null;
    try {
      const token = useCookie("authToken").value;
      const res: any = await $fetch(`${baseURL}/shipping/tracking/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data || res;
    } catch (err: any) {
      error.value = err.data?.message || "Không thể lấy lịch sử vận chuyển";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ============= ADMIN METHODS =============

  // Tạo tracking mới
  const createTracking = async (
    orderId: number | string,
    payload: CreateTrackingPayload
  ): Promise<ShippingTracking> => {
    loading.value = true;
    error.value = null;
    try {
      const token = useCookie("authToken").value;
      const res: any = await $fetch(`${baseURL}/shipping/tracking/${orderId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });
      return res.data || res;
    } catch (err: any) {
      error.value = err.data?.message || "Không thể tạo tracking";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Cập nhật trạng thái vận chuyển
  const updateShippingStatus = async (
    orderId: number | string,
    payload: CreateTrackingPayload
  ): Promise<ShippingTracking> => {
    loading.value = true;
    error.value = null;
    try {
      const token = useCookie("authToken").value;
      const res: any = await $fetch(
        `${baseURL}/shipping/tracking/${orderId}/update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );
      return res.data || res;
    } catch (err: any) {
      error.value = err.data?.message || "Không thể cập nhật trạng thái";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    // Public
    getProviders,
    getMethods,
    getMethodFee,
    calculateFee,
    // Customer
    getTrackingHistory,
    // Admin
    createTracking,
    updateShippingStatus,
  };
};