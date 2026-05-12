<script setup lang="ts">
import { useOrder } from "@/composables/useOrder";
import { useShipping } from "@/composables/useShipping";
import { useNotification } from "@/composables/useNotification";
import type { Order } from "@/types/order";
import type { ShippingStatus } from "@/types/shipping";

definePageMeta({ layout: "admin" });

const { orders, loading, error, fetchAllOrders, updateOrderStatus } = useOrder();
const { updateShippingStatus } = useShipping();
const { showNotification } = useNotification();

const searchQuery = ref("");
const statusFilter = ref("all");
const selectedOrder = ref<Order | null>(null);
const showDetailModal = ref(false);
const submitting = ref(false);

// shipping tracking không có trong Order type — lưu local
const orderShippingMap = ref<Record<string, ShippingStatus>>({});

const newShippingStatus = ref<ShippingStatus>("pending");
const newLocation = ref("");
const newDescription = ref("");
const newOrderStatus = ref<Order["status"]>("pending");

const shippingStatusOptions: { value: ShippingStatus; label: string }[] = [
  { value: "pending",           label: "Chờ xử lý" },
  { value: "confirmed",         label: "Đã xác nhận" },
  { value: "preparing",         label: "Đang chuẩn bị" },
  { value: "ready_to_ship",     label: "Sẵn sàng giao" },
  { value: "picking_up",        label: "Đang lấy hàng" },
  { value: "picked_up",         label: "Đã lấy hàng" },
  { value: "in_transit",        label: "Đang vận chuyển" },
  { value: "out_for_delivery",  label: "Đang giao hàng" },
  { value: "delivered",         label: "Đã giao hàng" },
  { value: "failed",            label: "Giao thất bại" },
  { value: "returning",         label: "Đang hoàn trả" },
  { value: "returned",          label: "Đã hoàn trả" },
  { value: "cancelled",         label: "Đã hủy" },
];

const orderStatusOptions: { value: Order["status"]; label: string }[] = [
  { value: "pending",   label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping",  label: "Đang giao hàng" },
  { value: "completed", label: "Đã giao hàng" },
  { value: "cancelled", label: "Đã hủy" },
];

// ── Helpers ────────────────────────────────────────────────
// Order không có shipping_status/phone/address trực tiếp
// → lấy từ shippingAddress nested + orderShippingMap
const getPhone   = (o: Order) => o.shippingAddress?.phone   || "N/A";
const getAddress = (o: Order) => o.shippingAddress?.address || "N/A";
const getShippingStatus = (o: Order): ShippingStatus =>
  orderShippingMap.value[o.id] ?? "pending";

const filteredOrders = computed(() =>
  orders.value.filter((order) => {
    const phone   = getPhone(order);
    const address = getAddress(order);
    const matchSearch =
      searchQuery.value === "" ||
      order.id.includes(searchQuery.value) ||
      phone.includes(searchQuery.value) ||
      address.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchStatus =
      statusFilter.value === "all" ||
      getShippingStatus(order) === statusFilter.value ||
      order.status === statusFilter.value;
    return matchSearch && matchStatus;
  })
);

const openDetail = (order: Order) => {
  selectedOrder.value = { ...order };
  newShippingStatus.value = getShippingStatus(order);
  newOrderStatus.value = order.status;
  newLocation.value = "";
  newDescription.value = "";
  showDetailModal.value = true;
};

const closeModal = () => {
  showDetailModal.value = false;
  selectedOrder.value = null;
};

// ── Update shipping ────────────────────────────────────────
const handleUpdateShipping = async () => {
  if (!selectedOrder.value) return;
  submitting.value = true;
  try {
    await updateShippingStatus(selectedOrder.value.id, {
      status: newShippingStatus.value,
      location: newLocation.value,
      description: newDescription.value,
    });
    // lưu local vì Order type không có shipping_status
    orderShippingMap.value[selectedOrder.value.id] = newShippingStatus.value;
    showNotification("Thành công", "Đã cập nhật trạng thái vận chuyển", "success");
    newLocation.value = "";
    newDescription.value = "";
  } catch (err: any) {
    showNotification("Lỗi", err.data?.message || "Không thể cập nhật trạng thái vận chuyển", "error");
  } finally {
    submitting.value = false;
  }
};

// ── Update order status ────────────────────────────────────
const handleUpdateOrderStatus = async () => {
  if (!selectedOrder.value) return;
  if (newOrderStatus.value === selectedOrder.value.status) return;
  submitting.value = true;
  try {
    // ✅ Fix: updateOrderStatus nhận Order["status"], không phải string
    await updateOrderStatus(selectedOrder.value.id, newOrderStatus.value);
    showNotification("Thành công", "Đã cập nhật trạng thái đơn hàng", "success");
    await fetchAllOrders();
    selectedOrder.value = orders.value.find((o) => o.id === selectedOrder.value!.id) ?? null;
  } catch (err: any) {
    showNotification("Lỗi", err.data?.message || "Không thể cập nhật trạng thái đơn hàng", "error");
  } finally {
    submitting.value = false;
  }
};

// ── Label / badge helpers ──────────────────────────────────
const getShippingStatusLabel = (status: ShippingStatus) =>
  shippingStatusOptions.find((o) => o.value === status)?.label ?? "Chưa có";

const getOrderStatusLabel = (status: Order["status"]) =>
  orderStatusOptions.find((o) => o.value === status)?.label ?? "Chưa có";

const getShippingBadgeClass = (status: ShippingStatus) => {
  if (status === "delivered") return "bg-green-100 text-green-700";
  if (["in_transit","out_for_delivery","picking_up","picked_up"].includes(status))
    return "bg-blue-100 text-blue-700";
  if (["preparing","ready_to_ship","confirmed"].includes(status))
    return "bg-yellow-100 text-yellow-700";
  if (["failed","cancelled","returned","returning"].includes(status))
    return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
};

const getOrderBadgeClass = (status: Order["status"]) => {
  if (status === "completed") return "bg-green-100 text-green-700";
  if (status === "shipping")  return "bg-blue-100 text-blue-700";
  if (status === "confirmed") return "bg-cyan-100 text-cyan-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};

const formatDate = (dateStr: any) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("vi-VN");
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price ?? 0);

onMounted(fetchAllOrders);
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Quản lý vận chuyển</h1>
      <p class="text-gray-500 mt-1">Quản lý trạng thái vận chuyển và đơn hàng</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm theo mã đơn, SĐT, địa chỉ..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <optgroup label="Trạng thái vận chuyển">
            <option v-for="opt in shippingStatusOptions" :key="'s-' + opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </optgroup>
          <optgroup label="Trạng thái đơn hàng">
            <option v-for="opt in orderStatusOptions" :key="'o-' + opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </optgroup>
        </select>
        <div class="flex items-center text-sm text-gray-500">
          Tổng: <strong class="ml-1">{{ filteredOrders.length }}</strong> đơn hàng
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !orders.length" class="flex flex-col items-center py-16">
      <div class="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p class="text-gray-500">Đang tải dữ liệu...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" @click="fetchAllOrders">
        Thử lại
      </button>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mã đơn</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Đơn hàng</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vận chuyển</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              @click="openDetail(order)"
            >
              <td class="px-4 py-3 text-sm font-semibold text-gray-900">#{{ order.id }}</td>
              <td class="px-4 py-3">
                <div class="text-sm text-gray-900">{{ getPhone(order) }}</div>
                <div class="text-xs text-gray-400 truncate max-w-[200px]">{{ getAddress(order) }}</div>
              </td>
              <td class="px-4 py-3 text-sm font-medium text-blue-600">{{ formatPrice(order.totalPrice) }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getOrderBadgeClass(order.status)">
                  {{ getOrderStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getShippingBadgeClass(getShippingStatus(order))">
                  {{ getShippingStatusLabel(getShippingStatus(order)) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(order.createdAt) }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  class="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  @click.stop="openDetail(order)"
                >
                  Chi tiết
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredOrders.length === 0" class="text-center py-16 text-gray-400">
        Không tìm thấy đơn hàng nào
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailModal && selectedOrder"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="closeModal"
      >
        <div class="bg-white w-full max-w-3xl rounded-xl shadow-2xl max-h-[90vh] flex flex-col mx-4">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h2 class="text-lg font-bold text-gray-900">Chi tiết đơn hàng #{{ selectedOrder.id }}</h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto px-6 py-5 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Thông tin đơn hàng -->
              <div class="space-y-3">
                <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">Thông tin đơn hàng</h3>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Mã đơn:</span>
                    <span class="font-semibold">#{{ selectedOrder.id }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Tổng tiền:</span>
                    <span class="font-semibold text-blue-600">{{ formatPrice(selectedOrder.totalPrice) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Thanh toán:</span>
                    <span>{{ selectedOrder.paymentMethod || "N/A" }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Ngày đặt:</span>
                    <span>{{ formatDate(selectedOrder.createdAt) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">Trạng thái:</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getOrderBadgeClass(selectedOrder.status)">
                      {{ getOrderStatusLabel(selectedOrder.status) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Thông tin giao hàng -->
              <div class="space-y-3">
                <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">Thông tin giao hàng</h3>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Họ tên:</span>
                    <span>{{ selectedOrder.shippingAddress?.fullName || "N/A" }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">SĐT:</span>
                    <span>{{ selectedOrder.shippingAddress?.phone || "N/A" }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Địa chỉ:</span>
                    <p class="mt-1">{{ selectedOrder.shippingAddress?.address || "N/A" }}</p>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">Vận chuyển:</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getShippingBadgeClass(getShippingStatus(selectedOrder))">
                      {{ getShippingStatusLabel(getShippingStatus(selectedOrder)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cập nhật trạng thái đơn hàng -->
            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">Cập nhật trạng thái đơn hàng</h3>
              <div class="flex gap-3">
                <select
                  v-model="newOrderStatus"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  :disabled="submitting || ['completed','cancelled'].includes(selectedOrder.status)"
                >
                  <option v-for="opt in orderStatusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <button
                  class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                  :disabled="submitting || newOrderStatus === selectedOrder.status || ['completed','cancelled'].includes(selectedOrder.status)"
                  @click="handleUpdateOrderStatus"
                >
                  Cập nhật
                </button>
              </div>
            </div>

            <!-- Cập nhật trạng thái vận chuyển -->
            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">Cập nhật trạng thái vận chuyển</h3>
              <div class="space-y-3">
                <select
                  v-model="newShippingStatus"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  :disabled="submitting"
                >
                  <option v-for="opt in shippingStatusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <input
                  v-model="newLocation"
                  type="text"
                  placeholder="Vị trí (VD: Bưu cục Quận 1, TP.HCM)"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  :disabled="submitting"
                />
                <textarea
                  v-model="newDescription"
                  rows="2"
                  placeholder="Mô tả thêm..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                  :disabled="submitting"
                />
                <button
                  class="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                  :disabled="submitting"
                  @click="handleUpdateShipping"
                >
                  {{ submitting ? "Đang cập nhật..." : "✓ Cập nhật vận chuyển" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>