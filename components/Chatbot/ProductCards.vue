<template>
  <div class="flex gap-3 overflow-x-auto pb-4 no-scrollbar mt-2">
    <div
      v-for="product in products"
      :key="product.id"
      class="min-w-[170px] bg-white rounded-2xl shadow-sm border border-glow-primary-100 p-3 text-xs transition-all hover:shadow-md"
    >
      <div class="mt-2 font-bold text-gray-900 line-clamp-2 leading-snug">
        {{ product.name }}
      </div>

      <div class="text-glow-primary-600 font-bold mt-2 text-sm">
        {{ formatPrice(product.price) }}₫
      </div>

      <div class="text-gray-400 text-[10px] mt-1 uppercase tracking-wider">
        {{ product.brand }}
      </div>

      <NuxtLink
        :to="`/shop/products/${product.id}`"
        class="block mt-3 text-center text-white bg-gray-900 rounded-xl py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-glow-primary-600 transition-colors shadow-sm"
      >
        Xem chi tiết
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<script setup lang="ts">
import type { Product } from '@/composables/useChatbot';

defineProps<{
  products: Product[];
}>();



const formatPrice = (price: number) =>
  price.toLocaleString('vi-VN');
</script>
