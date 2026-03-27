<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useOrder } from "@/composables/useOrder";
import { useAuth } from "@/composables/useAuth";
import { useNotification } from "@/composables/useNotification";
import BaseConfirmModal from "@/components/modal/BaseConfirmModal.vue";
import OrderStatusTabs from "@/components/order/OrderStatusTabs.vue";
import OrderHistoryCard from "@/components/order/OrderHistoryCard.vue";
import { Package, ShoppingBag, X } from "lucide-vue-next";
import type { Order } from "@/@type/order";

const { orders, loading, error, fetchUserOrders, cancelOrder } = useOrder();
const { user, isAuthenticated } = useAuth();
const { showNotification } = useNotification();

// ─── Modal hủy đơn ────────────────────────────────────────────────────────────
const showCancelModal = ref(false);
const orderToCancel   = ref<string | null>(null);
const cancellingOrder = ref(false);

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const activeStatus = ref("all");
const statusTabs = [
  { label: "Tất cả",        value: "all" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đã xác nhận",  value: "confirmed" },
  { label: "Đang giao",    value: "shipping" },
  { label: "Đã giao",      value: "completed" },
  { label: "Đã hủy",       value: "cancelled" },
];

const filteredOrders = computed(() => {
  if (activeStatus.value === "all") return orders.value;
  return orders.value.filter(
    (o) => o.status.toLowerCase() === activeStatus.value
  );
});


onMounted(async () => {


  if (user.value?.userId) {
    await fetchUserOrders(user.value.userId);
  }
});


const handleCancelOrder = (orderId: string) => {
  orderToCancel.value  = orderId;
  showCancelModal.value = true;
};

const confirmCancelOrder = async () => {
  if (!orderToCancel.value) return;
  cancellingOrder.value = true;
  try {
    await cancelOrder(orderToCancel.value);
    showNotification("Thành công", "Đã hủy đơn hàng thành công.", "success");
    showCancelModal.value = false;
    orderToCancel.value   = null;
  } catch {
    showNotification("Lỗi", "Không thể hủy đơn hàng. Vui lòng thử lại.", "error");
  } finally {
    cancellingOrder.value = false;
  }
};

// ─── Thanh toán ───────────────────────────────────────────────────────────────
const paying = ref(false);

const handlePayNow = async (order: Order) => {
  paying.value = true;
  try {
    // TODO: tích hợp cổng thanh toán (VNPay, Stripe, …)
    showNotification("Thông báo", "Tính năng thanh toán online đang được tích hợp.", "info");
  } catch (err: any) {
    showNotification("Lỗi", err.message || "Không thể tiến hành thanh toán.", "error");
  } finally {
    paying.value = false;
  }
};

// ─── Retry ────────────────────────────────────────────────────────────────────
const handleRetry = async () => {
  if (user.value?.userId) {
    await fetchUserOrders(user.value.userId);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4 max-w-4xl">

      <!-- Tiêu đề -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-serif font-bold text-gray-900">Đơn hàng của tôi</h1>
        <NuxtLink
          to="/shop"
          class="flex items-center gap-2 text-glow-primary-600 hover:text-glow-primary-700 font-medium transition-colors"
        >
          <ShoppingBag class="w-5 h-5" />
          Tiếp tục mua sắm
        </NuxtLink>
      </div>

      <!-- Tabs -->
      <OrderStatusTabs
        v-model:activeStatus="activeStatus"
        :statusTabs="statusTabs"
      />

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100"
      >
        <div class="w-12 h-12 border-4 border-gray-100 border-t-glow-primary-600 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-500 font-medium">Đang tải danh sách đơn hàng...</p>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center"
      >
        <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <X class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Đã có lỗi xảy ra</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button
          @click="handleRetry"
          class="px-6 py-2 bg-glow-primary-600 text-white rounded-lg hover:bg-glow-primary-700 transition-colors"
        >
          Thử lại
        </button>
      </div>

      <!-- Không có đơn hàng -->
      <div
        v-else-if="filteredOrders.length === 0"
        class="p-12 bg-white rounded-2xl shadow-sm border border-gray-100 text-center"
      >
        <div class="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package class="w-10 h-10" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
        <p class="text-gray-600 mb-8 max-w-md mx-auto">
          {{
            activeStatus === "all"
              ? "Bạn chưa thực hiện đơn hàng nào."
              : "Không có đơn hàng nào ở trạng thái này."
          }}
        </p>
        <NuxtLink
          v-if="activeStatus === 'all'"
          to="/shop"
          class="inline-flex items-center px-8 py-3 bg-glow-primary-600 text-white font-bold rounded-xl hover:bg-glow-primary-700 transition-all hover:shadow-lg active:scale-95"
        >
          Mua sắm ngay
        </NuxtLink>
        <button
          v-else
          @click="activeStatus = 'all'"
          class="inline-flex items-center px-8 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
        >
          Xem tất cả đơn hàng
        </button>
      </div>

      <!-- Danh sách -->
      <div v-else class="space-y-6">
        <OrderHistoryCard
          v-for="order in filteredOrders"
          :key="order.id"
          :order="order"
          :paying="paying"
          @cancel="handleCancelOrder"
          @pay="handlePayNow"
        />
      </div>

      <!-- Modal xác nhận hủy -->
      <BaseConfirmModal
        :show="showCancelModal"
        title="Xác nhận hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác."
        confirmText="Hủy đơn hàng"
        cancelText="Để tôi xem lại"
        type="danger"
        :loading="cancellingOrder"
        @confirm="confirmCancelOrder"
        @cancel="showCancelModal = false"
      />
    </div>
  </div>
</template>

<style scoped>
.font-serif {
  font-family: "Playfair Display", serif;
}
</style>