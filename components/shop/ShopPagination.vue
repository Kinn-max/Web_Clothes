<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  "update:currentPage": [value: number];
}>();
</script>

<template>
  <div class="flex justify-center items-center mt-20 gap-3">
    <button 
      @click="emit('update:currentPage', currentPage - 1)"
      :disabled="currentPage === 1"
      class="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:border-glow-primary-400 hover:text-glow-primary-600 transition-all active:scale-90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronLeft class="w-5 h-5" />
    </button>
    
    <button 
      v-for="page in totalPages" 
      :key="page"
      @click="emit('update:currentPage', page)"
      :class="[
        'w-12 h-12 flex items-center justify-center rounded-2xl font-bold transition-all active:scale-90',
        currentPage === page 
          ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
          : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm'
      ]"
    >
      {{ page }}
    </button>

    <button 
      @click="emit('update:currentPage', currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:border-glow-primary-400 hover:text-glow-primary-600 transition-all active:scale-90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ChevronRight class="w-5 h-5" />
    </button>
  </div>
</template>
