<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
import { useCategory } from "@/composables/useCategories";
import type { Category } from "../../../@type/category";

const config = useRuntimeConfig();
const { categories, loading, getAll } = useCategory();

// Helper ảnh
const getImageUrl = (img?: string) => {
  if (!img) return "/images/placeholder-category.png";
  if (img.startsWith("http")) return img;
  return `${config.public.assetBaseUrl}/uploads/categories/${img}`;
};

onMounted(() => {
  getAll();
});
</script>
<template>
  <section class="py-20 bg-white">
    <div class="container mx-auto px-4 md:px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-3xl font-serif font-bold text-gray-900 mb-4">
          Mua Sắm Theo Danh Mục
        </h2>
        <p class="text-gray-500">
          Khám phá các dòng sản phẩm đa dạng phù hợp với mọi loại da và sở thích
          làm đẹp.
        </p>
      </div>

      <div v-if="loading" class="text-center text-gray-400">
        Đang tải danh mục...
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/categories/${cat.id}`"
          class="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-gray-100"
        >
          <img
            :src="getImageUrl(cat.image)"
            :alt="cat.name"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div
            class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white"
          >
            <h3 class="text-2xl font-serif font-bold mb-2">
              {{ cat.name }}
            </h3>
            <span
              class="text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2"
            >
              Xem Bộ Sưu Tập
              <ArrowRight class="w-4 h-4" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
