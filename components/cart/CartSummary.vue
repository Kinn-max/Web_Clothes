<script setup lang="ts">
import { ShoppingBag, ChevronRight, Tag } from "lucide-vue-next";

const props = defineProps<{
  totalQuantity: number;
  totalPrice: number;
  selectedCount: number;
  hasSelection: boolean;
}>();

const emit = defineEmits<{
  checkout: [];
}>();

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

// Phí ship miễn phí khi đơn >= 500k
const FREESHIP_THRESHOLD = 500_000;
const shippingFee = computed(() =>
  props.totalPrice >= FREESHIP_THRESHOLD ? 0 : 30_000
);
const grandTotal = computed(() => props.totalPrice + shippingFee.value);
const remainForFreeShip = computed(() =>
  Math.max(0, FREESHIP_THRESHOLD - props.totalPrice)
);
</script>

<template>
  <div class="sticky top-24 space-y-4">
    <!-- Summary card -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-100">
        <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag class="w-4 h-4 text-glow-primary-500" />
          Tóm tắt đơn hàng
        </h2>
      </div>

      <!-- Body -->
      <div class="px-5 py-4 space-y-3 text-sm">
        <!-- Số sản phẩm đã chọn -->
        <div class="flex justify-between text-gray-600">
          <span>Sản phẩm đã chọn</span>
          <span class="font-semibold text-gray-900">{{ selectedCount }}</span>
        </div>

        <!-- Tổng số lượng -->
        <div class="flex justify-between text-gray-600">
          <span>Tổng số lượng</span>
          <span class="font-semibold text-gray-900">{{ totalQuantity }}</span>
        </div>

        <!-- Tạm tính -->
        <div class="flex justify-between text-gray-600">
          <span>Tạm tính</span>
          <span class="font-semibold text-gray-900">{{ formatPrice(totalPrice) }}</span>
        </div>

        <!-- Phí ship -->
        <div class="flex justify-between text-gray-600">
          <span>Phí vận chuyển</span>
          <span
            :class="shippingFee === 0
              ? 'font-bold text-green-600'
              : 'font-semibold text-gray-900'"
          >
            {{ shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee) }}
          </span>
        </div>

        <!-- Freeship progress -->
        <div v-if="remainForFreeShip > 0 && hasSelection" class="pt-1">
          <div class="flex justify-between text-xs text-gray-500 mb-1.5">
            <span class="flex items-center gap-1">
              <Tag class="w-3 h-3" />
              Mua thêm để miễn ship
            </span>
            <span class="font-medium text-glow-primary-600">
              {{ formatPrice(remainForFreeShip) }}
            </span>
          </div>
          <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-glow-primary-500 rounded-full transition-all duration-500"
              :style="`width: ${Math.min(100, (totalPrice / FREESHIP_THRESHOLD) * 100)}%`"
            />
          </div>
        </div>

        <div class="border-t border-dashed border-gray-200 pt-3 mt-1">
          <!-- Tổng cộng -->
          <div class="flex justify-between items-center">
            <span class="font-bold text-gray-900">Tổng cộng</span>
            <span class="text-lg font-bold text-glow-primary-600">
              {{ formatPrice(grandTotal) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Checkout button -->
      <div class="px-5 pb-5">
        <button
          @click="emit('checkout')"
          :disabled="!hasSelection"
          class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
          :class="hasSelection
            ? 'bg-glow-primary-600 text-white hover:bg-glow-primary-700 shadow-md hover:shadow-lg active:scale-[0.98]'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
        >
          <ShoppingBag class="w-4 h-4" />
          Tiến hành thanh toán
          <ChevronRight v-if="hasSelection" class="w-4 h-4" />
        </button>

        <p v-if="!hasSelection" class="text-center text-xs text-gray-400 mt-2">
          Vui lòng chọn ít nhất 1 sản phẩm
        </p>
      </div>
    </div>

    <!-- Chính sách -->
    <div class="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-xs text-gray-500">
      <p class="flex items-center gap-2">✓ Đổi trả miễn phí trong 7 ngày</p>
      <p class="flex items-center gap-2">✓ Thanh toán an toàn & bảo mật</p>
      <p class="flex items-center gap-2">✓ Hỗ trợ 24/7</p>
    </div>
  </div>
</template>