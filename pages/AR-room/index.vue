<template>
  <div class="relative w-screen h-screen overflow-hidden bg-black">

    <!-- Webcam -->
    <video ref="videoEl" class="absolute inset-0 w-full h-full object-cover"
      style="transform: scaleX(-1)" autoplay playsinline muted />

    <!-- Three.js canvas -->
    <canvas ref="canvasEl" class="absolute inset-0 w-full h-full pointer-events-none" />

    <!-- Loading overlay -->
    <Transition enter-active-class="transition-opacity duration-[400ms]" enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-[400ms]" leave-to-class="opacity-0">
      <div v-if="status === 'loading'"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-6 px-8 text-center">
          <div class="relative w-20 h-20">
            <div class="absolute inset-0 rounded-full border-4 border-white/10" />
            <div class="absolute inset-0 rounded-full border-4 border-t-red-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <div>
            <p class="text-white font-bold text-xl mb-1">Đang khởi động</p>
            <p class="text-white/60 text-sm max-w-xs">{{ loadingText }}</p>
          </div>
          <div class="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-red-500 to-pink-400 rounded-full transition-all duration-500"
              :style="{ width: loadingPct + '%' }" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- UI overlays -->
    <StatusBadge :status="status" :status-text="statusText" :confidence="confidence" :fps="fps" />
    <GuideOverlay :show="status === 'ready'" />
    <SizeControlPanel
      :visible="status !== 'loading'"
      :scale-x="scaleX" :scale-y="scaleY" :offset-y="offsetY" :sleeve-strength="sleeveStrength"
      @update:scale-x="scaleX = $event" @update:scale-y="scaleY = $event"
      @update:offset-y="offsetY = $event" @update:sleeve-strength="sleeveStrength = $event"
      @reset="resetControls"
    />
    <CaptureButton :disabled="status !== 'tracking'" @capture="onCapture" />

    <!-- Flash effect -->
    <Transition enter-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-[250ms]" leave-to-class="opacity-0">
      <div v-if="flashVisible" class="absolute inset-0 z-30 bg-white pointer-events-none" />
    </Transition>

    <!-- Camera Permission Denied Screen -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0">
      <div
        v-if="cameraError"
        class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gray-950 text-center px-8">

        <!-- Icon -->
        <div class="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <svg class="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M3 3l18 18" />
          </svg>
        </div>

        <!-- Title -->
        <h2 class="text-white text-2xl font-bold mb-3">
          Không thể truy cập camera
        </h2>

        <!-- Error message -->
        <p class="text-white/60 text-sm mb-8 max-w-sm leading-relaxed">
          {{ cameraError }}
        </p>

        <!-- Hướng dẫn -->
        <div class="bg-white/5 rounded-2xl p-4 mb-8 max-w-sm text-left">
          <p class="text-white/80 text-xs font-semibold mb-2">Cách bật camera:</p>
          <ol class="text-white/50 text-xs space-y-1 list-decimal list-inside">
            <li>Click icon 🔒 trên thanh địa chỉ</li>
            <li>Tìm mục "Camera" → chọn "Cho phép"</li>
            <li>Tải lại trang và thử lại</li>
          </ol>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col gap-3 w-full max-w-xs">
          <button
            @click="retryCamera"
            class="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Thử lại
          </button>

          <NuxtLink
            to="/shop"
            class="w-full h-12 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-medium rounded-xl transition-colors flex items-center justify-center">
            Quay về cửa hàng
          </NuxtLink>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import StatusBadge      from '~/components/fitting/StatusBadge.vue'
import GuideOverlay     from '~/components/fitting/GuideOverlay.vue'
import SizeControlPanel from '~/components/fitting/SizeControlPanel.vue'
import CaptureButton    from '~/components/fitting/CaptureButton.vue'
import { useThreeScene }        from '~/composables/useThreeScene'
import { useGLBModel }          from '~/composables/useGLBModel'
import { useMediaPipe }         from '~/composables/useMediaPipe'
import { useFittingControls }   from '~/composables/useFittingControls'
import { useArmDeform }         from '~/composables/useArmDeform'
import { useClothingTransform } from '~/composables/useClothingTransform'
import { capturePhoto }         from '~/utils/capturePhoto'

// ── DOM refs ──────────────────────────────────────────────────────────
const videoEl  = ref(null)
const canvasEl = ref(null)

// ── UI state ──────────────────────────────────────────────────────────
const status       = ref('loading')
const statusText   = ref('Đang khởi động...')
const loadingText  = ref('Khởi tạo...')
const loadingPct   = ref(0)
const confidence   = ref(0)
const fps          = ref(0)
const flashVisible = ref(false)
const cameraError  = ref('')

// ── Composables ───────────────────────────────────────────────────────
const controls = useFittingControls()
const { scaleX, scaleY, offsetY, sleeveStrength, resetControls } = controls

const threeScene = useThreeScene()
const glbModel   = useGLBModel()
const mediaPipe  = useMediaPipe()
const { deformArms }     = useArmDeform()
const { updateClothing } = useClothingTransform({ scaleX, scaleY, offsetY, sleeveStrength })

// ── Helpers ───────────────────────────────────────────────────────────
function setStatus(s, t) { status.value = s; statusText.value = t }

// ── Webcam ────────────────────────────────────────────────────────────
async function initWebcam() {
  loadingText.value = 'Đang mở camera...'
  loadingPct.value  = 10

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
    })
    videoEl.value.srcObject = stream
    return new Promise(resolve => {
      videoEl.value.onloadedmetadata = () => { videoEl.value.play(); resolve() }
    })
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      cameraError.value = 'Bạn chưa cho phép truy cập camera. Vui lòng cấp quyền và thử lại.'
    } else if (err.name === 'NotFoundError') {
      cameraError.value = 'Không tìm thấy camera trên thiết bị này.'
    } else if (err.name === 'NotReadableError') {
      cameraError.value = 'Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng ứng dụng đó và thử lại.'
    } else if (err.name === 'OverconstrainedError') {
      cameraError.value = 'Camera không hỗ trợ độ phân giải yêu cầu.'
    } else {
      cameraError.value = `Lỗi camera: ${err.message}`
    }
    setStatus('error', cameraError.value)
    throw err // re-throw để onMounted catch được
  }
}

// ── Retry camera ──────────────────────────────────────────────────────
async function retryCamera() {
  cameraError.value = ''
  status.value      = 'loading'
  loadingText.value = 'Đang khởi động lại...'
  loadingPct.value  = 0

  try {
    await initWebcam()
    loadingPct.value = 100
    setStatus('ready', 'Sẵn sàng – đứng vào khung hình')
    if (!animFrameId) {
      requestAnimationFrame(renderLoop)
    }
  } catch (err) {
    // cameraError đã được set trong initWebcam
  }
}

// ── Render loop ───────────────────────────────────────────────────────
let animFrameId = null
let fpsFrames = 0
let fpsTimer  = 0

function renderLoop(ts) {
  animFrameId = requestAnimationFrame(renderLoop)
  fpsFrames++
  if (ts - fpsTimer >= 1000) { fps.value = fpsFrames; fpsFrames = 0; fpsTimer = ts }
  if (!videoEl.value || videoEl.value.readyState < 2) {
    threeScene.render()
    return
  }
  const result      = mediaPipe.detectForVideo(videoEl.value)
  const faceDetected = mediaPipe.detectFaceForVideo(videoEl.value)
  if (result?.landmarks?.length > 0) {
    updateClothing({
      THREE:         threeScene.getThree(),
      clothingFront: glbModel.getClothingFront(),
      clothingBack:  glbModel.getClothingBack(),
      modelHeight:   glbModel.getModelHeight(),
      landmarks:     result.landmarks[0],
      faceDetected,
      deformArms,
      meshDataFront: glbModel.getMeshDataFront(),
      meshDataBack:  glbModel.getMeshDataBack(),
      onStatus:      setStatus,
      onConfidence:  v => { confidence.value = v },
    })
  } else if (result !== null) {
    const cf = glbModel.getClothingFront()
    const cb = glbModel.getClothingBack()
    if (cf) cf.visible = false
    if (cb) cb.visible = false
    confidence.value = 0
    if (status.value === 'tracking') setStatus('ready', 'Mất tracking – đứng lại vào khung hình')
  }

  threeScene.render()
}

// ── Capture ───────────────────────────────────────────────────────────
async function onCapture() {
  flashVisible.value = true
  setTimeout(() => { flashVisible.value = false }, 300)
  await capturePhoto(videoEl.value, canvasEl.value)
}

// ── Lifecycle ─────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    await initWebcam()
    loadingPct.value = 20

    // Init Three.js scene first, then load GLB + MediaPipe in parallel
    await threeScene.initThree(canvasEl.value)

    await Promise.all([
      glbModel.loadModel(threeScene.getThree(), threeScene.getScene(), {
        onProgress: r => {
          loadingPct.value  = 30 + Math.round(r * 25)
          loadingText.value = `Load model: ${Math.round(r * 100)}%`
        },
        onLoaded: () => { loadingPct.value = 60 },
        onError:  () => { loadingText.value = 'Lỗi load model (tiếp tục không có 3D)' },
      }),
      mediaPipe.initMediaPipe({
        onStatus: ({ text, pct }) => { loadingText.value = text; if (pct) loadingPct.value = pct },
      }),
    ])

    loadingPct.value = 100
    setStatus('ready', 'Sẵn sàng – đứng vào khung hình')
    window.addEventListener('resize', threeScene.onResize)
    requestAnimationFrame(renderLoop)
  } catch (err) {
    // Nếu là lỗi camera → cameraError đã được set, không ghi đè
    if (!cameraError.value) {
      statusText.value  = `Lỗi: ${err.message}`
      loadingText.value = err.message
    }
    console.error(err)
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animFrameId)
  window.removeEventListener('resize', threeScene.onResize)
  threeScene.dispose()
  mediaPipe.close()
  videoEl.value?.srcObject?.getTracks().forEach(t => t.stop())
})
</script>