<script setup lang="ts">
import ReviewSummary    from './preview/ReviewSummary.vue'
import ReviewForm       from './preview/ReviewForm.vue'
import ReviewList       from './preview/ReviewList.vue'
import ReviewPagination from './preview/ReviewPagination.vue'

const route     = useRoute()
const authStore = useAuthStore()
const { useProductReviews, useCheckUserPurchased, useAverageRating } = useReview()

const page         = ref(1)
const limit        = ref(5)
const filterRating = ref('')

const firestoreProductId = computed(() => route.params.id as string)

// Reset khi chuyển product
watch(firestoreProductId, () => {
  page.value = 1;
  filterRating.value = '';
});

const { data: reviewResponse, isLoading } =
  useProductReviews(firestoreProductId, page, limit)

const { data: hasPurchased } =
  useCheckUserPurchased(firestoreProductId)

const { data: statsData } =
  useAverageRating(firestoreProductId)

const allReviews = computed(() => reviewResponse.value ?? [])

const totalReviews = computed(() => statsData.value?.total_reviews ?? allReviews.value.length)

const totalPages = computed(() => Math.ceil(totalReviews.value / limit.value))

const avgRating = computed(() => statsData.value?.avg_rating ?? 0)

const filteredReviews = computed(() => {
  if (!filterRating.value) return allReviews.value
  return allReviews.value.filter(r => r.rating === parseInt(filterRating.value))
})

const ratingCounts = computed(() => {
  if (statsData.value?.distribution) {
    return {
      5: statsData.value.distribution['5'] ?? 0,
      4: statsData.value.distribution['4'] ?? 0,
      3: statsData.value.distribution['3'] ?? 0,
      2: statsData.value.distribution['2'] ?? 0,
      1: statsData.value.distribution['1'] ?? 0,
    }
  }
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  allReviews.value.forEach(r => {
    counts[r.rating as keyof typeof counts]++
  })
  return counts
})
</script>

<template>
  <div class="mb-20">
    <ReviewSummary
      :average-rating="avgRating"
      :total-reviews="totalReviews"
      :rating-counts="ratingCounts"
      :filter-rating="filterRating"
      @update:filterRating="filterRating = $event"
      @update:page="page = $event"
    />

    <div v-if="!authStore.userId" class="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-8">
      <p class="text-blue-800">
        <strong>Vui lòng đăng nhập</strong> để viết đánh giá sản phẩm
      </p>
    </div>

    <div v-else-if="!hasPurchased" class="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-8">
      <p class="text-amber-800 text-sm">
        <strong>Bạn cần mua sản phẩm này</strong> trước khi có thể đánh giá.
      </p>
    </div>

    <ReviewForm
      v-else
      :firestore-product-id="firestoreProductId"
      :has-purchased="hasPurchased"
      @submitted="page = 1"
    />

    <ReviewList :reviews="filteredReviews" :is-loading="isLoading" />

    <ReviewPagination
      :page="page"
      :total-pages="totalPages"
      :total-reviews="totalReviews"
      :reviews-count="allReviews.length"
      @update:page="page = $event"
    />
  </div>
</template>