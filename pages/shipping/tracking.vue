<script setup lang="ts">
import { useShipping } from "@/composables/useShipping";
import { useNotification } from "@/composables/useNotification";
import type { ShippingTracking } from "@/@type/shipping";

definePageMeta({
  layout: "default",
});

const route = useRoute();
const { getTrackingHistory, loading } = useShipping();
const { showNotification } = useNotification();

const orderId = ref(route.query.orderId as string || "");
const trackings = ref<ShippingTracking[]>([]);

const handleSearch = async () => {
  if (!orderId.value) {
    showNotification("Lỗi", "Vui lòng nhập mã đơn hàng", "error");
    return;
  }

  try {
    trackings.value = await getTrackingHistory(orderId.value);
  } catch (error: any) {
    showNotification("Lỗi", error.message || "Không thể lấy thông tin vận chuyển", "error");
  }
};

onMounted(() => {
  if (orderId.value) {
    handleSearch();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Theo dõi đơn hàng</h1>
        <p class="mt-2 text-gray-600">
          Nhập mã đơn hàng để xem trạng thái vận chuyển
        </p>
      </div>

      <!-- Search Box -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex gap-4">
          <input
            v-model="orderId"
            type="text"
            placeholder="Nhập mã đơn hàng (VD: 123)"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @keyup.enter="handleSearch"
          />
          <button
            @click="handleSearch"
            :disabled="loading"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <span v-if="loading">Đang tìm...</span>
            <span v-else>🔍 Tra cứu</span>
          </button>
        </div>
      </div>

      <!-- Tracking Timeline -->
      <div v-if="trackings.length > 0" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          Lịch sử vận chuyển - Đơn hàng #{{ orderId }}
        </h2>
        <TrackingTimeline :trackings="trackings" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!loading && orderId"
        class="bg-white rounded-lg shadow-sm p-12 text-center"
      >
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p class="mt-4 text-gray-600">Không tìm thấy thông tin đơn hàng</p>
      </div>
    </div>
  </div>
</template>