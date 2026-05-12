/**
 * usePhotoTryon — Photo Mode Virtual Try-On
 * Pattern: $fetch + getAuthHeaders() giống useApi.ts
 * Endpoints: POST /photo-tryon/* trên FastAPI backend
 */

export interface BodyProfilePayload {
  gender: 'male' | 'female'
  height_cm: number
  weight_kg: number
  chest_cm?: number
  waist_cm?: number
  hip_cm?: number
}

export interface BodyProfile {
  id: number
  user_id: string
  gender: string
  height_cm: number
  weight_kg: number
  chest_cm: number
  waist_cm: number
  hip_cm: number
  created_at: string
}

export interface PhotoAvatar {
  id: number
  user_id: string
  body_profile_id: number
  status: 'processing' | 'ready' | 'failed'
  glb_url: string | null
  measurements: {
    height: number
    chest: number
    waist: number
    hip: number
  } | null
  created_at: string
}

export interface TryonSession {
  id: number
  avatar_id: number
  garment_id: number
  drape_glb_url: string | null
  status: 'processing' | 'ready' | 'failed'
  created_at: string
}

export interface FaceReconstructResult {
  face_glb_url: string
  face_params?: Record<string, any>
}

export interface MergeFaceResult {
  merged_glb_url: string
  avatar_id: number
}

export interface FitMeasure {
  diff_cm: number
  status: 'tight' | 'good' | 'loose'
}

export interface FitAssessment {
  overall_fit: 'tight' | 'good' | 'loose'
  chest_fit: FitMeasure
  waist_fit: FitMeasure
  hip_fit: FitMeasure
  recommendation: string
  size_suggestion: string | null
}

export interface BodyLandmarks {
  avatar_id: number
  landmarks: Record<string, [number, number, number]>
}

export const usePhotoTryon = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl

  // ── Auth header (same pattern as useApi.ts) ──────────────────────────────
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // ── State ────────────────────────────────────────────────────────────────
  const bodyProfile = ref<BodyProfile | null>(null)
  const avatar = ref<PhotoAvatar | null>(null)
  const session = ref<TryonSession | null>(null)

  const loadingProfile = ref(false)
  const loadingAvatar = ref(false)
  const loadingTryon = ref(false)
  const loadingFace = ref(false)
  const loadingFit = ref(false)
  const error = ref<string | null>(null)

  const faceGlbUrl = ref<string | null>(null)
  const mergedGlbUrl = ref<string | null>(null)
  const fitAssessment = ref<FitAssessment | null>(null)

  // Poll interval handle
  let pollTimer: ReturnType<typeof setInterval> | null = null

  // ── 1. Tạo / cập nhật body profile ──────────────────────────────────────
  const saveBodyProfile = async (payload: BodyProfilePayload) => {
    loadingProfile.value = true
    error.value = null
    try {
      const res = await $fetch<BodyProfile>(`${baseURL}/photo-tryon/body-profile`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: payload,
      })
      bodyProfile.value = res
      return res
    } catch (e: any) {
      error.value = e?.data?.detail ?? e?.message ?? 'Lỗi lưu body profile'
      throw e
    } finally {
      loadingProfile.value = false
    }
  }

  // ── 2. Generate avatar (chạy background job trên backend) ────────────────
  const generateAvatar = async (bodyProfileId: number) => {
    loadingAvatar.value = true
    error.value = null
    avatar.value = null
    try {
      const res = await $fetch<PhotoAvatar>(`${baseURL}/photo-tryon/avatar/generate`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: { body_profile_id: bodyProfileId },
      })
      avatar.value = res
      // Nếu đang processing → bắt đầu poll
      if (res.status === 'processing') {
        startPolling(res.id)
      }
      return res
    } catch (e: any) {
      error.value = e?.data?.detail ?? e?.message ?? 'Lỗi tạo avatar'
      throw e
    } finally {
      loadingAvatar.value = false
    }
  }

  // ── 3. Poll avatar status ────────────────────────────────────────────────
  const getAvatarStatus = async (avatarId: number) => {
    const res = await $fetch<PhotoAvatar>(
      `${baseURL}/photo-tryon/avatar/${avatarId}`,
      { headers: getAuthHeaders() }
    )
    avatar.value = res
    return res
  }

  const startPolling = (avatarId: number) => {
    stopPolling()
    pollTimer = setInterval(async () => {
      try {
        const res = await getAvatarStatus(avatarId)
        if (res.status !== 'processing') {
          stopPolling()
          if (res.status === 'failed') {
            error.value = 'Tạo avatar thất bại, vui lòng thử lại'
          }
        }
      } catch {
        stopPolling()
      }
    }, 3000) // poll mỗi 3s
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  // ── 4. Try-on: drape garment lên avatar ──────────────────────────────────
  const startTryon = async (avatarId: number, garmentId: number) => {
    loadingTryon.value = true
    error.value = null
    session.value = null
    try {
      const res = await $fetch<TryonSession>(`${baseURL}/photo-tryon/tryon`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: { avatar_id: avatarId, garment_id: garmentId },
      })
      session.value = res
      return res
    } catch (e: any) {
      error.value = e?.data?.detail ?? e?.message ?? 'Lỗi thử đồ'
      throw e
    } finally {
      loadingTryon.value = false
    }
  }

  // ── 5. Lấy danh sách sessions ────────────────────────────────────────────
  const getSessions = async () => {
    const res = await $fetch<TryonSession[]>(`${baseURL}/photo-tryon/sessions`, {
      headers: getAuthHeaders(),
    })
    return res
  }

  // ── 6. Face reconstruction từ ảnh selfie ─────────────────────────────────
  const reconstructFace = async (imageFile: File) => {
    loadingFace.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      // KHÔNG set Content-Type — browser tự set boundary cho multipart
      const res = await $fetch<FaceReconstructResult>(
        `${baseURL}/photo-tryon/face/reconstruct`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData,
        }
      )
      faceGlbUrl.value = res.face_glb_url
      return res
    } catch (e: any) {
      error.value = e?.data?.detail ?? e?.message ?? 'Lỗi xử lý khuôn mặt'
      throw e
    } finally {
      loadingFace.value = false
    }
  }

  // ── 7. Merge face + body GLB ─────────────────────────────────────────────
  const mergeFaceBody = async (avatarId: number, faceGlbUrlInput: string) => {
    error.value = null
    try {
      const res = await $fetch<MergeFaceResult>(
        `${baseURL}/photo-tryon/avatar/${avatarId}/merge-face`,
        {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: { face_glb_url: faceGlbUrlInput },
        }
      )
      mergedGlbUrl.value = res.merged_glb_url
      return res
    } catch (e: any) {
      error.value = e?.data?.detail ?? e?.message ?? 'Lỗi gộp khuôn mặt'
      throw e
    }
  }

  // ── 8. Fit assessment (so sánh body profile với garment) ─────────────────
  const getFitAssessment = async (bodyProfileId: number, garmentId: number) => {
    loadingFit.value = true
    error.value = null
    try {
      const res = await $fetch<FitAssessment>(
        `${baseURL}/photo-tryon/fit-assessment`,
        {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: { body_profile_id: bodyProfileId, garment_id: garmentId },
        }
      )
      fitAssessment.value = res
      return res
    } catch (e: any) {
      error.value = e?.data?.detail ?? e?.message ?? 'Lỗi đánh giá fit'
      throw e
    } finally {
      loadingFit.value = false
    }
  }

  // ── 9. Body landmarks ────────────────────────────────────────────────────
  const getBodyLandmarks = async (avatarId: number) => {
    const res = await $fetch<BodyLandmarks>(
      `${baseURL}/photo-tryon/avatar/${avatarId}/landmarks`,
      { headers: getAuthHeaders() }
    )
    return res
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────
  const reset = () => {
    stopPolling()
    bodyProfile.value = null
    avatar.value = null
    session.value = null
    faceGlbUrl.value = null
    mergedGlbUrl.value = null
    fitAssessment.value = null
    error.value = null
  }

  // Auto cleanup khi component unmount
  onUnmounted(() => stopPolling())

  return {
    // state
    bodyProfile,
    avatar,
    session,
    faceGlbUrl,
    mergedGlbUrl,
    fitAssessment,
    loadingProfile,
    loadingAvatar,
    loadingTryon,
    loadingFace,
    loadingFit,
    error,
    // methods
    saveBodyProfile,
    generateAvatar,
    getAvatarStatus,
    startTryon,
    getSessions,
    reconstructFace,
    mergeFaceBody,
    getFitAssessment,
    getBodyLandmarks,
    reset,
  }
}