<script setup lang="ts">
import { SlidersHorizontal } from "lucide-vue-next";

const props = defineProps<{
  count: number;
  sortBy: string;
}>();

const emit = defineEmits<{
  "update:sortBy": [value: string];
}>();

const handleSortChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit("update:sortBy", target.value);
};
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-50 mb-10 gap-4">
    <p class="text-gray-500 text-sm italic font-medium">
      Hiển thị <span class="text-gray-900 font-bold not-italic px-1">{{ count }}</span> sản phẩm
    </p>
    
    <div class="flex items-center gap-4">
      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sắp xếp theo</span>
      <div class="relative min-w-[180px]">
        <select 
          :value="sortBy"
          @change="handleSortChange"
          class="w-full appearance-none pl-4 pr-10 py-2.5 bg-glow-bg border-none rounded-xl text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-glow-primary-200 cursor-pointer"
        >
          <option value="featured">Phổ biến nhất</option>
          <option value="price-asc">Giá: Thấp đến Cao</option>
          <option value="price-desc">Giá: Cao đến Thấp</option>
        </select>
        <SlidersHorizontal class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  </div>
</template>
