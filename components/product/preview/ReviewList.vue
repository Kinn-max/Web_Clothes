<script setup lang="ts">
import { Star, CheckCircle2 } from 'lucide-vue-next'
import type { Review } from '@/types/review'

defineProps<{
  reviews: Review[]
  isLoading: boolean
}>()

const getDisplayName = (review: Review) => {
  if (review.is_anonymous) return 'Người dùng ẩn danh'
  return review.username || review.full_name || 'Người dùng'
}

const getInitial = (review: Review) => {
  if (review.is_anonymous) return 'A'
  return (review.username || review.full_name || 'U').charAt(0).toUpperCase()
}
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoading" class="text-center py-12">
    <p class="text-gray-500">Đang tải đánh giá...</p>
  </div>

  <div v-else class="space-y-6">
    <div v-for="review in reviews" :key="review.id"
      class="flex gap-4 pb-6 border-b border-gray-100 last:border-0">

      <!-- Avatar -->
      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-glow-primary-100 to-purple-100 flex items-center justify-center font-bold text-glow-primary-700 flex-shrink-0 text-lg">
        {{ getInitial(review) }}
      </div>

      <div class="flex-1">
        <!-- User info -->
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span class="font-semibold text-gray-900">{{ getDisplayName(review) }}</span>
          <span v-if="review.has_purchased"
            class="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">
            <CheckCircle2 class="w-3.5 h-3.5" />
            Đã mua hàng
          </span>
          <span v-else
            class="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full font-medium">
            Chưa mua hàng
          </span>
        </div>

        <!-- Stars -->
        <div class="flex text-yellow-400 mb-2">
          <Star v-for="n in 5" :key="n"
            class="w-3.5 h-3.5"
            :class="n <= review.rating ? 'fill-current' : 'text-gray-300 fill-current'" />
        </div>

        <!-- Date -->
        <div class="text-xs text-gray-500 mb-3 font-medium">
          {{ new Date(review.created_at || '').toLocaleDateString('vi-VN') }}
        </div>

        <!-- Comment -->
        <p class="text-gray-700 leading-relaxed mb-3">{{ review.comment }}</p>

        <!-- Media -->
        <div v-if="review.media_urls?.length" class="grid grid-cols-4 gap-2 mt-3">
          <div v-for="(url, index) in review.media_urls" :key="index"
            class="bg-gray-100 rounded-lg overflow-hidden">
            <img v-if="url.match(/\.(jpg|jpeg|png|gif)$/i)"
              :src="url" :alt="`media-${index}`"
              class="w-full h-20 object-cover cursor-pointer hover:opacity-80" />
            <video v-else :src="url"
              class="w-full h-20 object-cover cursor-pointer hover:opacity-80" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="!reviews.length" class="text-center py-12 text-gray-500">
      <p class="text-lg">Chưa có đánh giá nào</p>
      <p class="text-sm">Hãy là người đầu tiên đánh giá sản phẩm này</p>
    </div>
  </div>
</template>