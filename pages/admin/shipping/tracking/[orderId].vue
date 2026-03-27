<script setup lang="ts">
import { useShipping } from "@/composables/useShipping";
import { useNotification } from "@/composables/useNotification";
import type { ShippingTracking, ShippingStatus } from "@/@type/shipping";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const { getTrackingHistory, updateShippingStatus, loading } = useShipping();
const { showNotification } = useNotification();

const orderId = route.params.orderId as string;
const trackings = ref<ShippingTracking[]>([]);

const newTracking = ref({
  status: "" as ShippingStatus | "",
  location: "",
  description: "",
});

const statusOptions: { value: ShippingStatus; label: string }[] = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "preparing", label: "Đang chuẩn bị" },
  { value: "ready_to_ship", label: "Sẵn sàng giao" },
  { value: "picking_up", label: "Đang lấy hàng" },
  { value: "picked_up", label: "Đã lấy hàng" },
  { value: "in_transit", label: "Đang vận chuyển" },
  { value: "out_for_delivery", label: "Đang giao hàng" },
  { value: "delivered", label: "Đã giao hàng" },
  { value: "failed", label: "Giao thất bại" },
  { value: "returning", label: "Đang hoàn trả" },
  { value: "returned", label: "Đã hoàn trả" },
  { value: "cancelled", label: "Đã hủy" },
];

const fetchTracking = async () => {
  try {
    trackings.value = await getTrackingHistory(orderId);
  } catch (error: any) {
    showNotification("Lỗi", error.message, "error");
  }
};

const handleSubmit = async () => {
  if (!newTracking.value.status) {
    showNotification("Lỗi", "Vui lòng chọn trạng thái", "error");
    return;
  }

  try {
    await updateShippingStatus(orderId, {
      status: newTracking.value.status,
      location: newTracking.value.location,
      description: newTracking.value.description,
    });

    showNotification("Thành công", "Đã cập nhật trạng thái vận chuyển", "success");

    // Reset form
    newTracking.value = {
      status: "" as ShippingStatus | "",
      location: "",
      description: "",
    };

    // Reload tracking
    await fetchTracking();
  } catch (error: any) {
    showNotification("Lỗi", error.message, "error");
  }
};

onMounted(() => {
  fetchTracking();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <button
          @click="router.back()"
          class="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
        >
          ← Quay lại
        </button>
        <h1 class="text-2xl font-bold text-gray-900">
          Cập nhật vận chuyển - Đơn hàng #{{ orderId }}
        </h1>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Form cập nhật -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Cập nhật trạng thái mới
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái <span class="text-red-500">*</span>
            </label>
            <select
              v-model="newTracking.status"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn trạng thái --</option>
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Vị trí
            </label>
            <input
              v-model="newTracking.location"
              type="text"
              placeholder="VD: Bưu cục Quận 1, TP.HCM"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              v-model="newTracking.description"
              rows="3"
              placeholder="Thông tin thêm về trạng thái vận chuyển..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <span v-if="loading">Đang cập nhật...</span>
            <span v-else>✓ Cập nhật trạng thái</span>
          </button>
        </form>
      </div>

      <!-- Lịch sử tracking -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Lịch sử vận chuyển
        </h2>
        <TrackingTimeline :trackings="trackings" />
      </div>
    </div>
  </div>
</template>