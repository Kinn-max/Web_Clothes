import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Address, AddressCreate, AddressUpdate } from '@/types/address'
import { useRequireAuth } from './useRequireAuth'

export const useAddress = () => {
  const http = useHttp()
  const queryClient = useQueryClient()

  const { requireNeonId, neonId } = useRequireAuth()

  // nếu chưa login → tự throw → TanStack bắt lỗi
  const basePath = () => `/users/${requireNeonId()}/addresses`

  // ─── GET tất cả addresses ──────────────────────────────────
  const useGetAllAddresses = () =>
    useQuery({
      queryKey: ['addresses', neonId],         
      queryFn: () => http.get<Address[]>(basePath()),
    enabled: computed(() => !!neonId.value && neonId.value !== null),
    })

  // ─── GET 1 address theo id ─────────────────────────────────
  const useGetAddressById = (addressId: Ref<number>) =>
    useQuery({
      queryKey: ['addresses', neonId, addressId],
      queryFn: () =>
        http.get<Address>(`${basePath()}/${addressId.value}`),
      enabled: computed(() => !!neonId.value && !!addressId.value),
    })

  // ─── POST tạo address mới ──────────────────────────────────
  const useCreateAddress = () =>
    useMutation({
      mutationFn: (data: AddressCreate) =>
        http.post<Address>(basePath(), data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['addresses', neonId],
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
          queryKey: ['addresses', neonId],
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
          queryKey: ['addresses', neonId],
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
          queryKey: ['addresses', neonId],
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