interface TryOnResult {
  image_url?: string
  public_id?: string
  width?: number
  height?: number
  created_at?: string
  image_base64?: string
}

interface TryOnOptions {
  cloth_type?: 'upper' | 'lower' | 'overall'
  num_steps?: number
  guidance?: number
  seed?: number
}

export const useCatVTON = () => {
  const config = useRuntimeConfig()
  const { showNotification } = useNotification()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<TryOnResult | null>(null)

  const tryOn = async (personFile: File, clothFile: File, options: TryOnOptions = {}) => {
    loading.value = true
    error.value = null
    result.value = null

    const formData = new FormData()
    formData.append('person', personFile)
    formData.append('cloth', clothFile)
    formData.append('cloth_type', options.cloth_type ?? 'upper')
    formData.append('num_steps', String(options.num_steps ?? 50))
    formData.append('guidance', String(options.guidance ?? 2.5))
    formData.append('seed', String(options.seed ?? 42))

    try {
      const catvtonUrl = config.public.catvtonUrl as string
      const data = await $fetch<TryOnResult>(`${catvtonUrl}/tryon`, {
        method: 'POST',
        body: formData,
      })
      result.value = data
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 503) {
        error.value = 'GPU quá tải, vui lòng thử lại sau ít phút'
        showNotification('Lỗi GPU', error.value, 'error')
      } else if (status === 400) {
        error.value = 'Ảnh không hợp lệ, vui lòng kiểm tra lại'
        showNotification('Ảnh không hợp lệ', error.value, 'error')
      } else {
        error.value = 'Lỗi server, vui lòng thử lại'
        showNotification('Lỗi', error.value, 'error')
      }
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    result.value = null
    error.value = null
  }

  const downloadResult = () => {
    if (!result.value) return
    const url = result.value.image_url ?? result.value.image_base64
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `tryon-${Date.now()}.jpg`
    a.click()
  }

  return { loading, error, result, tryOn, reset, downloadResult }
}
