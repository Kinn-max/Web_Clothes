<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useOrder } from "../../composables/useOrder";
import { useNotification } from "../../composables/useNotification";
import type { Order } from "../../@type/order";
import BaseConfirmModal from "../../components/modal/BaseConfirmModal.vue";

definePageMeta({
  layout: "admin",
});

const { orders, loading, error, fetchAllOrders, updateOrderStatus } = useOrder();
const { showNotification } = useNotification();

const selectedOrder = ref<Order | null>(null);
const showModal = ref(false);
const submitting = ref(false);
const processingId = ref<string | null>(null);
const newStatus = ref<Order["status"]>("pending");

// Confirm modal
const showConfirmModal = ref(false);
const confirmModalTitle = ref("");
const confirmModalMessage = ref("");
const pendingUpdate = ref<{ orderId: string; status: Order["status"] } | null>(null);

const statusOptions: { value: Order["status"]; label: string }[] = [
  { value: "pending",   label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping",  label: "Đang giao hàng" },
  { value: "completed", label: "Đã giao hàng" },
  { value: "cancelled", label: "Đã hủy" },
];

const getAvailableOptions = (current: string) => {
  switch (current.toLowerCase()) {
    case "pending":   return statusOptions.filter(o => ["pending","confirmed","cancelled"].includes(o.value));
    case "confirmed": return statusOptions.filter(o => ["confirmed","shipping","cancelled"].includes(o.value));
    case "shipping":  return statusOptions.filter(o => ["shipping","completed"].includes(o.value));
    case "completed": return statusOptions.filter(o => o.value === "completed");
    case "cancelled": return statusOptions.filter(o => o.value === "cancelled");
    default:          return statusOptions;
  }
};

onMounted(() => fetchAllOrders());

const openDetailModal = (order: Order) => {
  selectedOrder.value = order;
  newStatus.value = order.status;
  showModal.value = true;
};

const handleUpdateStatus = (orderId: string, status: Order["status"]) => {
  const label = statusOptions.find(o => o.value === status)?.label ?? status;
  pendingUpdate.value = { orderId, status };
  confirmModalTitle.value = "Xác nhận cập nhật";
  confirmModalMessage.value = `Bạn có chắc chắn muốn chuyển trạng thái đơn hàng #${orderId.slice(0,8).toUpperCase()} sang "${label}"?`;
  showConfirmModal.value = true;
};

const confirmStatusUpdate = async () => {
  if (!pendingUpdate.value) return;
  const { orderId, status } = pendingUpdate.value;
  const label = statusOptions.find(o => o.value === status)?.label ?? status;

  processingId.value = orderId;
  submitting.value = true;
  showConfirmModal.value = false;

  try {
    await updateOrderStatus(orderId, status);
    showNotification("Thành công", `Đã cập nhật trạng thái thành "${label}"`, "success");
    // Cập nhật selectedOrder nếu đang mở modal
    if (selectedOrder.value?.id === orderId) {
      selectedOrder.value = orders.value.find(o => o.id === orderId) ?? null;
      if (selectedOrder.value) newStatus.value = selectedOrder.value.status;
    }
  } catch (err: any) {
    showNotification("Lỗi", "Lỗi khi cập nhật trạng thái", "error");
  } finally {
    processingId.value = null;
    submitting.value = false;
    pendingUpdate.value = null;
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const badgeClass: Record<string, string> = {
  pending:   "badge-warning",
  confirmed: "badge-info",
  shipping:  "badge-primary",
  completed: "badge-success",
  cancelled: "badge-error",
};

const statusText: Record<string, string> = {
  pending:   "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping:  "Đang giao hàng",
  completed: "Đã giao hàng",
  cancelled: "Đã hủy",
};

const getStatusBadgeClass = (s: string) => badgeClass[s.toLowerCase()] ?? "badge-secondary";
const getStatusText       = (s: string) => statusText[s.toLowerCase()] ?? s;

const paymentMethodText = (m?: string) => {
  switch (m?.toLowerCase()) {
    case "banking": return "Chuyển khoản";
    case "cod":     return "COD";
    default:        return m ?? "—";
  }
};

const paymentStatusBadge = (s?: string) =>
  s?.toLowerCase() === "paid" ? "badge-success" : "badge-error";

const paymentStatusText = (s?: string) =>
  s?.toLowerCase() === "paid" ? "Đã thanh toán" : "Chưa thanh toán";

const formatDate = (val: any) => {
  const d = typeof val === "string" ? new Date(val) : val;
  if (!(d instanceof Date) || isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN");
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n ?? 0);

const isFinalStatus = (s: string) =>
  ["completed", "cancelled"].includes(s.toLowerCase());
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">

      <!-- Header -->
      <div class="header">
        <div>
          <h1 class="title">Quản lý đơn hàng</h1>
          <p class="subtitle">Xem và cập nhật trạng thái đơn hàng của khách hàng</p>
        </div>
        <button class="btn btn-primary" @click="fetchAllOrders" :disabled="loading">
          <span v-if="loading" class="mini-spinner mr-2"></span>
          Làm mới
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading && !orders.length" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="btn btn-primary mt-4" @click="fetchAllOrders">Thử lại</button>
      </div>

      <!-- Table -->
      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày đặt</th>
              <th>Khách hàng</th>
              <th>Thanh toán</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <!-- Mã đơn: 8 ký tự đầu của Firestore ID -->
              <td class="font-mono text-xs text-gray-600">
                #{{ order.id.slice(0, 8).toUpperCase() }}
              </td>

              <td>{{ formatDate(order.createdAt) }}</td>

              <!-- Thông tin khách hàng từ shippingAddress -->
              <td>
                <div class="font-medium text-gray-900">
                  {{ order.shippingAddress?.fullName ?? "—" }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ order.shippingAddress?.phone ?? "—" }}
                </div>
              </td>

              <!-- Thanh toán -->
              <td>
                <div class="text-xs text-gray-500 mb-1">{{ paymentMethodText(order.paymentMethod) }}</div>
                <span :class="['badge', paymentStatusBadge(order.paymentStatus)]">
                  {{ paymentStatusText(order.paymentStatus) }}
                </span>
              </td>

              <!-- Tổng tiền -->
              <td class="font-medium text-blue-600">
                {{ formatPrice(order.totalPrice) }}
              </td>

              <!-- Trạng thái -->
              <td>
                <div class="flex items-center gap-2">
                  <span :class="['badge', getStatusBadgeClass(order.status)]">
                    {{ getStatusText(order.status) }}
                  </span>
                  <div v-if="processingId === order.id" class="mini-spinner"></div>
                </div>
              </td>

              <!-- Hành động -->
              <td>
                <button
                  class="btn-icon btn-view"
                  @click="openDetailModal(order)"
                  title="Xem chi tiết"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </td>
            </tr>

            <tr v-if="orders.length === 0">
              <td colspan="7" class="text-center py-8 text-gray-500">
                Chưa có đơn hàng nào.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── Order Detail Modal ─────────────────────────────────────────── -->
    <div
      v-if="showModal && selectedOrder"
      class="modal-overlay"
      @click.self="showModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h2>
            Chi tiết đơn hàng
            <span class="font-mono text-sm text-gray-500 ml-2">
              #{{ selectedOrder.id.slice(0, 8).toUpperCase() }}
            </span>
          </h2>
          <button @click="showModal = false" class="close-btn">✕</button>
        </div>

        <div class="modal-body">

          <!-- Thông tin khách hàng & đơn hàng -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <div class="info-group">
              <label class="info-label">Thông tin giao hàng</label>
              <div class="info-content">
                <p><strong>Họ tên:</strong> {{ selectedOrder.shippingAddress?.fullName ?? "—" }}</p>
                <p><strong>Điện thoại:</strong> {{ selectedOrder.shippingAddress?.phone ?? "—" }}</p>
                <p><strong>Địa chỉ:</strong> {{ selectedOrder.shippingAddress?.address ?? "—" }}</p>
              </div>
            </div>
            <div class="info-group">
              <label class="info-label">Thông tin đơn hàng</label>
              <div class="info-content">
                <p><strong>Ngày đặt:</strong> {{ formatDate(selectedOrder.createdAt) }}</p>
                <p><strong>Phương thức:</strong> {{ paymentMethodText(selectedOrder.paymentMethod) }}</p>
                <p>
                  <strong>Thanh toán:</strong>
                  <span :class="['badge ml-1', paymentStatusBadge(selectedOrder.paymentStatus)]">
                    {{ paymentStatusText(selectedOrder.paymentStatus) }}
                  </span>
                </p>
                <p v-if="selectedOrder.voucherCode">
                  <strong>Voucher:</strong> {{ selectedOrder.voucherCode }}
                </p>
              </div>
            </div>
          </div>

          <!-- Danh sách sản phẩm -->
          <div class="order-items-section mb-6">
            <label class="info-label">Sản phẩm đã đặt</label>
            <div class="items-list">
              <div
                v-for="(item, idx) in selectedOrder.items"
                :key="item.product_id + idx"
                class="item-card"
              >
                <div class="flex items-center gap-3 flex-1">
                  <!-- Ảnh sản phẩm -->
                  <img
                    v-if="item.images?.[0]"
                    :src="item.images[0].startsWith('http') ? item.images[0] : `http://localhost:8081/uploads/products/${item.images[0]}`"
                    :alt="item.name"
                    class="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                  />
                  <div class="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center" v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                  <div>
                    <p class="item-name">{{ item.name }}</p>
                    <p class="item-meta">{{ item.brand }} · SL: {{ item.quantity }} × {{ formatPrice(item.price) }}</p>
                  </div>
                </div>
                <div class="item-total">{{ formatPrice(item.price * item.quantity) }}</div>
              </div>
            </div>

            <!-- Tóm tắt giá -->
            <div class="order-summary mt-4 pt-4 border-t space-y-2">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Tạm tính:</span>
                <span>{{ formatPrice(selectedOrder.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Phí vận chuyển:</span>
                <span :class="selectedOrder.shippingFee === 0 ? 'text-green-600' : ''">
                  {{ selectedOrder.shippingFee === 0 ? "Miễn phí" : formatPrice(selectedOrder.shippingFee) }}
                </span>
              </div>
              <div v-if="selectedOrder.discount > 0" class="flex justify-between text-sm text-green-600">
                <span>
                  Giảm giá
                  <span v-if="selectedOrder.voucherCode">({{ selectedOrder.voucherCode }})</span>:
                </span>
                <span>-{{ formatPrice(selectedOrder.discount) }}</span>
              </div>
              <div class="flex justify-between items-center text-lg font-bold pt-2 border-t">
                <span>Tổng cộng:</span>
                <span class="text-blue-600">{{ formatPrice(selectedOrder.totalPrice) }}</span>
              </div>
            </div>
          </div>

          <!-- Cập nhật trạng thái -->
          <div class="status-management">
            <label class="info-label">Cập nhật trạng thái</label>
            <div class="flex gap-2 mt-2">
              <select
                v-model="newStatus"
                class="flex-1 p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="submitting || isFinalStatus(selectedOrder.status)"
              >
                <option
                  v-for="opt in getAvailableOptions(selectedOrder.status)"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
              <button
                class="btn btn-primary"
                @click="handleUpdateStatus(selectedOrder.id, newStatus)"
                :disabled="submitting || newStatus === selectedOrder.status || isFinalStatus(selectedOrder.status)"
              >
                <span v-if="submitting" class="mini-spinner mr-2"></span>
                Cập nhật
              </button>
            </div>

            <div v-if="selectedOrder.status === 'completed'" class="mt-4 text-green-600 font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Đơn hàng đã hoàn tất
            </div>
            <div v-if="selectedOrder.status === 'cancelled'" class="mt-4 text-red-600 font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Đơn hàng đã bị hủy
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <BaseConfirmModal
      :show="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      type="info"
      :loading="submitting"
      @confirm="confirmStatusUpdate"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 24px;
}
.content-wrapper { max-width: 100%; margin: 0; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.title { font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0 0 .5rem 0; }
.subtitle { color: #6b7280; margin: 0; }

.table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,.1);
  overflow-x: auto;
}
.data-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
.data-table th {
  background: #f3f4f6;
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  color: #6b7280;
  font-weight: 600;
}
.data-table td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; }
.data-table tr:hover { background-color: #f9fafb; }

.badge { padding: 4px 8px; border-radius: 99px; font-size: 12px; font-weight: 600; }
.badge-warning  { background: #fef3c7; color: #d97706; }
.badge-info     { background: #e0f2fe; color: #0284c7; }
.badge-primary  { background: #dbeafe; color: #2563eb; }
.badge-success  { background: #dcfce7; color: #16a34a; }
.badge-error    { background: #fee2e2; color: #dc2626; }
.badge-secondary{ background: #f3f4f6; color: #6b7280; }

.mini-spinner {
  width: 14px; height: 14px;
  border: 2px solid #f3f4f6; border-top-color: #2563eb;
  border-radius: 50%; animation: spin 1s linear infinite;
  display: inline-block;
}

.btn {
  padding: 8px 16px; border-radius: 6px; font-weight: 500;
  transition: all .2s; cursor: pointer; border: none;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn-primary { background: #2563eb; color: white; }
.btn-primary:not(:disabled):hover { background: #1d4ed8; }

.btn-icon {
  padding: 6px; border-radius: 4px; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.btn-view { background: #f3f4f6; color: #374151; }
.btn-view:hover { background: #e5e7eb; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 50; padding: 16px;
}
.modal {
  background: white; width: 100%; max-width: 720px;
  border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,.1);
  overflow: hidden; max-height: 90vh; display: flex; flex-direction: column;
}
.modal-header {
  padding: 16px 24px; border-bottom: 1px solid #e5e7eb;
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h2 { font-size: 18px; font-weight: 600; margin: 0; display: flex; align-items: center; }
.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #9ca3af; }
.modal-body { padding: 24px; overflow-y: auto; }

.info-label {
  display: block; font-size: 13px; font-weight: 600; color: #9ca3af;
  text-transform: uppercase; margin-bottom: 8px; letter-spacing: .025em;
}
.info-content p { margin: 4px 0; font-size: 14px; color: #374151; }

.item-card {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px;
}
.item-name { font-weight: 500; color: #111827; font-size: 14px; }
.item-meta { font-size: 12px; color: #6b7280; margin-top: 2px; }
.item-total { font-weight: 600; color: #111827; margin-left: 12px; flex-shrink: 0; }

.loading-state, .error-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 48px; text-align: center; color: #6b7280;
}
.spinner {
  width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top-color: #2563eb;
  border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Inline utilities for modal grid */
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0,1fr)); }
.gap-6 { gap: 24px; }
.mb-6 { margin-bottom: 24px; }
.mt-4 { margin-top: 16px; }
.mt-2 { margin-top: 8px; }
.pt-4 { padding-top: 16px; }
.pt-2 { padding-top: 8px; }
.border-t { border-top: 1px solid #e5e7eb; }
.flex { display: flex; }
.flex-1 { flex: 1 1 0%; }
.flex-shrink-0 { flex-shrink: 0; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.space-y-2 > * + * { margin-top: 8px; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-mono { font-family: monospace; }
.text-sm { font-size: .875rem; }
.text-xs { font-size: .75rem; }
.text-lg { font-size: 1.125rem; }
.text-blue-600 { color: #2563eb; }
.text-green-600 { color: #16a34a; }
.text-red-600 { color: #dc2626; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.ml-1 { margin-left: 4px; }
.ml-2 { margin-left: 8px; }
.mr-2 { margin-right: 8px; }
.w-12 { width: 48px; }
.h-12 { height: 48px; }
.rounded-lg { border-radius: 8px; }
.object-cover { object-fit: cover; }
.bg-gray-100 { background: #f3f4f6; }
</style>