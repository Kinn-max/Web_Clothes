import { ref } from "vue";

export const useReview = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const config = useRuntimeConfig();
  const baseURL = config?.public?.apiBaseUrl || "http://localhost:8081/api";
  const { token } = useAuth();

  const getAuthHeaders = (): HeadersInit => {
    if (token.value) {
      return {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      };
    }
    return { "Content-Type": "application/json" };
  };

  // Get all reviews (for admin)
  const getAllReviews = async (page = 1, limit = 10) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${baseURL}/reviews?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return response;
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || "Lỗi khi lấy đánh giá";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  // Get reviews by product ID
  const getProductReviews = async (productId: string | number, page = 1, limit = 5) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(
        `${baseURL}/reviews/product/${productId}?page=${page}&limit=${limit}`,
        { method: "GET", headers: getAuthHeaders() }
      );
      return response;
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || "Lỗi khi lấy đánh giá sản phẩm";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  // Get single review
  const getReviewById = async (id: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${baseURL}/reviews/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return response;
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || "Lỗi khi lấy đánh giá";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  // Create review
  const createReview = async (productId: string | number, data: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${baseURL}/reviews/product/${productId}`, {
        method: "POST",
        body: data,
        headers: getAuthHeaders(),
      });
      return response;
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || "Lỗi khi tạo đánh giá";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  // Update review
  const updateReview = async (id: string | number, data: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${baseURL}/reviews/${id}`, {
        method: "PUT",
        body: data,
        headers: getAuthHeaders(),
      });
      return response;
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || "Lỗi khi cập nhật đánh giá";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  // Delete review
  const deleteReview = async (id: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${baseURL}/reviews/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return response;
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || "Lỗi khi xóa đánh giá";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  // Get average rating
  const getAverageRating = async (productId: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`${baseURL}/reviews/rating/${productId}`, {
        method: "GET",
      });
      return response;
    } catch (err: any) {
      error.value = err?.data?.message || err?.message || "Lỗi khi lấy rating";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  // Check user purchase
  const checkUserPurchased = async (productId: string | number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(
        `${baseURL}/reviews/check-purchase/${productId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );
      return (response as any)?.hasPurchased || false;
    } catch (err: any) {
      // If user not authenticated or any error, return false
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    getAllReviews,
    getProductReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    getAverageRating,
    checkUserPurchased,
  };
};
