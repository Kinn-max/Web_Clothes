import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Address, AddressCreate, AddressUpdate } from '@/types/address'
import { useRequireAuth } from './useRequireAuth'

export const useAddress = () => {
  const http = useHttp()
  const queryClient = useQueryClient()

  const { requireUserIdInt, userId } = useRequireAuth()

  // Base path — gọi requireUserIdInt() lúc runtime
  // nếu chưa login → tự throw → TanStack bắt lỗi
  const basePath = () => `/users/${requireUserIdInt()}/addresses`

  // ─── GET tất cả addresses ──────────────────────────────────
  const useGetAllAddresses = () =>
    useQuery({
      queryKey: ['addresses', userId],         
      queryFn: () => http.get<Address[]>(basePath()),
      enabled: computed(() => !!userId.value), 
    })

  // ─── GET 1 address theo id ─────────────────────────────────
  const useGetAddressById = (addressId: Ref<number>) =>
    useQuery({
      queryKey: ['addresses', userId, addressId],
      queryFn: () =>
        http.get<Address>(`${basePath()}/${addressId.value}`),
      enabled: computed(() => !!userId.value && !!addressId.value),
    })

  // ─── POST tạo address mới ──────────────────────────────────
  const useCreateAddress = () =>
    useMutation({
      mutationFn: (data: AddressCreate) =>
        http.post<Address>(basePath(), data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['addresses', userId],
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
          queryKey: ['addresses', userId],
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
          queryKey: ['addresses', userId],
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
          queryKey: ['addresses', userId],
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