<template>
  <div class="group relative flex flex-col">
    <!-- Image Container -->
    <div class="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-sm mb-3 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-1">
      <NuxtLink :to="`/shop/products/${product.id}`" class="block w-full h-full">
        <img
          v-if="product.images?.length"
          :src="product.images[0]"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 italic text-sm">
          Chưa có hình ảnh
        </div>
      </NuxtLink>

      <!-- Badge -->
      <div class="absolute top-3 left-3">
        <span class="px-2.5 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 rounded-full shadow-sm">
          New
        </span>
      </div>

      <!-- Hover Actions -->
      <div class="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
        <div class="flex gap-2">
          <button
            @click.prevent="emit('quickAdd', product)"
            :disabled="addingToCartId === product.id"
            class="flex-1 h-10 bg-gray-900 text-white rounded-2xl font-bold text-xs tracking-wide shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-glow-primary-600 disabled:opacity-70"
          >
            <template v-if="addingToCartId !== product.id">
              <ShoppingBag class="w-3.5 h-3.5" />
              Thêm vào giỏ
            </template>
            <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </button>
          <button class="w-10 h-10 bg-white text-gray-900 rounded-2xl flex items-center justify-center shadow-xl hover:text-red-500 transition-colors active:scale-95">
            <Heart class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Product Info — luôn hiển thị, không bị che -->
    <div class="px-1">
      <div class="flex items-center gap-1 mb-1">
        <div class="flex text-glow-secondary-400">
          <Star v-for="n in 5" :key="n" class="w-3 h-3 fill-current" />
        </div>
        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">(03)</span>
      </div>

      <NuxtLink :to="`/shop/products/${product.id}`" class="block">
        <h3 class="text-sm font-semibold text-gray-900 mb-1.5 leading-snug line-clamp-2 hover:text-glow-primary-600 transition-colors">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <span class="text-sm font-bold text-gray-900">
        {{ formatPrice(product.price) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, ShoppingBag, Heart } from 'lucide-vue-next';
import type { Product } from '../../types/product';

const props = defineProps<{
  product: Product;
  addingToCartId: number | string | null;
  imageBaseUrl?: string;
}>();

const emit = defineEmits<{
  quickAdd: [product: Product];
}>();

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
</script>