<script setup lang="ts">
const emit = defineEmits<{
  'update:file': [file: File]
}>()

const previewUrl = ref<string | null>(null)
const isDragging = ref(false)
const showCamera = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function validateAndEmit(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    alert('Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP')
    return
  }
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  emit('update:file', file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) validateAndEmit(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) validateAndEmit(file)
}

async function toggleCamera() {
  if (showCamera.value) {
    stopCamera()
    return
  }
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    showCamera.value = true
    await nextTick()
    if (videoRef.value) videoRef.value.srcObject = stream.value
  } catch {
    alert('Không thể truy cập camera')
  }
}

function stopCamera() {
  stream.value?.getTracks().forEach(t => t.stop())
  stream.value = null
  showCamera.value = false
}

function captureFromCamera() {
  if (!videoRef.value) return
  const canvas = document.createElement('canvas')
  canvas.width = videoRef.value.videoWidth
  canvas.height = videoRef.value.videoHeight
  canvas.getContext('2d')!.drawImage(videoRef.value, 0, 0)
  canvas.toBlob(blob => {
    if (!blob) return
    const file = new File([blob], 'captured.jpg', { type: 'image/jpeg' })
    validateAndEmit(file)
    stopCamera()
  }, 'image/jpeg', 0.9)
}

onUnmounted(() => {
  stopCamera()
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-sm font-semibold text-gray-700">Ảnh của bạn</p>

    <!-- Camera view -->
    <div v-if="showCamera" class="relative aspect-square rounded-2xl overflow-hidden bg-black border-2 border-violet-400">
      <video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover" style="transform: scaleX(-1)" />
      <div class="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
        <button @click="captureFromCamera"
          class="px-5 py-2 bg-white text-gray-900 font-bold rounded-full text-sm shadow-lg hover:bg-gray-100 transition-colors">
          Chụp
        </button>
        <button @click="stopCamera"
          class="px-5 py-2 bg-white/20 text-white font-bold rounded-full text-sm backdrop-blur hover:bg-white/30 transition-colors">
          Hủy
        </button>
      </div>
    </div>

    <!-- Upload area -->
    <div v-else
      class="relative aspect-square rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden"
      :class="isDragging ? 'border-violet-500 bg-violet-50' : 'border-dashed border-gray-300 bg-gray-50 hover:border-violet-400 hover:bg-violet-50/50'"
      @click="fileInput?.click()"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop">

      <img v-if="previewUrl" :src="previewUrl" class="w-full h-full object-cover" alt="Preview" />

      <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
        <div class="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
          <svg class="w-7 h-7 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-700">Tải ảnh của bạn</p>
          <p class="text-xs text-gray-400 mt-1">Lưu ý: ảnh gốc phải theo phong cách của quần áo</p>
        </div>
      </div>

      <!-- Replace hint when has preview -->
      <div v-if="previewUrl" class="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
        <span class="opacity-0 hover:opacity-100 text-white text-sm font-semibold bg-black/50 px-3 py-1.5 rounded-full transition-opacity">Đổi ảnh</span>
      </div>
    </div>

    <div class="flex gap-2">
      <button @click.stop="fileInput?.click()"
        class="flex-1 py-2 text-sm font-medium rounded-xl border-2 border-gray-200 text-gray-700 hover:border-violet-400 hover:text-violet-600 transition-colors">
        Chọn ảnh
      </button>
      <button @click.stop="toggleCamera"
        class="flex-1 py-2 text-sm font-medium rounded-xl transition-colors"
        :class="showCamera ? 'bg-violet-600 text-white' : 'border-2 border-gray-200 text-gray-700 hover:border-violet-400 hover:text-violet-600'">
        {{ showCamera ? 'Dừng camera' : 'Chụp ảnh' }}
      </button>
    </div>

    <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onFileChange" />
  </div>
</template>
