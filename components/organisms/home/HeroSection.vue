<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
</script>

<template>
  <section class="relative bg-glow-primary-50 overflow-hidden">
    <div class="container mx-auto px-4 md:px-6 py-12 md:py-24 lg:py-32 flex flex-col md:flex-row items-center">
      <div class="w-full md:w-1/2 space-y-6 z-10">
        <span class="inline-block px-3 py-1 bg-glow-primary-100 text-glow-primary-800 text-xs font-bold uppercase tracking-widest rounded-full">
          Bộ Sưu Tập Mới
        </span>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight">
          Khám Phá <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-glow-primary-600 to-glow-secondary-500">
            Vẻ Đẹp Rạng Ngời
          </span>
        </h1>
        <p class="text-gray-600 text-lg md:max-w-md leading-relaxed">
            Nâng tầm quy trình làm đẹp của bạn với bộ sưu tập mỹ phẩm và chăm sóc da cao cấp của chúng tôi. Được thiết kế để giúp bạn tỏa sáng.
        </p>
        <div class="flex flex-wrap gap-4 pt-4">
          <NuxtLink to="/shop" class="px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-glow-primary-600 transition-colors flex items-center gap-2">
            Mua Sắm Ngay <ArrowRight class="w-4 h-4" />
          </NuxtLink>
          <NuxtLink to="/about" class="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:border-glow-primary-600 hover:text-glow-primary-600 transition-colors">
            Tìm Hiểu Thêm
          </NuxtLink>
        </div>
      </div>
      
      <!-- Decorative Circle/Placeholder for Image -->
      <div class="w-full md:w-1/2 mt-12 md:mt-0 relative">
        <div class="relative w-full aspect-square max-w-md mx-auto">
            <div class="absolute inset-0 bg-glow-primary-200 rounded-full opacity-20 blur-3xl transform translate-x-4 translate-y-4"></div>
            <div class="absolute inset-0 bg-glow-secondary-200 rounded-full opacity-20 blur-3xl transform -translate-x-4 -translate-y-4"></div>
            
            <!-- Product Image -->
            <div class="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
              <img src="/the_final_set.jpg" alt="Bộ Sưu Tập Mới GlowUp" class="w-full h-full object-cover" />
            </div>
        </div>
      </div>
    </div>
  </section>
</template>
