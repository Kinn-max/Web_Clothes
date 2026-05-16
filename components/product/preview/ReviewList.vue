<script setup lang="ts">
import { ref } from 'vue'
import { Star, CheckCircle2 } from 'lucide-vue-next'
import type { Review } from '@/types/review'

defineProps<{
  reviews: Review[]
  isLoading: boolean
}>()

const imgError = ref<Record<number, boolean>>({})

const AVATAR_COLORS = [
  '#e11d48', '#7c3aed', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#6d28d9', '#0284c7',
]

const getAvatarColor = (userId: number) =>
  AVATAR_COLORS[userId % AVATAR_COLORS.length]

const getDisplayName = (review: Review) => {
  if (review.is_anonymous) return 'Người dùng ẩn danh'
  return review.display_name || review.username || review.full_name || 'Người dùng'
}

const getInitial = (review: Review) => {
  if (review.is_anonymous) return 'A'
  const name = review.display_name || review.username || review.full_name || 'U'
  return name.charAt(0).toUpperCase()
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const normalized = dateStr.replace(' ', 'T').replace('+00', 'Z')
  const date = new Date(normalized)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const isImage = (url: string) =>
  url.includes('/image/upload/') ||
  /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url)
</script>

<template>
  <div v-if="isLoading" class="text-center py-12">
    <p class="text-gray-500">Đang tải đánh giá...</p>
  </div>

  <div v-else class="space-y-6">
    <div
      v-for="review in reviews" :key="review.id"
      class="flex gap-4 pb-6 border-b border-gray-100 last:border-0"
    >
      <!-- Avatar -->
      <div
        class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm overflow-hidden"
        :style="{ background: getAvatarColor(review.user_id), color: '#fff' }"
      >
        <img
          v-if="review.avatar_url && !imgError[review.id]"
          :src="review.avatar_url"
          :alt="getDisplayName(review)"
          class="w-full h-full object-cover"
          @error="imgError[review.id] = true"
        />
        <span v-else>{{ getInitial(review) }}</span>
      </div>

      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span class="font-semibold text-gray-900 text-sm">{{ getDisplayName(review) }}</span>
          <span v-if="review.has_purchased"
            class="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
            <CheckCircle2 class="w-3 h-3" />
            Đã mua hàng
          </span>
        </div>

        <div class="flex text-yellow-400 mb-1">
          <Star v-for="n in 5" :key="n" class="w-3.5 h-3.5"
            :class="n <= review.rating ? 'fill-current' : 'text-gray-300 fill-current'" />
        </div>

        <div class="text-xs text-gray-400 mb-2">{{ formatDate(review.created_at) }}</div>

        <p v-if="review.comment" class="text-gray-700 text-sm leading-relaxed mb-3">
          {{ review.comment }}
        </p>

        <!-- Media từ Cloudinary -->
        <div v-if="review.media_urls?.length" class="grid grid-cols-4 gap-2">
          <div v-for="(url, index) in review.media_urls" :key="index"
            class="bg-gray-100 rounded-lg overflow-hidden aspect-square">
            <img v-if="isImage(url)" :src="url" :alt="`Ảnh ${index + 1}`"
              class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
            <video v-else :src="url" controls
              class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="!reviews.length" class="text-center py-12 text-gray-500">
      <p class="text-base">Chưa có đánh giá nào</p>
      <p class="text-sm mt-1">Hãy là người đầu tiên đánh giá sản phẩm này</p>
    </div>
  </div>
</template>