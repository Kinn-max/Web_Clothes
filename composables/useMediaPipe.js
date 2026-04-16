/**
 * useMediaPipe – Init PoseLandmarker, detectForVideo.
 * Tries full model first, falls back to lite on failure.
 */
export function useMediaPipe() {
  let poseLandmarker = null
  let lastVideoTime  = -1

  const MODEL_FULL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task'
  const MODEL_LITE = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

  /**
   * @param {object} cbs - { onStatus({ text, pct }) }
   */
  async function initMediaPipe({ onStatus } = {}) {
    onStatus?.({ text: 'Đang load AI pose model...', pct: 65 })

    const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )

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
  }

  /**
   * Run detection on the current video frame.
   * Returns result or null if video not ready / same frame.
   * @param {HTMLVideoElement} video
   * @returns {object|null}
   */
  function detectForVideo(video) {
    if (!poseLandmarker || video.readyState < 2) return null
    const now = video.currentTime
    if (now === lastVideoTime) return null
    lastVideoTime = now
    try {
      return poseLandmarker.detectForVideo(video, performance.now())
    } catch {
      return null
    }
  }

  function close() {
    poseLandmarker?.close()
  }

  return { initMediaPipe, detectForVideo, close }
}
