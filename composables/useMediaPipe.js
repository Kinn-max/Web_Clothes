/**
 * useMediaPipe – Init PoseLandmarker + FaceLandmarker, detectForVideo.
 * PoseLandmarker: tries full model first, falls back to lite on failure.
 * FaceLandmarker: detects whether a face is visible (dùng để xác định quay lưng/quay mặt).
 */
export function useMediaPipe() {
  let poseLandmarker = null
  let faceLandmarker = null
  let lastPoseTime   = -1
  let lastFaceTime   = -1

  const MODEL_FULL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task'
  const MODEL_LITE = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
  const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

  /**
   * @param {object} cbs - { onStatus({ text, pct }) }
   */
  async function initMediaPipe({ onStatus } = {}) {
    onStatus?.({ text: 'Đang load AI pose model...', pct: 65 })

    const { PoseLandmarker, FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )

    // ── PoseLandmarker ────────────────────────────────────────────────────
    try {
      onStatus?.({ text: 'Load pose_landmarker_full...', pct: 70 })
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_FULL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.6,
        minPosePresenceConfidence:  0.6,
        minTrackingConfidence:      0.6,
      })
    } catch (e) {
      console.warn('Full model failed, fallback to lite:', e)
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_LITE, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numPoses: 1,
      })
    }

    // ── FaceLandmarker (xác định quay lưng / quay mặt) ───────────────────
    try {
      onStatus?.({ text: 'Load face landmarker...', pct: 85 })
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence:  0.5,
        minTrackingConfidence:      0.5,
      })
    } catch (e) {
      console.warn('FaceLandmarker init thất bại (back-facing detection bị tắt):', e)
    }
  }

  /**
   * Run pose detection on the current video frame.
   * Returns result or null if video not ready / same frame.
   * @param {HTMLVideoElement} video
   * @returns {object|null}
   */
  function detectForVideo(video) {
    if (!poseLandmarker || !video || video.readyState < 2) return null
    const now = video.currentTime
    if (now === lastPoseTime) return null
    lastPoseTime = now
    try {
      return poseLandmarker.detectForVideo(video, performance.now())
    } catch {
      return null
    }
  }

  /**
   * Chạy face detection trên frame video hiện tại.
   * @param {HTMLVideoElement} video
   * @returns {boolean|null} true = thấy mặt, false = không thấy mặt, null = chưa sẵn sàng
   */
  function detectFaceForVideo(video) {
    if (!faceLandmarker || !video || video.readyState < 2) return null
    const now = video.currentTime
    if (now === lastFaceTime) return null
    lastFaceTime = now
    try {
      const result = faceLandmarker.detectForVideo(video, performance.now())
      return result?.faceLandmarks?.length > 0
    } catch {
      return null
    }
  }

  function close() {
    poseLandmarker?.close()
    faceLandmarker?.close()
  }

  return { initMediaPipe, detectForVideo, detectFaceForVideo, close }
}
