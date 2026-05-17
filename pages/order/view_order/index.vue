<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useOrder } from "@/composables/useOrder";
import { useAuth } from "@/composables/useAuth";
import { useNotification } from "@/composables/useNotification";
import BaseConfirmModal from "@/components/modal/BaseConfirmModal.vue";
import OrderStatusTabs from "@/components/order/OrderStatusTabs.vue";
import OrderHistoryCard from "@/components/order/OrderHistoryCard.vue";
import { Package, X } from "lucide-vue-next";
import type { Order } from "@/types/order";
const { useCreatePayment } = usePayment()
const { mutateAsync: createPayment } = useCreatePayment()
const { orders, loading, error, fetchUserOrders, cancelOrder } = useOrder();
const { user, isAuthenticated } = useAuth();
const { showNotification } = useNotification();

const showCancelModal = ref(false);
const orderToCancel   = ref<string | null>(null);
const cancellingOrder = ref(false);
const activeStatus    = ref("all");
const paying          = ref(false);

// Phân trang
const currentPage  = ref(1);
const pageSize     = ref(5);

const statusTabs = [
  { label: "Tất cả",        value: "all" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đã xác nhận",  value: "confirmed" },
  { label: "Đang giao",    value: "shipping" },
  { label: "Đã giao",      value: "completed" },
  { label: "Đã hủy",       value: "cancelled" },
];

// Đếm số đơn theo từng status
const statusCounts = computed(() => {
  const counts: Record<string, number> = { all: orders.value.length }
  statusTabs.forEach(tab => {
    if (tab.value !== 'all') {
      counts[tab.value] = orders.value.filter(
        o => o.status.toLowerCase() === tab.value
      ).length
    }
  })
  return counts
})

const filteredOrders = computed(() => {
  if (activeStatus.value === "all") return orders.value;
  return orders.value.filter(o => o.status.toLowerCase() === activeStatus.value);
});

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize.value))

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredOrders.value.slice(start, start + pageSize.value)
})

// Reset trang khi đổi tab
watch(activeStatus, () => { currentPage.value = 1 })

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

const handlePayNow = async (order: Order) => {
  paying.value = true
  try {
    showNotification('Thông báo', 'Đang chuyển đến Stripe...', 'info')
    await createPayment({
      order_id: order.id,
      amount: order.totalPrice,
      order_desc: `Thanh toan GlowUp #${order.id.slice(0, 8)}`,
    })
    // onSuccess tự redirect sang Stripe
  } catch (err) {
    showNotification('Lỗi', 'Không thể tạo thanh toán. Vui lòng thử lại.', 'error')
  } finally {
    paying.value = false
  }
}

const handleRetry = async () => {
  if (user.value?.userId) await fetchUserOrders(user.value.userId);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4 max-w-4xl">

      <!-- Tabs với số lượng -->
      <OrderStatusTabs
        v-model:activeStatus="activeStatus"
        :statusTabs="statusTabs"
        :statusCounts="statusCounts"
      />

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="w-12 h-12 border-4 border-gray-100 border-t-glow-primary-600 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-500 font-medium">Đang tải danh sách đơn hàng...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
        <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <X class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Đã có lỗi xảy ra</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button @click="handleRetry" class="px-6 py-2 bg-glow-primary-600 text-white rounded-lg hover:bg-glow-primary-700 transition-colors">
          Thử lại
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredOrders.length === 0" class="p-12 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
        <div class="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package class="w-10 h-10" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
        <p class="text-gray-600 mb-8 max-w-md mx-auto">
          {{ activeStatus === "all" ? "Bạn chưa thực hiện đơn hàng nào." : "Không có đơn hàng nào ở trạng thái này." }}
        </p>
        <NuxtLink v-if="activeStatus === 'all'" to="/shop"
          class="inline-flex items-center px-8 py-3 bg-glow-primary-600 text-white font-bold rounded-xl hover:bg-glow-primary-700 transition-all">
          Mua sắm ngay
        </NuxtLink>
        <button v-else @click="activeStatus = 'all'"
          class="inline-flex items-center px-8 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all">
          Xem tất cả đơn hàng
        </button>
      </div>

      <!-- Danh sách -->
      <div v-else class="space-y-6">
        <OrderHistoryCard
          v-for="order in paginatedOrders"
          :key="order.id"
          :order="order"
          :paying="paying"
          @cancel="handleCancelOrder"
          @pay="handlePayNow"
        />

        <!-- Phân trang -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-4">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Trước
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            class="w-10 h-10 rounded-xl text-sm font-bold transition-all"
            :class="currentPage === page
              ? 'bg-glow-primary-600 text-white shadow-md'
              : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
          >
            {{ page }}
          </button>

          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Tiếp →
          </button>
        </div>

        <!-- Info phân trang -->
        <p class="text-center text-sm text-gray-400">
          Hiển thị {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredOrders.length) }}
          / {{ filteredOrders.length }} đơn hàng
        </p>
      </div>

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