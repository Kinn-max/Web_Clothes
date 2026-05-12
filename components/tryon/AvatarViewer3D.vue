<template>
  <div class="relative w-full rounded-2xl overflow-hidden bg-[#0a0a0e] border border-white/[0.07]"
    :style="{ height: height + 'px' }">

    <canvas ref="renderCanvas" class="w-full h-full block touch-none outline-none" />

    <!-- Loading -->
    <Transition enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="state === 'loading'"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm">
        <div class="w-9 h-9 rounded-full border-2 border-white/10 border-t-white/70 animate-spin" />
        <p class="text-xs text-white/40 tracking-wider">{{ loadingText }}</p>
      </div>
    </Transition>

    <!-- Error -->
    <Transition enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="state === 'error'"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm">
        <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="text-xs text-white/50 px-6 text-center">{{ errorMessage }}</p>
        <button @click="loadAvatar"
          class="px-4 py-1.5 rounded-lg text-xs border border-white/15 bg-white/5 text-white/60 hover:bg-white/10 transition-colors">
          Thử lại
        </button>
      </div>
    </Transition>

    <!-- Empty -->
    <div v-if="state === 'empty'"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/20">
      <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z"/>
      </svg>
      <p class="text-xs tracking-wider">Chưa có avatar</p>
    </div>

    <!-- Controls top-right -->
    <div v-if="state === 'ready'" class="absolute top-3 right-3 flex flex-col gap-1.5">
      <button @click="isAutoRotate = !isAutoRotate" title="Tự xoay"
        :class="btnClass(isAutoRotate)">
        <RotateCcw class="w-4 h-4" />
      </button>
      <button @click="resetCamera" title="Reset camera"
        :class="btnClass(false)">
        <RefreshCw class="w-4 h-4" />
      </button>
      <button @click="isWireframe = !isWireframe" title="Wireframe"
        :class="btnClass(isWireframe)">
        <Triangle class="w-4 h-4" />
      </button>
      <button @click="toggleFullscreen" title="Toàn màn hình"
        :class="btnClass(false)">
        <Maximize2 class="w-4 h-4" />
      </button>
    </div>

    <!-- Layer toggle bottom-left -->
    <div v-if="state === 'ready' && hasGarment"
      class="absolute bottom-3 left-3 flex gap-1.5">
      <button @click="bodyVisible = !bodyVisible"
        :class="layerClass(bodyVisible)">Cơ thể</button>
      <button @click="garmentVisible = !garmentVisible"
        :class="layerClass(garmentVisible)">Trang phục</button>
    </div>

    <!-- Polygon info bottom-right -->
    <div v-if="state === 'ready' && meshInfo"
      class="absolute bottom-3 right-3 text-[10px] text-white/20 tracking-wider pointer-events-none">
      {{ meshInfo }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { RotateCcw, RefreshCw, Triangle, Maximize2 } from 'lucide-vue-next'

const props = defineProps<{
  avatarUrl?: string
  garmentUrl?: string
  height?: number
  autoRotate?: boolean
}>()

const emit = defineEmits<{
  ready: []
  error: [err: Error]
  meshInfo: [info: { polygons: number }]
}>()

// ── State ─────────────────────────────────────────────────────────────────
const renderCanvas = ref<HTMLCanvasElement | null>(null)
const state = ref<'empty' | 'loading' | 'ready' | 'error'>('empty')
const loadingText = ref('Khởi tạo engine…')
const errorMessage = ref('')
const meshInfo = ref('')
const hasGarment = ref(false)
const isAutoRotate = ref(props.autoRotate ?? true)
const isWireframe = ref(false)
const bodyVisible = ref(true)
const garmentVisible = ref(true)

// ── Babylon refs ──────────────────────────────────────────────────────────
let engine: any = null
let scene: any = null
let camera: any = null
let bodyRoot: any = null
let garmentRoot: any = null
let rotateObs: any = null

// ── Style helpers ─────────────────────────────────────────────────────────
const btnClass = (active: boolean) =>
  `w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
    active
      ? 'bg-violet-500/30 border-violet-500/50 text-violet-300'
      : 'bg-black/60 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
  }`

const layerClass = (visible: boolean) =>
  `px-3 py-1 rounded-md text-[11px] font-medium border transition-all ${
    visible
      ? 'bg-violet-500/25 border-violet-500/40 text-violet-200'
      : 'bg-black/50 border-white/10 text-white/35'
  }`

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  await injectBabylon()
  initEngine()
  if (props.avatarUrl) loadAvatar()
})

onUnmounted(disposeAll)

watch(() => props.avatarUrl, (url) => url ? loadAvatar() : (state.value = 'empty'))
watch(() => props.garmentUrl, (url) => { if (url && state.value === 'ready') loadGarment(url) })
watch(isAutoRotate, (v) => v ? startRotate() : stopRotate())
watch(isWireframe, (v) => { applyWireframe(bodyRoot, v); applyWireframe(garmentRoot, v) })
watch(bodyVisible, (v) => bodyRoot?.setEnabled(v))
watch(garmentVisible, (v) => garmentRoot?.setEnabled(v))

// ── Babylon script loader ─────────────────────────────────────────────────
function injectBabylon(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).BABYLON) { resolve(); return }
    const s1 = document.createElement('script')
    s1.src = 'https://cdn.babylonjs.com/babylon.js'
    s1.onload = () => {
      const s2 = document.createElement('script')
      s2.src = 'https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js'
      s2.onload = () => resolve()
      document.head.appendChild(s2)
    }
    document.head.appendChild(s1)
  })
}

// ── Engine ────────────────────────────────────────────────────────────────
function initEngine() {
  const B = (window as any).BABYLON
  engine = new B.Engine(renderCanvas.value, true, { antialias: true })
  scene  = new B.Scene(engine)
  scene.clearColor = new B.Color4(0.04, 0.04, 0.055, 1)

  camera = new B.ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 2.5, 2.2, B.Vector3.Zero(), scene)
  camera.lowerRadiusLimit = 0.4
  camera.upperRadiusLimit = 12
  camera.wheelDeltaPercentage = 0.01
  camera.attachControl(renderCanvas.value, true)

  const hemi = new B.HemisphericLight('h', new B.Vector3(0, 1, 0), scene)
  hemi.intensity = 0.55
  const dir = new B.DirectionalLight('d', new B.Vector3(-1, -2, -1), scene)
  dir.position = new B.Vector3(4, 8, 4)
  dir.intensity = 0.9

  const ro = new ResizeObserver(() => engine?.resize())
  ro.observe(renderCanvas.value!.parentElement!)
  engine.runRenderLoop(() => scene?.render())
}

// ── Load GLB ──────────────────────────────────────────────────────────────
async function loadAvatar() {
  if (!props.avatarUrl) return
  state.value = 'loading'
  loadingText.value = 'Đang tải body mesh…'
  errorMessage.value = ''
  bodyRoot?.dispose(); bodyRoot = null

  try {
    bodyRoot = await importGlb(props.avatarUrl)
    fitCamera(bodyRoot)
    const p = countPolys()
    meshInfo.value = p.toLocaleString('vi-VN') + ' polygons'
    emit('meshInfo', { polygons: p })
    state.value = 'ready'
    emit('ready')
    if (isAutoRotate.value) startRotate()
    if (props.garmentUrl) loadGarment(props.garmentUrl)
  } catch (e: any) {
    state.value = 'error'
    errorMessage.value = e?.message ?? 'Không thể tải file GLB'
    emit('error', e)
  }
}

async function loadGarment(url: string) {
  const prev = state.value
  state.value = 'loading'
  loadingText.value = 'Đang tải trang phục…'
  garmentRoot?.dispose(); garmentRoot = null
  try {
    garmentRoot = await importGlb(url)
    hasGarment.value = true
    if (isWireframe.value) applyWireframe(garmentRoot, true)
  } catch { hasGarment.value = false }
  state.value = 'ready'
}

function importGlb(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const B = (window as any).BABYLON
    B.SceneLoader.ImportMesh('', '', url, scene,
      (meshes: any[]) => {
        const root = new B.TransformNode('root_' + Date.now(), scene)
        meshes.forEach((m: any) => { if (!m.parent) m.parent = root })
        resolve(root)
      },
      null,
      (_: any, msg: string, ex: any) => reject(new Error(msg || ex?.message || 'GLB error')),
      '.glb'
    )
  })
}

// ── Camera ────────────────────────────────────────────────────────────────
function fitCamera(root: any) {
  const B = (window as any).BABYLON
  const meshes = root.getChildMeshes()
  if (!meshes.length) return
  let min = new B.Vector3(Infinity, Infinity, Infinity)
  let max = new B.Vector3(-Infinity, -Infinity, -Infinity)
  meshes.forEach((m: any) => {
    m.computeWorldMatrix(true)
    const bb = m.getBoundingInfo().boundingBox
    min = B.Vector3.Minimize(min, bb.minimumWorld)
    max = B.Vector3.Maximize(max, bb.maximumWorld)
  })
  camera.target = B.Vector3.Lerp(min, max, 0.5)
  camera.radius = B.Vector3.Distance(min, max) * 0.82
  camera.alpha = -Math.PI / 2
  camera.beta  = Math.PI / 2.4
}

function resetCamera() { if (bodyRoot) fitCamera(bodyRoot) }

// ── Rotate ────────────────────────────────────────────────────────────────
function startRotate() {
  stopRotate()
  rotateObs = scene.onBeforeRenderObservable.add(() => { camera.alpha += 0.004 })
}
function stopRotate() {
  if (rotateObs) { scene.onBeforeRenderObservable.remove(rotateObs); rotateObs = null }
}

// ── Wireframe ─────────────────────────────────────────────────────────────
function applyWireframe(root: any, v: boolean) {
  root?.getChildMeshes().forEach((m: any) => { if (m.material) m.material.wireframe = v })
}

// ── Fullscreen ────────────────────────────────────────────────────────────
function toggleFullscreen() {
  const el = renderCanvas.value?.parentElement
  if (!document.fullscreenElement) el?.requestFullscreen?.()
  else document.exitFullscreen?.()
}

// ── Polygon count ─────────────────────────────────────────────────────────
function countPolys() {
  return scene?.meshes?.reduce((s: number, m: any) =>
    s + Math.floor((m.getTotalIndices?.() ?? 0) / 3), 0) ?? 0
}

// ── Cleanup ───────────────────────────────────────────────────────────────
function disposeAll() {
  stopRotate()
  engine?.dispose()
  engine = scene = camera = bodyRoot = garmentRoot = null
}
</script>