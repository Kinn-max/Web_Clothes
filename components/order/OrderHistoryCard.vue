<script setup lang="ts">
import {
  Package,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  ShoppingBag,
  X,
  User,
} from "lucide-vue-next";
import type { Order } from "@/@type/order";

const props = defineProps<{
  order: Order;
  paying?: boolean;
}>();

defineEmits<{
  (e: "cancel", orderId: string): void;
  (e: "pay", order: Order): void;
}>();

const IMAGE_BASE_URL = "http://localhost:8081/uploads/products";

const getImageUrl = (img?: string) => {
  if (!img) return "https://placehold.co/48x48?text=?";
  return img.startsWith("http") ? img : `${IMAGE_BASE_URL}/${img}`;
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (val: any) => {
  const d = typeof val === "string" ? new Date(val) : val;
  if (!(d instanceof Date) || isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusMap: Record<string, { label: string; cls: string }> = {
  pending:   { label: "Đang chờ xử lý",  cls: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận",     cls: "bg-blue-100 text-blue-700" },
  shipping:  { label: "Đang giao hàng",  cls: "bg-purple-100 text-purple-700" },
  completed: { label: "Đã giao hàng",    cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy",          cls: "bg-red-100 text-red-700" },
};

const getStatus = (s: string) =>
  statusMap[s.toLowerCase()] ?? { label: s, cls: "bg-gray-100 text-gray-700" };

const paymentMethodLabel = (m?: string) => {
  switch (m?.toLowerCase()) {
    case "banking": return "Chuyển khoản ngân hàng";
    case "cod":     return "Thanh toán khi nhận hàng (COD)";
    default:        return m ?? "—";
  }
};

const paymentStatusLabel = (s?: string) =>
  s?.toLowerCase() === "paid" ? "Đã thanh toán" : "Chưa thanh toán";

const paymentStatusCls = (s?: string) =>
  s?.toLowerCase() === "paid"
    ? "text-green-600 bg-green-50 px-2 py-0.5 rounded-lg"
    : "text-red-600 bg-red-50 px-2 py-0.5 rounded-lg";

const canCancel = (o: Order) => o.status.toLowerCase() === "pending";
const canPay    = (o: Order) =>
  o.paymentMethod?.toLowerCase() === "banking" &&
  o.paymentStatus?.toLowerCase() !== "paid" &&
  o.status.toLowerCase() !== "cancelled";
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
  >
    <!-- Header -->
    <div class="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-glow-primary-50 text-glow-primary-600 rounded-xl">
          <Package class="w-6 h-6" />
        </div>
        <div>
          <!-- Hiện 8 ký tự đầu của Firestore ID cho gọn -->
          <h3 class="text-lg font-bold text-gray-900">
            Đơn hàng #{{ order.id.slice(0, 8).toUpperCase() }}
          </h3>
          <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Calendar class="w-4 h-4" />
            {{ formatDate(order.createdAt) }}
          </div>
        </div>
      </div>
      <span
        :class="['px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider', getStatus(order.status).cls]"
      >
        {{ getStatus(order.status).label }}
      </span>
    </div>

    <!-- Body -->
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <!-- Thông tin giao hàng -->
        <div class="space-y-4">
          <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Thông tin giao hàng
          </h4>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <User class="w-5 h-5 text-gray-400 flex-shrink-0" />
              <p class="text-gray-700 text-sm font-medium">
                {{ order.shippingAddress?.fullName ?? "—" }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <Phone class="w-5 h-5 text-gray-400 flex-shrink-0" />
              <p class="text-gray-700 text-sm">
                {{ order.shippingAddress?.phone ?? "—" }}
              </p>
            </div>
            <div class="flex items-start gap-3">
              <MapPin class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p class="text-gray-700 text-sm leading-relaxed">
                {{ order.shippingAddress?.address ?? "—" }}
              </p>
            </div>
            <div class="flex items-start gap-3">
              <CreditCard class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-gray-700 text-sm font-medium">
                  {{ paymentMethodLabel(order.paymentMethod) }}
                </p>
                <p
                  v-if="order.paymentMethod?.toLowerCase() === 'banking'"
                  class="text-xs mt-1 flex items-center gap-1 font-medium"
                >
                  <span class="text-gray-500">Thanh toán:</span>
                  <span :class="paymentStatusCls(order.paymentStatus)">
                    {{ paymentStatusLabel(order.paymentStatus) }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tóm tắt giá -->
        <div class="space-y-4">
          <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Tóm tắt đơn hàng
          </h4>
          <div class="bg-gray-50 rounded-xl p-4 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Tạm tính:</span>
              <span class="font-medium text-gray-900">{{ formatPrice(order.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Phí vận chuyển:</span>
              <span class="font-medium" :class="order.shippingFee === 0 ? 'text-green-600' : 'text-gray-900'">
                {{ order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee) }}
              </span>
            </div>
            <div v-if="order.discount > 0" class="flex justify-between text-sm text-green-600">
              <span>
                Giảm giá
                <span v-if="order.voucherCode" class="font-bold">({{ order.voucherCode }})</span>:
              </span>
              <span>-{{ formatPrice(order.discount) }}</span>
            </div>
            <div class="pt-3 border-t border-gray-200 flex justify-between items-center">
              <span class="font-bold text-gray-900">Tổng cộng:</span>
              <span class="text-xl font-bold text-glow-primary-600">
                {{ formatPrice(order.totalPrice) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chi tiết sản phẩm -->
      <div class="mt-8 pt-6 border-t border-gray-50">
        <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
          Chi tiết sản phẩm
        </h4>
        <div class="space-y-3">
          <div
            v-for="(item, idx) in order.items"
            :key="item.product_id + idx"
            class="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  :src="getImageUrl(item.images?.[0])"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div>
                <p class="text-sm font-bold text-gray-900 line-clamp-1">{{ item.name }}</p>
                <p class="text-xs text-gray-500">
                  {{ item.brand }} · x{{ item.quantity }} · {{ formatPrice(item.price) }}
                </p>
              </div>
            </div>
            <p class="text-sm font-bold text-gray-900 ml-4 flex-shrink-0">
              {{ formatPrice(item.price * item.quantity) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end gap-3">
        <button
          v-if="canCancel(order)"
          @click="$emit('cancel', order.id)"
          class="px-6 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
        >
          <X class="w-4 h-4" />
          Hủy đơn hàng
        </button>
        <button
          v-if="canPay(order)"
          @click="$emit('pay', order)"
          :disabled="paying"
          class="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-glow-primary-600 hover:bg-glow-primary-700 transition-all active:scale-95 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard class="w-4 h-4" />
          {{ paying ? "Đang xử lý..." : "Thanh toán ngay" }}
        </button>
      </div>
    </div>
  </div>
</template>