<script setup lang="ts">
import { Search } from "lucide-vue-next";
import type { Category } from "@/@type/category";

const props = defineProps<{
  categories: Category[];
  selectedCategory: string | null;
  priceRange: { min: string; max: string };
  searchQuery: string;
}>();
const emit = defineEmits<{
  "update:selectedCategory": [value: string | null];
  "update:priceRange": [value: { min: string; max: string }];
  "update:searchQuery": [value: string];
  applyPrice: [];
}>();

const handleCategorySelect = (cat: Category) => {
  emit("update:selectedCategory", cat.id);
};

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:searchQuery", target.value);
};

const handlePriceApply = () => {
  emit("applyPrice");
};
</script>

<template>
  <aside class="w-full lg:w-72 flex-shrink-0">
    <div class="sticky top-24 space-y-10">
      <!-- Search -->
      <div class="relative group">
        <Search
          class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-glow-primary-500 transition-colors"
        />
        <input
          type="text"
          :value="searchQuery"
          @input="handleSearchInput"
          placeholder="Tìm sản phẩm..."
          class="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-glow-primary-200 focus:border-glow-primary-400 outline-none transition-all"
        />
      </div>

      <!-- Categories -->
      <div>
        <h3 class="font-serif text-xl border-b border-gray-100 pb-3 mb-6">
          Danh Mục
        </h3>
        <div class="space-y-2">
          <button
            @click="emit('update:selectedCategory', null)"
            :class="[
              'w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group',
              selectedCategory === null
                ? 'bg-white shadow-md text-glow-primary-600 font-bold'
                : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-900',
            ]"
          >
            <span class="text-sm tracking-wide">Tất cả</span>
            <div
              v-if="selectedCategory === null"
              class="w-1.5 h-1.5 rounded-full bg-glow-primary-500 animate-pulse"
            ></div>
          </button>

          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="handleCategorySelect(cat)"
            :class="[
              'w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group',
              selectedCategory === cat.id
                ? 'bg-white shadow-md text-glow-primary-600 font-bold'
                : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-900',
            ]"
          >
            <span class="text-sm tracking-wide">{{ cat.name }}</span>
            <div
              v-if="selectedCategory === cat.id"
              class="w-1.5 h-1.5 rounded-full bg-glow-primary-500 animate-pulse"
            ></div>
          </button>
        </div>
      </div>

      <!-- Price Filter -->
      <div>
        <h3 class="font-serif text-xl border-b border-gray-100 pb-3 mb-6">
          Khoảng Giá
        </h3>
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase"
                >Từ</span
              >
              <input
                type="number"
                v-model="priceRange.min"
                class="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-glow-primary-200 outline-none transition-all"
              />
            </div>
            <span class="text-gray-300">—</span>
            <div class="relative flex-1">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase"
                >Đến</span
              >
              <input
                type="number"
                v-model="priceRange.max"
                class="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-glow-primary-200 outline-none transition-all"
              />
            </div>
          </div>
          <button
            @click="handlePriceApply"
            class="w-full py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-glow-primary-600 transition-all shadow-lg hover:shadow-glow-primary-200 active:scale-95"
          >
            Áp Dụng
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>
