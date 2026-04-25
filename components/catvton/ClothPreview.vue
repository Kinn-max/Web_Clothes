<script setup lang="ts">
const props = defineProps<{
  imageUrl: string
  productName?: string
  clothType?: string
}>()

const CLOTH_LABELS: Record<string, string> = {
  upper: 'Áo trên',
  lower: 'Quần',
  overall: 'Toàn thân',
}

const typeLabel = computed(() => CLOTH_LABELS[props.clothType ?? 'upper'] ?? 'Áo trên')
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-sm font-semibold text-gray-700">Trang phục</p>
    <div class="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
      <img v-if="imageUrl" :src="imageUrl" :alt="productName" class="w-full h-full object-cover" />

      <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-4">
        <div class="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
          <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <p class="text-sm text-gray-500">Chưa có ảnh trang phục</p>
      </div>

      <div class="absolute top-2 left-2">
        <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-600 text-white shadow">
          {{ typeLabel }}
        </span>
      </div>
    </div>
    <p v-if="productName" class="text-xs text-gray-500 truncate text-center">{{ productName }}</p>
  </div>
</template>
