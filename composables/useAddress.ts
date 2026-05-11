import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Address, AddressCreate, AddressUpdate } from '@/types/address'

export const useAddress = () => {
  const http = useHttp()
  const authStore = useAuthStore()
  const queryClient = useQueryClient()

  // Helper — lấy userId, throw nếu chưa login
  const getUserId = (): number => {
    const userId = authStore.userId
    if (!userId) throw new Error('Chưa đăng nhập')
    return Number(userId) // backend dùng int
  }

  // Base path theo backend route
  const basePath = () => `/users/${getUserId()}/addresses`

  // ─── GET tất cả addresses ──────────────────────────────────
  const useGetAllAddresses = () =>
    useQuery({
      queryKey: ['addresses', authStore.userId],
      queryFn: () => http.get<Address[]>(basePath()),
      enabled: computed(() => !!authStore.userId),
    })

  // ─── GET 1 address theo id ─────────────────────────────────
  const useGetAddressById = (addressId: Ref<number>) =>
    useQuery({
      queryKey: ['addresses', authStore.userId, addressId],
      queryFn: () =>
        http.get<Address>(`${basePath()}/${addressId.value}`),
      enabled: computed(() => !!authStore.userId && !!addressId.value),
    })

  // ─── POST tạo address mới ──────────────────────────────────
  const useCreateAddress = () =>
    useMutation({
      mutationFn: (data: AddressCreate) =>
        http.post<Address>(basePath(), data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['addresses', authStore.userId],
        })
      },
    })

  // ─── PUT cập nhật address ──────────────────────────────────
  const useUpdateAddress = () =>
    useMutation({
      mutationFn: ({
        addressId,
        data,
      }: {
        addressId: number
        data: AddressUpdate
      }) => http.put<Address>(`${basePath()}/${addressId}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['addresses', authStore.userId],
        })
      },
    })

  // ─── DELETE xóa address ────────────────────────────────────
  const useDeleteAddress = () =>
    useMutation({
      mutationFn: (addressId: number) =>
        http.del<void>(`${basePath()}/${addressId}`),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['addresses', authStore.userId],
        })
      },
    })

  // ─── PATCH set default address ─────────────────────────────
  const useSetDefaultAddress = () =>
    useMutation({
      mutationFn: (addressId: number) =>
        http.patch<Address>(`${basePath()}/${addressId}/set-default`, {}),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['addresses', authStore.userId],
        })
      },
    })

  return {
    useGetAllAddresses,
    useGetAddressById,
    useCreateAddress,
    useUpdateAddress,
    useDeleteAddress,
    useSetDefaultAddress,
  }
}