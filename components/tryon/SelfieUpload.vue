<script setup lang="ts">
import { Camera, Upload, RotateCcw, Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  'face-ready': [result: { faceGlbUrl: string; faceParams?: Record<string, any> }]
  'error': [msg: string]
  'skip': []
}>()

const { reconstructFace } = usePhotoTryon()

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const processing = ref(false)

const isBusy = computed(() => processing.value || !!props.loading)

function pickFile() {
  fileInput.value?.click()
}

function validateAndSet(file: File) {
  if (!ACCEPTED.includes(file.type)) {
    emit('error', 'Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP')
    return
  }
  if (file.size > 8 * 1024 * 1024) {
    emit('error', 'Ảnh không được quá 8 MB')
    return
  }
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  selectedFile.value = file
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) validateAndSet(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) validateAndSet(file)
}

function clearImage() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function handleProcess() {
  if (!selectedFile.value) return
  processing.value = true
  try {
    const res = await reconstructFace(selectedFile.value)
    emit('face-ready', {
      faceGlbUrl: res.face_glb_url,
      faceParams: res.face_params,
    })
  } catch (e: any) {
    emit('error', e?.data?.detail ?? e?.message ?? 'Không xử lý được khuôn mặt')
  } finally {
    processing.value = false
  }
}

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
        <Sparkles class="w-5 h-5 text-white" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-gray-900">Chụp ảnh selfie (tùy chọn)</h3>
        <p class="text-xs text-gray-500 mt-0.5">
          Tải ảnh selfie để gắn khuôn mặt thật vào avatar 3D. Có thể bỏ qua nếu chỉ cần body mesh.
        </p>
      </div>
    </div>

    <!-- Drag & drop area -->
    <div
      class="relative rounded-2xl border-2 border-dashed transition-all overflow-hidden"
      :class="[
        previewUrl ? 'border-violet-300 bg-violet-50/40' :
        isDragging ? 'border-violet-500 bg-violet-50' : 'border-violet-200 bg-violet-50/30 hover:border-violet-400 hover:bg-violet-50/60',
        isBusy ? 'pointer-events-none opacity-80' : 'cursor-pointer',
      ]"
      :style="{ minHeight: '220px' }"
      @click="!previewUrl && pickFile()"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop">

      <!-- Preview -->
      <div v-if="previewUrl" class="relative h-[260px] flex items-center justify-center bg-gradient-to-br from-violet-100/50 to-pink-100/50">
        <img :src="previewUrl" alt="selfie preview" class="max-h-full max-w-full object-contain rounded-xl shadow-md" />

        <!-- Replace overlay -->
        <button
          type="button"
          @click.stop="clearImage"
          class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 border border-gray-200 text-gray-600 flex items-center justify-center shadow-sm hover:bg-white hover:text-violet-600 transition-colors"
          title="Đổi ảnh">
          <RotateCcw class="w-4 h-4" />
        </button>

        <!-- Loading overlay -->
        <Transition
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0" leave-to-class="opacity-0">
          <div v-if="isBusy"
            class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-sm">
            <span class="w-9 h-9 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
            <p class="text-xs text-white/80 tracking-wider">Đang phân tích khuôn mặt…</p>
          </div>
        </Transition>
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
        <div class="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
          <Camera class="w-7 h-7 text-violet-500" />
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-700">Kéo thả hoặc bấm để chọn ảnh</p>
          <p class="text-xs text-gray-400 mt-1">JPG, PNG, WebP — tối đa 8 MB</p>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFileChange" />
    </div>

    <!-- Action buttons -->
    <div class="flex flex-col sm:flex-row gap-2">
      <button
        type="button"
        @click="pickFile"
        :disabled="isBusy"
        class="flex-1 h-11 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:border-violet-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
        <Upload class="w-4 h-4" />
        {{ previewUrl ? 'Chọn ảnh khác' : 'Chọn ảnh' }}
      </button>

      <button
        type="button"
        @click="emit('skip')"
        :disabled="isBusy"
        class="flex-1 h-11 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        Bỏ qua
      </button>

      <button
        type="button"
        @click="handleProcess"
        :disabled="!selectedFile || isBusy"
        :class="[
          'flex-[1.5] h-11 rounded-xl text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2',
          (!selectedFile || isBusy)
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.01]'
        ]">
        <span v-if="!isBusy">Xử lý khuôn mặt →</span>
        <span v-else class="flex items-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Đang xử lý…
        </span>
      </button>
    </div>
  </div>
</template>
