<script setup lang="ts">
import type { Review } from '@/types/review'
import ReviewSummary    from './preview/ReviewSummary.vue'
import ReviewForm       from './preview/ReviewForm.vue'
import ReviewList       from './preview/ReviewList.vue'
import ReviewPagination from './preview/ReviewPagination.vue'

interface Props {
  reviews?: Review[]
}
const props = withDefaults(defineProps<Props>(), { reviews: () => [] })

const route     = useRoute()
const authStore = useAuthStore()

const { useProductReviews, useCheckUserPurchased } = useReview()

// ── State ──────────────────────────────────────────────────
const page        = ref(1)   
const limit       = ref(5)
const filterRating = ref('')

const firestoreProductId = computed(() => route.params.id as string)

// ── Queries ────────────────────────────────────────────────
const { data: reviewResponse, isLoading } =
  useProductReviews(firestoreProductId, page, limit)

const { data: hasPurchased } =
  useCheckUserPurchased(firestoreProductId)

// ── Computed ───────────────────────────────────────────────
const allReviews = computed(() =>
  props.reviews.length ? props.reviews : reviewResponse.value?.data ?? []
)

const totalReviews = computed(() =>
  props.reviews.length ? props.reviews.length : reviewResponse.value?.total ?? 0
)

const totalPages = computed(() =>
  Math.ceil(totalReviews.value / limit.value)
)

const filteredReviews = computed(() => {
  if (!filterRating.value) return allReviews.value
  return allReviews.value.filter(
    (r) => r.rating === parseInt(filterRating.value)
  )
})

const averageRating = computed(() => {
  if (!allReviews.value.length) return 0
  const sum = allReviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / allReviews.value.length).toFixed(1)
})

const ratingCounts = computed(() => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  allReviews.value.forEach((r) => {
    counts[r.rating as keyof typeof counts]++
  })
  return counts
})
</script>

<template>
  <div class="mb-20">
    <h2 class="font-serif text-3xl text-gray-900 mb-8 text-center lg:text-left">
      Đánh Giá
    </h2>

    <!-- Summary + Filter -->
    <ReviewSummary
      :average-rating="averageRating"
      :total-reviews="totalReviews"
      :rating-counts="ratingCounts"
      :filter-rating="filterRating"
      @update:filterRating="filterRating = $event"
      @update:page="page = $event"
    />

    <!-- Login notice -->
    <div v-if="!authStore.userId"
      class="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-8">
      <p class="text-blue-800">
        <strong>Vui lòng đăng nhập</strong> để viết đánh giá sản phẩm
      </p>
    </div>

    <!-- Review Form -->
    <ReviewForm
      v-if="authStore.userId"
      :firestore-product-id="firestoreProductId"
      :has-purchased="hasPurchased ?? false"
      @submitted="page = 1"
    />

    <!-- Review List -->
    <ReviewList
      :reviews="filteredReviews"
      :is-loading="isLoading"
    />

    <!-- Pagination -->
    <ReviewPagination
      :page="page"
      :total-pages="totalPages"
      :total-reviews="totalReviews"
      :reviews-count="allReviews.length"
      @update:page="page = $event"
    />
  </div>
</template>