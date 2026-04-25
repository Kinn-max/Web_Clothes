import { toast } from 'vue3-toastify'
import type { User, UserCreate, UserUpdate } from '@/types/user'
import type { Store, StoreCreate, StoreUpdate } from '@/types/store'
import type { Garment, GarmentCreate, GarmentUpdate } from '@/types/garment'
import type { GarmentCategory, CategoryCreate, CategoryUpdate } from '@/types/category'
import type { Address, AddressCreate, AddressUpdate } from '@/types/address'
import type { Review, ReviewCreate, ReviewUpdate, ReviewParams, ReviewStats } from '@/types/review'
import type { Wishlist, WishlistCreate } from '@/types/wishlist'
import type { ARSession, ARSessionCreate, ARSessionParams, ARSessionStats } from '@/types/ar_session'
import type { ProductView, ProductViewCreate, ProductViewParams, TopProduct } from '@/types/product_view'
import type { ConversionEvent, ConversionCreate, ConversionParams, ConversionFunnel, ConversionOverview } from '@/types/conversion'

export async function getAuthToken(): Promise<string | null> {
  const token = useState<string | null>('auth_token')
  if (token.value) return token.value
  if (process.client) return localStorage.getItem('token')
  return null
}

export async function apiFetch<T>(url: string, options: Record<string, any> = {}): Promise<T> {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string
  const token = await getAuthToken()

  return $fetch<T>(url, {
    baseURL,
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    onResponseError({ response }) {
      switch (response.status) {
        case 401:
          navigateTo('/auth/login')
          break
        case 403:
          toast.error('Bạn không có quyền thực hiện thao tác này')
          break
        case 404:
          toast.error('Không tìm thấy dữ liệu')
          break
        case 500:
          toast.error('Lỗi server, vui lòng thử lại sau')
          break
      }
    },
  })
}

export const userApi = {
  getAll: () =>
    apiFetch<User[]>('/users'),

  getById: (id: number) =>
    apiFetch<User>(`/users/${id}`),

  getByFirebaseUid: (uid: string) =>
    apiFetch<User>(`/users/firebase/${uid}`),

  create: (data: UserCreate) =>
    apiFetch<User>('/users', { method: 'POST', body: data }),

  update: (id: number, data: UserUpdate) =>
    apiFetch<User>(`/users/${id}`, { method: 'PUT', body: data }),

  delete: (id: number) =>
    apiFetch<void>(`/users/${id}`, { method: 'DELETE' }),
}

export const storeApi = {
  getAll: () =>
    apiFetch<Store[]>('/stores'),

  getById: (id: string) =>
    apiFetch<Store>(`/stores/${id}`),

  create: (data: StoreCreate) =>
    apiFetch<Store>('/stores', { method: 'POST', body: data }),

  update: (id: string, data: StoreUpdate) =>
    apiFetch<Store>(`/stores/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiFetch<void>(`/stores/${id}`, { method: 'DELETE' }),
}

export const garmentApi = {
  getAll: () =>
    apiFetch<Garment[]>('/garments'),

  getById: (id: number) =>
    apiFetch<Garment>(`/garments/${id}`),

  create: (formData: FormData) =>
    apiFetch<Garment>('/garments', { method: 'POST', body: formData }),

  update: (id: number, formData: FormData) =>
    apiFetch<Garment>(`/garments/${id}`, { method: 'PUT', body: formData }),

  delete: (id: number) =>
    apiFetch<void>(`/garments/${id}`, { method: 'DELETE' }),

  getLensLink: (id: number) =>
    apiFetch<{ lens_url: string; model_url: string; product_id: number }>(`/garments/${id}/lens-link`),

  getByProductId: (firestoreProductId: string) =>
    apiFetch<Garment[]>(`/garments/by-product/${firestoreProductId}`),
}

export const garmentCategoryApi = {
  getAll: () =>
    apiFetch<GarmentCategory[]>('/garment-categories'),

  getById: (id: number) =>
    apiFetch<GarmentCategory>(`/garment-categories/${id}`),

  create: (data: { name: string; description?: string }) =>
    apiFetch<GarmentCategory>('/garment-categories', { method: 'POST', body: data }),

  update: (id: number, data: { name?: string; description?: string }) =>
    apiFetch<GarmentCategory>(`/garment-categories/${id}`, { method: 'PUT', body: data }),

  delete: (id: number) =>
    apiFetch<void>(`/garment-categories/${id}`, { method: 'DELETE' }),
}

export const categoryApi = {
  getAll: () =>
    apiFetch<GarmentCategory[]>('/categories'),

  getById: (id: number) =>
    apiFetch<GarmentCategory>(`/categories/${id}`),

  create: (data: CategoryCreate) =>
    apiFetch<GarmentCategory>('/categories', { method: 'POST', body: data }),

  update: (id: number, data: CategoryUpdate) =>
    apiFetch<GarmentCategory>(`/categories/${id}`, { method: 'PUT', body: data }),

  delete: (id: number) =>
    apiFetch<void>(`/categories/${id}`, { method: 'DELETE' }),
}

export const addressApi = {
  getAll: (userId: number) =>
    apiFetch<Address[]>(`/users/${userId}/addresses`),

  getById: (userId: number, id: number) =>
    apiFetch<Address>(`/users/${userId}/addresses/${id}`),

  create: (userId: number, data: AddressCreate) =>
    apiFetch<Address>(`/users/${userId}/addresses`, { method: 'POST', body: data }),

  update: (userId: number, id: number, data: AddressUpdate) =>
    apiFetch<Address>(`/users/${userId}/addresses/${id}`, { method: 'PUT', body: data }),

  setDefault: (userId: number, id: number) =>
    apiFetch<Address>(`/users/${userId}/addresses/${id}/default`, { method: 'PATCH' }),

  delete: (userId: number, id: number) =>
    apiFetch<void>(`/users/${userId}/addresses/${id}`, { method: 'DELETE' }),
}

export const reviewApi = {
  getAll: (params?: ReviewParams) =>
    apiFetch<Review[]>('/reviews', { params }),

  getById: (id: number) =>
    apiFetch<Review>(`/reviews/${id}`),

  getStatsByProduct: (productId: string) =>
    apiFetch<ReviewStats>(`/reviews/stats/${productId}`),

  create: (data: ReviewCreate) =>
    apiFetch<Review>('/reviews', { method: 'POST', body: data }),

  update: (id: number, data: ReviewUpdate) =>
    apiFetch<Review>(`/reviews/${id}`, { method: 'PUT', body: data }),

  delete: (id: number) =>
    apiFetch<void>(`/reviews/${id}`, { method: 'DELETE' }),
}

export const wishlistApi = {
  getAll: (userId: number) =>
    apiFetch<Wishlist[]>(`/wishlists/${userId}`),

  check: (userId: number, productId: string) =>
    apiFetch<{ exists: boolean }>(`/wishlists/check`, { params: { user_id: userId, product_id: productId } }),

  add: (data: WishlistCreate) =>
    apiFetch<Wishlist>('/wishlists', { method: 'POST', body: data }),

  deleteById: (id: number) =>
    apiFetch<void>(`/wishlists/${id}`, { method: 'DELETE' }),

  deleteByProduct: (productId: string, userId: number) =>
    apiFetch<void>('/wishlists/by-product', { method: 'DELETE', params: { product_id: productId, user_id: userId } }),
}

export const arSessionApi = {
  getAll: (params?: ARSessionParams) =>
    apiFetch<ARSession[]>('/ar-sessions', { params }),

  getById: (id: number) =>
    apiFetch<ARSession>(`/ar-sessions/${id}`),

  getStats: () =>
    apiFetch<ARSessionStats>('/ar-sessions/stats'),

  create: (data: ARSessionCreate) =>
    apiFetch<ARSession>('/ar-sessions', { method: 'POST', body: data }),

  markConverted: (id: number) =>
    apiFetch<ARSession>(`/ar-sessions/${id}/convert`, { method: 'PATCH' }),

  delete: (id: number) =>
    apiFetch<void>(`/ar-sessions/${id}`, { method: 'DELETE' }),
}

export const productViewApi = {
  getAll: (params?: ProductViewParams) =>
    apiFetch<ProductView[]>('/product-views', { params }),

  record: (data: ProductViewCreate) =>
    apiFetch<ProductView>('/product-views', { method: 'POST', body: data }),

  countByProduct: (productId: string) =>
    apiFetch<{ product_id: string; count: number }>(`/product-views/count/${productId}`),

  getTopProducts: (limit?: number) =>
    apiFetch<TopProduct[]>('/product-views/top', { params: limit ? { limit } : undefined }),
}

export const conversionApi = {
  getAll: (params?: ConversionParams) =>
    apiFetch<ConversionEvent[]>('/conversions', { params }),

  record: (data: ConversionCreate) =>
    apiFetch<ConversionEvent>('/conversions', { method: 'POST', body: data }),

  getFunnelByProduct: (productId: string) =>
    apiFetch<ConversionFunnel>(`/conversions/funnel/${productId}`),

  getOverview: () =>
    apiFetch<ConversionOverview>('/conversions/overview'),
}
