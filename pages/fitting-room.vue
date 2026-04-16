<template>
  <div class="relative w-screen h-screen overflow-hidden bg-black">
    <!-- Webcam -->
    <video
      ref="videoEl"
      class="absolute inset-0 w-full h-full object-cover"
      style="transform: scaleX(-1)"
      autoplay
      playsinline
      muted
    />

    <!-- Three.js canvas -->
    <canvas
      ref="canvasEl"
      class="absolute inset-0 w-full h-full pointer-events-none"
    />

    <!-- Status badge -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <span :class="[
        'px-4 py-2 rounded-full text-white text-sm font-semibold',
        status === 'tracking' ? 'bg-blue-500/80' :
        status === 'ready'    ? 'bg-green-500/80' : 'bg-black/60'
      ]">{{ statusText }}</span>
    </div>

    <!-- Hướng dẫn -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm">
      Đứng cách camera 1-2m, để toàn thân trong khung hình
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// ===== Refs =====
const videoEl = ref(null)
const canvasEl = ref(null)
const status = ref('loading')
const statusText = ref('Đang khởi động...')

// ===== Three.js vars =====
let THREE = null
let scene, camera, renderer, clothing
let animFrameId = null

// ===== MediaPipe vars =====
let poseLandmarker = null
let lastVideoTime = -1

// ===== Init Three.js =====
async function initThree() {
  THREE = await import('three')
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')

  const w = window.innerWidth
  const h = window.innerHeight

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
  camera.position.set(0, 0, 2)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl.value,
    alpha: true,
    antialias: true
  })
  renderer.setSize(w, h)
  renderer.setPixelRatio(window.devicePixelRatio)

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 2))
  const dir = new THREE.DirectionalLight(0xffffff, 1)
  dir.position.set(0, 5, 5)
  scene.add(dir)

  // Load GLB
  statusText.value = 'Đang load model 3D...'
  return new Promise((resolve) => {
    const loader = new GLTFLoader()
    loader.load(
      '/chinese_clothing.glb',
      (gltf) => {
        clothing = gltf.scene
        clothing.visible = false
        scene.add(clothing)
        statusText.value = 'Model loaded!'
        resolve()
      },
      (xhr) => {
        const pct = Math.round(xhr.loaded / xhr.total * 100)
        statusText.value = `Loading model: ${pct}%`
      },
      (err) => {
        console.error('GLB load error:', err)
        statusText.value = 'Lỗi load model!'
        resolve()
      }
    )
  })
}

// ===== Init Webcam =====
async function initWebcam() {
  statusText.value = 'Đang mở camera...'
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720, facingMode: 'user' }
  })
  videoEl.value.srcObject = stream
  return new Promise(resolve => {
    videoEl.value.onloadedmetadata = () => {
      videoEl.value.play()
      resolve()
    }
  })
}

// ===== Init MediaPipe =====
async function initMediaPipe() {
  statusText.value = 'Đang load AI model...'
  const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  )

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
      delegate: 'GPU'
    },
    runningMode: 'VIDEO',
    numPoses: 1
  })

  status.value = 'ready'
  statusText.value = '✓ Sẵn sàng! Hãy đứng vào khung hình'
}

// ===== Convert landmark → Three.js world =====
function lmToWorld(lm) {
  return new THREE.Vector3(
    -(lm.x - 0.5) * 4,
    -(lm.y - 0.5) * 3,
    -lm.z * 2
  )
}

// ===== Update quần áo theo landmarks =====
function updateClothing(landmarks) {
  if (!clothing) return

  const ls = lmToWorld(landmarks[11]) // left shoulder
  const rs = lmToWorld(landmarks[12]) // right shoulder
  const lh = lmToWorld(landmarks[23]) // left hip
  const rh = lmToWorld(landmarks[24]) // right hip

  const shoulderCenter = new THREE.Vector3().addVectors(ls, rs).multiplyScalar(0.5)
  const hipCenter      = new THREE.Vector3().addVectors(lh, rh).multiplyScalar(0.5)
  const bodyCenter     = new THREE.Vector3().addVectors(shoulderCenter, hipCenter).multiplyScalar(0.5)

  const shoulderWidth = ls.distanceTo(rs)

  // Position
  clothing.position.lerp(bodyCenter, 0.25)

  // Scale
  const s = shoulderWidth * 1.3
  clothing.scale.lerp(new THREE.Vector3(s, s, s), 0.25)

  // Rotation theo hướng vai
  const dir = new THREE.Vector3().subVectors(rs, ls).normalize()
  clothing.rotation.z = Math.atan2(dir.y, dir.x)

  clothing.visible = true
  status.value = 'tracking'
  statusText.value = '✓ Đang tracking'
}

// ===== Render loop =====
function renderLoop() {
  animFrameId = requestAnimationFrame(renderLoop)

  const video = videoEl.value
  if (!poseLandmarker || !video || video.readyState < 2) {
    renderer?.render(scene, camera)
    return
  }

  const now = video.currentTime
  if (now !== lastVideoTime) {
    lastVideoTime = now
    const result = poseLandmarker.detectForVideo(video, performance.now())

    if (result.landmarks?.length > 0) {
      updateClothing(result.landmarks[0])
    } else {
      if (clothing) clothing.visible = false
      if (status.value === 'tracking') {
        status.value = 'ready'
        statusText.value = 'Không thấy người, hãy đứng vào khung hình'
      }
    }
  }

  renderer.render(scene, camera)
}

// ===== Resize =====
function onResize() {
  if (!camera || !renderer) return
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

// ===== Lifecycle =====
onMounted(async () => {
  try {
    await initWebcam()
    await Promise.all([initThree(), initMediaPipe()])
    window.addEventListener('resize', onResize)
    renderLoop()
  } catch (err) {
    statusText.value = `Lỗi: ${err.message}`
    console.error(err)
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animFrameId)
  window.removeEventListener('resize', onResize)
  renderer?.dispose()
  poseLandmarker?.close()
  const stream = videoEl.value?.srcObject
  stream?.getTracks().forEach(t => t.stop())
})
</script>