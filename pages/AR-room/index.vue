<template>
  <div class="relative w-screen h-screen overflow-hidden bg-black">

    <!-- Camera Kit canvas target -->
    <canvas ref="canvasEl" class="absolute inset-0 w-full h-full" />

    <!-- Loading overlay -->
    <Transition
      enter-active-class="transition-opacity duration-[400ms]" enter-from-class="opacity-0"
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

    <!-- Status badge -->
    <div v-if="status !== 'loading' && status !== 'error'"
      class="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
      {{ statusText }}
    </div>

    <!-- Capture button -->
    <div v-if="status === 'ready'"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
      <button
        @click="onCapture"
        class="w-16 h-16 rounded-full bg-white border-4 border-white/30 shadow-lg active:scale-95 transition-transform">
      </button>
    </div>

    <!-- Flash effect -->
    <Transition
      enter-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-[250ms]" leave-to-class="opacity-0">
      <div v-if="flashVisible" class="absolute inset-0 z-30 bg-white pointer-events-none" />
    </Transition>

    <!-- Camera Permission Denied Screen -->
    <Transition
      enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
      <div v-if="status === 'error'"
        class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-gray-950 text-center px-8">
        <div class="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <svg class="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3l18 18" />
          </svg>
        </div>
        <h2 class="text-white text-2xl font-bold mb-3">Không thể khởi động AR</h2>
        <p class="text-white/60 text-sm mb-8 max-w-sm leading-relaxed">{{ errorText }}</p>
        <div class="bg-white/5 rounded-2xl p-4 mb-8 max-w-sm text-left">
          <p class="text-white/80 text-xs font-semibold mb-2">Cách bật camera:</p>
          <ol class="text-white/50 text-xs space-y-1 list-decimal list-inside">
            <li>Click icon trên thanh địa chỉ</li>
            <li>Tìm mục "Camera" → chọn "Cho phép"</li>
            <li>Tải lại trang và thử lại</li>
          </ol>
        </div>
        <div class="flex flex-col gap-3 w-full max-w-xs">
          <button @click="initCameraKit"
            class="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            Thử lại
          </button>
          <NuxtLink to="/shop"
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

// ── Config ────────────────────────────────────────────────────────────
const STAGING_TOKEN   = useRuntimeConfig().public.snapApiToken
const LENS_GROUP_ID   = useRuntimeConfig().public.snapLensGroupId
const LENS_ID         = useRuntimeConfig().public.snapLensId

// ── DOM refs ──────────────────────────────────────────────────────────
const canvasEl = ref(null)

// ── UI state ──────────────────────────────────────────────────────────
const status       = ref('loading')
const statusText   = ref('Đang tải AR...')
const loadingText  = ref('Khởi tạo Camera Kit...')
const loadingPct   = ref(0)
const flashVisible = ref(false)
const errorText    = ref('')

// ── Camera Kit refs ───────────────────────────────────────────────────
let ckSession  = null
let mediaStream = null

// ── Init Camera Kit ───────────────────────────────────────────────────
async function initCameraKit() {
  status.value      = 'loading'
  loadingText.value = 'Khởi tạo Camera Kit...'
  loadingPct.value  = 10
  errorText.value   = ''

  try {
    // Dynamic import — tránh SSR crash (Nuxt ssr: false nhưng chắc ăn)
    const { bootstrapCameraKit, createMediaStreamSource, Transform2D } = await import('@snap/camera-kit')

    loadingText.value = 'Kết nối Snap AR engine...'
    loadingPct.value  = 30

    const cameraKit = await bootstrapCameraKit({ apiToken: STAGING_TOKEN })

    loadingText.value = 'Khởi tạo session...'
    loadingPct.value  = 50

    ckSession = await cameraKit.createSession({ liveRenderTarget: canvasEl.value })

    // Bắt lỗi lens
    ckSession.events.addEventListener('error', (event) => {
      if (event.detail.error.name === 'LensExecutionError') {
        console.warn('Lens error:', event.detail.error)
      }
    })

    loadingText.value = 'Mở camera...'
    loadingPct.value  = 65

    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
    })

    const source = createMediaStreamSource(mediaStream, {
      transform: Transform2D.MirrorX,
      cameraType: 'front',
    })
    await ckSession.setSource(source)
    await ckSession.play()

    loadingText.value = 'Tải lens quần áo...'
    loadingPct.value  = 80

    const lens = await cameraKit.lensRepository.loadLens(LENS_ID, LENS_GROUP_ID)
    await ckSession.applyLens(lens)

    loadingPct.value = 100
    status.value     = 'ready'
    statusText.value = 'AR đang chạy ✨'

  } catch (err) {
    console.error('Camera Kit error:', err)
    status.value  = 'error'

    if (err.name === 'NotAllowedError') {
      errorText.value = 'Bạn chưa cho phép truy cập camera. Vui lòng cấp quyền và thử lại.'
    } else if (err.name === 'NotFoundError') {
      errorText.value = 'Không tìm thấy camera trên thiết bị này.'
    } else {
      errorText.value = `Lỗi khởi động AR: ${err.message}`
    }
  }
}

// ── Capture ───────────────────────────────────────────────────────────
async function onCapture() {
  flashVisible.value = true
  setTimeout(() => { flashVisible.value = false }, 300)

  // Chụp canvas của Camera Kit
  const dataUrl = canvasEl.value.toDataURL('image/png')
  const link    = document.createElement('a')
  link.download = `ar-tryon-${Date.now()}.png`
  link.href     = dataUrl
  link.click()
}

// ── Lifecycle ─────────────────────────────────────────────────────────
onMounted(() => {
  initCameraKit()
})

onUnmounted(() => {
  ckSession?.removeEffects?.()
  mediaStream?.getTracks().forEach(t => t.stop())
  ckSession = null
  mediaStream = null
})
</script>