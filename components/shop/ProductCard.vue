<script setup lang="ts">
import { Star, ShoppingBag, Heart } from "lucide-vue-next";
import type { Product } from "../../@type/product";

const props = defineProps<{
  product: Product;
  addingToCartId: number | null;
  imageBaseUrl: string;
}>();

const emit = defineEmits<{
  quickAdd: [product: Product];
}>();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};
</script>

<template>
  <div class="group relative flex flex-col">
    <!-- Image Container -->
    <div class="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-sm mb-6 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
      <NuxtLink :to="`/shop/products/${product.id}`" class="block w-full h-full">
        <img
          v-if="product.images?.length"
          :src="`${product.images[0]}`"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 italic">
          Chưa có hình ảnh
        </div>
      </NuxtLink>

      <!-- Status Badges -->
      <div class="absolute top-4 left-4 flex flex-col gap-2">
        <span class="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 rounded-full shadow-sm">
          New
        </span>
      </div>

      <!-- Hover Actions Overlay -->
      <div class="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
        <div class="flex gap-2">
          <button 
            @click.prevent="emit('quickAdd', product)"
            class="flex-1 h-12 bg-gray-900 text-white rounded-2xl font-bold text-sm tracking-wide shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-glow-primary-600"
            :disabled="addingToCartId === product.id"
          >
            <template v-if="addingToCartId !== product.id">
              <ShoppingBag class="w-4 h-4" />
              Thêm Vào Giỏ
            </template>
            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" v-else></div>
          </button>
          <button class="w-12 h-12 bg-white text-gray-900 rounded-2xl flex items-center justify-center shadow-xl hover:text-red-500 transition-colors active:scale-95">
            <Heart class="w-5 h-5 transition-transform duration-300 hover:scale-110" />
          </button>
        </div>
      </div>
    </div>

    <!-- Product Info -->
    <div class="px-2">
      <div class="flex items-center gap-1.5 mb-2">
        <div class="flex text-glow-secondary-400">
          <Star v-for="n in 5" :key="n" class="w-3 h-3 fill-current" />
        </div>
        <span class="text-[11px] text-gray-400 font-bold uppercase tracking-widest">(03)</span>
      </div>

      <NuxtLink :to="`/shop/products/${product.id}`" class="block group/title">
        <h3 class="font-serif text-xl text-gray-900 mb-2 leading-tight transition-colors group-hover/title:text-glow-primary-600 line-clamp-2">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <div class="flex items-end justify-between">
        <span class="text-lg font-bold text-gray-900 tracking-tight">
          {{ formatPrice(product.price) }}
        </span>
      </div>
    </div>
  </div>
</template>
