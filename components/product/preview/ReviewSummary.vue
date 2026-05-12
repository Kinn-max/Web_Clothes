<script setup lang="ts">
import { Star } from 'lucide-vue-next'

const props = defineProps<{
  averageRating: string | number
  totalReviews: number
  ratingCounts: Record<number, number>
  filterRating: string
}>()

const emit = defineEmits<{
  'update:filterRating': [value: string]
  'update:page': [value: number]
}>()
</script>

<template>
  <div class="bg-gradient-to-br from-pink-50 via-white to-pink-50/50 border border-pink-100 rounded-3xl p-8 mb-8 shadow-sm">
    <div class="flex flex-col md:flex-row items-center gap-8">

      <!-- Average -->
      <div class="text-center min-w-[140px]">
        <div class="text-6xl font-bold text-glow-primary-600 mb-2">
          {{ averageRating }}
        </div>
        <div class="flex justify-center text-yellow-400 mb-2">
          <Star
            v-for="n in 5" :key="n"
            class="w-4 h-4 fill-current"
            :class="{ 'text-gray-300': n > Math.round(parseFloat(String(averageRating))) }"
          />
        </div>
        <div class="text-sm text-gray-500 font-medium">{{ totalReviews }} đánh giá</div>
      </div>

      <!-- Filter buttons -->
      <div class="flex flex-wrap gap-2 justify-center md:justify-start">
        <button
          @click="emit('update:filterRating', ''); emit('update:page', 1)"
          class="px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
          :class="filterRating === ''
            ? 'bg-glow-primary-600 text-white'
            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-glow-primary-400'"
        >
          Tất cả
        </button>

        <button
          v-for="star in [5, 4, 3, 2, 1]" :key="star"
          @click="emit('update:filterRating', String(star)); emit('update:page', 1)"
          class="px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1 transition-all"
          :class="filterRating === String(star)
            ? 'bg-glow-primary-600 text-white'
            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-glow-primary-400'"
        >
          <span v-for="n in 5" :key="n" class="text-lg">
            <span v-if="n <= star" :class="filterRating === String(star) ? 'text-yellow-300' : 'text-yellow-400'">★</span>
            <span v-else :class="filterRating === String(star) ? 'text-gray-400' : 'text-gray-300'">★</span>
          </span>
          <span>({{ ratingCounts[star] ?? 0 }})</span>
        </button>
      </div>
    </div>
  </div>
</template>