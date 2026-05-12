import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Store, StoreCreate, StoreUpdate } from '@/types/store'

export const useStore = () => {
  const http = useHttp()
  const queryClient = useQueryClient()

  // ─── GET tất cả stores ────────────────────────────────────
  const useGetAllStores = (params?: {
    skip?: Ref<number>
    limit?: Ref<number>
    is_active?: Ref<boolean | undefined>
  }) =>
    useQuery({
      queryKey: ['stores', params?.skip, params?.limit, params?.is_active],
      queryFn: () => {
        const skip      = params?.skip?.value      ?? 0
        const limit     = params?.limit?.value     ?? 10
        const is_active = params?.is_active?.value

        const query = new URLSearchParams({
          skip:  String(skip),
          limit: String(limit),
          ...(is_active !== undefined && { is_active: String(is_active) }),
        })
        return http.get<Store[]>(`/stores?${query}`)
      },
    })

  // ─── GET 1 store theo id ──────────────────────────────────
  const useGetStoreById = (id: Ref<string>) =>
    useQuery({
      queryKey: ['stores', id],
      queryFn: () => http.get<Store>(`/stores/${id.value}`),
      enabled: computed(() => !!id.value),
    })

  // ─── POST tạo store ───────────────────────────────────────
  const useCreateStore = () =>
    useMutation({
      mutationFn: (data: StoreCreate) =>
        http.post<Store>('/stores', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stores'] })
      },
    })

  // ─── PATCH cập nhật store ─────────────────────────────────
  // Backend dùng PATCH không phải PUT
  const useUpdateStore = () =>
    useMutation({
      mutationFn: ({ id, data }: { id: string; data: StoreUpdate }) =>
        http.patch<Store>(`/stores/${id}`, data),
      onSuccess: (updatedStore) => {
        queryClient.setQueryData(['stores', updatedStore.id], updatedStore)
        queryClient.invalidateQueries({ queryKey: ['stores'] })
      },
    })

  // ─── DELETE xóa store ─────────────────────────────────────
  const useDeleteStore = () =>
    useMutation({
      mutationFn: (id: string) =>
        http.del<void>(`/stores/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stores'] })
      },
    })

  // ─── Tìm store gần nhất (tính ở frontend) ────────────────
  // Backend không có endpoint này → tính từ danh sách stores
  const findNearestStore = (
    stores: Store[],
    lat: number,
    lng: number
  ): Store | null => {
    if (!stores.length) return null

    // Chỉ tính với store có tọa độ
    const storesWithCoords = stores.filter(
      (s) => s.latitude != null && s.longitude != null
    )
    if (!storesWithCoords.length) return null

    // Haversine formula — tính khoảng cách giữa 2 điểm trên trái đất
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const getDistance = (s: Store) => {
      const R    = 6371 // bán kính trái đất (km)
      const dLat = toRad(s.latitude! - lat)
      const dLng = toRad(s.longitude! - lng)
      const a    =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) *
        Math.cos(toRad(s.latitude!)) *
        Math.sin(dLng / 2) ** 2
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    }

    // Sắp xếp theo khoảng cách → lấy gần nhất
    return [...storesWithCoords].sort(
      (a, b) => getDistance(a) - getDistance(b)
    )[0]
  }

  return {
    // Queries
    useGetAllStores,
    useGetStoreById,
    // Mutations
    useCreateStore,
    useUpdateStore,
    useDeleteStore,
    // Utils
    findNearestStore,
  }
}