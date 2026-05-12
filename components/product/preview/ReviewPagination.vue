<script setup lang="ts">
const props = defineProps<{
  page: number
  totalPages: number
  totalReviews: number
  reviewsCount: number
}>()

const emit = defineEmits<{
  'update:page': [value: number]
}>()
</script>

<template>
  <!-- Pagination -->
  <div v-if="totalPages > 1"
    class="text-center mt-10 flex items-center justify-center gap-4">
    <button
      @click="emit('update:page', Math.max(1, page - 1))"
      :disabled="page === 1"
      class="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-glow-primary-400">
      Trước
    </button>

    <div class="flex gap-2">
      <button
        v-for="p in Math.min(5, totalPages)" :key="p"
        @click="emit('update:page', p)"
        class="px-3 py-2 rounded-lg font-medium"
        :class="page === p
          ? 'bg-glow-primary-600 text-white'
          : 'border border-gray-200 hover:border-glow-primary-400'">
        {{ p }}
      </button>
    </div>

    <button
      @click="emit('update:page', Math.min(totalPages, page + 1))"
      :disabled="page === totalPages"
      class="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-glow-primary-400">
      Sau
    </button>
  </div>

  <!-- Load more -->
  <div v-else-if="totalReviews > reviewsCount" class="text-center mt-10">
    <button
      @click="emit('update:page', page + 1)"
      class="px-8 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all shadow-sm hover:shadow-md active:scale-95">
      Xem thêm đánh giá
    </button>
  </div>
</template>