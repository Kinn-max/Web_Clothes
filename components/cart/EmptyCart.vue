<script setup lang="ts">
import { ShoppingCart, ArrowRight } from "lucide-vue-next";
</script>

<template>
  <div class="flex flex-col items-center justify-center py-24 text-center">
    <!-- Icon -->
    <div class="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
      <ShoppingCart class="w-10 h-10 text-gray-300" />
    </div>

    <h2 class="text-xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
    <p class="text-gray-500 text-sm mb-8 max-w-xs">
      Bạn chưa có sản phẩm nào trong giỏ hàng. Khám phá cửa hàng và chọn những sản phẩm yêu thích nhé!
    </p>

    <NuxtLink
      to="/shop"
      class="inline-flex items-center gap-2 px-6 py-3 bg-glow-primary-600 text-white font-bold text-sm rounded-xl hover:bg-glow-primary-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
    >
      Khám phá cửa hàng
      <ArrowRight class="w-4 h-4" />
    </NuxtLink>
  </div>
</template>