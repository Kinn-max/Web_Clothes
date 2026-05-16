import type { Review, ReviewCreate, ReviewUpdate, ReviewStats, PaginatedResponse } from '@/types/review'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export const useReview = () => {
  const http = useHttp()
  const authStore = useAuthStore()
  const queryClient = useQueryClient()

  // ─── Queries ───────────────────────────────────────────────

  const useAllReviews = (page = ref(1), limit = ref(10)) =>
    useQuery({
      queryKey: ['reviews', 'all', page, limit] as const,
      queryFn: () =>
        http.get<PaginatedResponse<Review>>(
          `/reviews?page=${page.value}&limit=${limit.value}`
        ),
    })

  const useProductReviews = (
  firestoreProductId: Ref<string>,
  page = ref(1),
  limit = ref(5)
) =>
  useQuery({
    queryKey: ['reviews', 'product', firestoreProductId, page, limit] as const,
    queryFn: () =>
      http.get<Review[]>(
        `/reviews/product/${firestoreProductId.value}?page=${page.value}&limit=${limit.value}`
      ),
    enabled: computed(() => !!firestoreProductId.value),
  });

  const useReviewById = (id: Ref<number>) =>
    useQuery({
      queryKey: ['reviews', id] as const,
      queryFn: () => http.get<Review>(`/reviews/${id.value}`),
      enabled: computed(() => !!id.value),
    })

  const useAverageRating = (firestoreProductId: Ref<string>) =>
  useQuery({
    queryKey: ['reviews', 'rating', firestoreProductId] as const,
    queryFn: () =>
      http.get<ReviewStats>(
        `/reviews/product/${firestoreProductId.value}/stats`
      ),
    enabled: computed(() => !!firestoreProductId.value),
    staleTime: 1000 * 60 * 5,
  });

  const useCheckUserPurchased = (firestoreProductId: Ref<string>) =>
  useQuery({
    queryKey: ['reviews', 'check-purchase', firestoreProductId] as const,
    queryFn: async () => {
      try {
        const neonId = authStore.neonId;
        if (!neonId) return false;
        const res = await http.get<{ hasPurchased: boolean }>(
          `/reviews/check-purchase/${firestoreProductId.value}?user_id=${neonId}`
        );
        return res.hasPurchased ?? false;
      } catch {
        return false;
      }
    },
    enabled: computed(() => !!firestoreProductId.value && !!authStore.neonId),
  });

  // ─── Mutations ─────────────────────────────────────────────

  const useCreateReview = () =>
  useMutation({
    mutationFn: (data: ReviewCreate): Promise<Review> =>
      http.post<Review>('/reviews', data),
    onSuccess: (_, variables) => {
      // Invalidate tất cả queries liên quan đến product này
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'product', ref(variables.firestore_product_id)],
      })
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'rating', ref(variables.firestore_product_id)],
      })
      // Invalidate toàn bộ reviews queries để chắc ăn
      queryClient.invalidateQueries({
        queryKey: ['reviews'],
      })
    },
  })
  const useUpdateReview = () =>
    useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: ReviewUpdate
      }): Promise<Review> =>
        http.put<Review>(`/reviews/${id}`, data),
      onSuccess: (updatedReview: Review) => {
        queryClient.setQueryData<Review>(
          ['reviews', updatedReview.id],
          updatedReview
        )
        queryClient.invalidateQueries({
          queryKey: ['reviews', 'product', updatedReview.firestore_product_id],
        })
        queryClient.invalidateQueries({
          queryKey: ['reviews', 'rating', updatedReview.firestore_product_id],
        })
      },
    })

  const useDeleteReview = () =>
    useMutation({
      mutationFn: ({
        id,
      }: {
        id: number
        firestoreProductId: string
      }): Promise<void> =>
        http.del<void>(`/reviews/${id}`),
      onSuccess: (_, { firestoreProductId }) => {
        queryClient.invalidateQueries({
          queryKey: ['reviews', 'product', firestoreProductId],
        })
        queryClient.invalidateQueries({
          queryKey: ['reviews', 'rating', firestoreProductId],
        })
        queryClient.invalidateQueries({
          queryKey: ['reviews', 'all'],
        })
      },
    })

  return {
    useAllReviews,
    useProductReviews,
    useReviewById,
    useAverageRating,
    useCheckUserPurchased,
    useCreateReview,
    useUpdateReview,
    useDeleteReview,
  }
}