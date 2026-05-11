
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface FetchConfig {
  method: HttpMethod          
  headers?: Record<string, string>
  body?: BodyInit | Record<string, any> | null  
}

export const useHttp = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchWithRetry = async <T>(
    path: string,
    options: FetchConfig   
  ): Promise<T> => {
    try {
      return await $fetch<T>(`${baseURL}${path}`, {
        ...options,
        headers: {
          ...options?.headers,
          ...getAuthHeaders(),
        },
      })
    } catch (err: any) {
      if (err?.response?.status === 401) {
        const nuxtApp = useNuxtApp()
        const $auth = nuxtApp.$auth as import('firebase/auth').Auth
        const currentUser = $auth.currentUser

        if (currentUser) {
          const newToken = await currentUser.getIdToken(true)
          const authStore = useAuthStore()
          authStore.setAuth(authStore.user!, newToken)

          return await $fetch<T>(`${baseURL}${path}`, {
            ...options,
            headers: {
              ...options?.headers,
              Authorization: `Bearer ${newToken}`,
            },
          })
        }
      }
      throw err
    }
  }

  const get = <T>(path: string): Promise<T> =>
    fetchWithRetry<T>(path, { method: 'GET' })

  const post = <T>(path: string, body: Record<string, any>): Promise<T> =>
    fetchWithRetry<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,   
    })

  const put = <T>(path: string, body: Record<string, any>): Promise<T> =>
    fetchWithRetry<T>(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

  const patch = <T>(path: string, body: Record<string, any>): Promise<T> =>
    fetchWithRetry<T>(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

  const del = <T>(path: string): Promise<T> =>
    fetchWithRetry<T>(path, { method: 'DELETE' })

  const upload = <T>(path: string, formData: FormData): Promise<T> =>
    fetchWithRetry<T>(path, {
      method: 'POST',
      body: formData,  
    })

  return { get, post, put, patch, del, upload }
}