<script setup lang="ts">
const props = defineProps<{
  items: any[];
  imageBaseUrl: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}>();

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const getImageUrl = (imgName: string) => {
  if (!imgName) return "https://placehold.co/100x100?text=No+Image";
  return imgName.startsWith("http") ? imgName : `${props.imageBaseUrl}/${imgName}`;
};
</script>

<template>
  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
    <h2 class="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-50">Đơn hàng của bạn</h2>
    
    <!-- Items List -->
    <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
      <div v-for="item in items" :key="item.id" class="flex gap-3">
        <div class="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
          <img :src="getImageUrl(item.images[0])" :alt="item.name" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 text-sm line-clamp-1">{{ item.name }}</p>
          <p class="text-xs text-gray-500">{{ item.brand }}</p>
          <div class="flex items-center justify-between mt-1">
            <span class="text-xs text-gray-600">x{{ item.quantity }}</span>
            <span class="text-sm font-bold text-glow-primary-600">{{ formatPrice(item.price * item.quantity) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="space-y-3 mb-6 pt-4 border-t border-gray-100">
      <div class="flex justify-between text-gray-600">
        <span>Tạm tính</span>
        <span class="font-medium text-gray-900">{{ formatPrice(subtotal) }}</span>
      </div>
      <div class="flex justify-between text-gray-600">
        <span>Phí vận chuyển</span>
        <span class="font-medium text-green-600">{{ shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee) }}</span>
      </div>
      <div v-if="discount > 0" class="flex justify-between text-gray-600">
        <span>Giảm giá</span>
        <span class="font-medium text-red-600">-{{ formatPrice(discount) }}</span>
      </div>
    </div>

    <div class="pt-4 border-t-2 border-gray-200 mb-6">
      <div class="flex justify-between items-end">
        <span class="text-lg font-bold text-gray-900">Tổng cộng</span>
        <span class="text-2xl font-bold text-glow-primary-600">{{ formatPrice(total) }}</span>
      </div>
    </div>

    <button 
      @click="$emit('placeOrder')"
      class="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-lg"
    >
      Đặt hàng
    </button>

    <p class="text-xs text-gray-500 text-center mt-4">
      Bằng việc đặt hàng, bạn đồng ý với 
      <a href="#" class="text-glow-primary-600 hover:underline">Điều khoản sử dụng</a>
    </p>
  </div>
</template>
