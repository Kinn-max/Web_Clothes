import type { Review, ReviewCreate, ReviewUpdate, ReviewStats, PaginatedResponse } from '@/types/review'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export const useReview = () => {
  const http = useHttp()
  const queryClient = useQueryClient()

  // ─── Queries ────────────────────────────────────────────────────────────────

  // Get all reviews (for admin)
  const useAllReviews = (page = ref(1), limit = ref(10)) =>
    useQuery({
      queryKey: ['reviews', 'all', page, limit] as const,
      queryFn: () =>
        http.get<PaginatedResponse<Review>>(`/reviews?page=${page.value}&limit=${limit.value}`),
    })

  // Get reviews by product ID (for product page)
  const useProductReviews = (productId: Ref<string>, page = ref(1), limit = ref(5)) =>
    useQuery({
      queryKey: ['reviews', 'product', productId, page, limit] as const,
      queryFn: () =>
        http.get<PaginatedResponse<Review>>(
          `/reviews/product/${productId.value}?page=${page.value}&limit=${limit.value}`
        ),
      enabled: computed(() => !!productId.value),
    })

  // Get single review
  const useReviewById = (id: Ref<string>) =>
    useQuery({
      queryKey: ['reviews', id] as const,
      queryFn: () => http.get<Review>(`/reviews/${id.value}`),
      enabled: computed(() => !!id.value),
    })

  // Get average rating
  const useAverageRating = (productId: Ref<string | number>) =>
    useQuery({
      queryKey: ['reviews', 'rating', productId] as const,
      queryFn: () => http.get<ReviewStats>(`/reviews/rating/${productId.value}`),
      enabled: computed(() => !!productId.value),
    })

  // Check user purchase
  const useCheckUserPurchased = (productId: Ref<string | number>) =>
    useQuery({
      queryKey: ['reviews', 'check-purchase', productId] as const,
      queryFn: async () => {
        const res = await http.get<{ hasPurchased: boolean }>(
          `/reviews/check-purchase/${productId.value}`
        )
        return res.hasPurchased ?? false
      },
      enabled: computed(() => !!productId.value),
    })

  // ─── Mutations ───────────────────────────────────────────────────────────────

  // Create review
  const createReview = useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string
      data: ReviewCreate
    }): Promise<Review> => http.post<Review>(`/reviews/product/${productId}`, data),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] })
      queryClient.invalidateQueries({ queryKey: ['reviews', 'rating', productId] })
    },
  })

  // Update review
  const updateReview = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: ReviewUpdate
    }): Promise<Review> => http.put<Review>(`/reviews/${id}`, data),
    onSuccess: (updatedReview: Review) => {
      // Cập nhật cache trực tiếp cho review đó
      queryClient.setQueryData<Review>(
        ['reviews', updatedReview.id],
        updatedReview
      )
      // Invalidate danh sách reviews của product
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'product', updatedReview.product_id],
      })
      // Invalidate rating vì rating có thể thay đổi
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'rating', updatedReview.product_id],
      })
    },
  })

  // Delete review
  const deleteReview = useMutation({
    mutationFn: ({
      id,
      productId,
    }: {
      id: number
      productId: string
    }): Promise<void> => http.del<void>(`/reviews/${id}`),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'product', productId] })
      queryClient.invalidateQueries({ queryKey: ['reviews', 'rating', productId] })
    },
  })

  return {
    // Queries
    useAllReviews,
    useProductReviews,
    useReviewById,
    useAverageRating,
    useCheckUserPurchased,
    // Mutations
    createReview,
    updateReview,
    deleteReview,
  }
}