<script setup lang="ts">
interface TryOnResult {
  image_url?: string
  image_base64?: string
  width?: number
  height?: number
}

const props = defineProps<{
  result: TryOnResult | null
}>()

const emit = defineEmits<{
  retry: []
}>()

const imageUrl = computed(() => props.result?.image_url ?? props.result?.image_base64 ?? null)

function download() {
  if (!imageUrl.value) return
  const a = document.createElement('a')
  a.href = imageUrl.value
  a.download = `tryon-${Date.now()}.jpg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>

<template>
  <div class="flex flex-col h-full gap-3">
    <p class="text-sm font-semibold text-gray-700">Kết quả thử đồ</p>

    <div class="relative flex-1 min-h-72 rounded-2xl overflow-hidden border-2 bg-gray-50"
      :class="imageUrl ? 'border-violet-200' : 'border-dashed border-gray-200'">
      <img v-if="imageUrl" :src="imageUrl" alt="Kết quả thử đồ AI" class="w-full h-full object-contain" />

      <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
          <svg class="w-10 h-10 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-gray-600 mb-1">Chưa có kết quả</p>
          <p class="text-sm text-gray-400 leading-relaxed">
            Tải ảnh của bạn lên, chọn trang phục<br>và nhấn <strong class="text-violet-500">Thử ngay</strong>
          </p>
        </div>
      </div>
    </div>

    <div v-if="imageUrl" class="flex gap-2">
      <button @click="download"
        class="flex-1 py-2.5 flex items-center justify-center gap-2 bg-violet-600 text-white font-semibold rounded-xl text-sm hover:bg-violet-700 transition-colors shadow-lg shadow-violet-100">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Tải xuống
      </button>
      <button @click="emit('retry')"
        class="flex-1 py-2.5 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:border-violet-400 hover:text-violet-600 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Thử lại
      </button>
    </div>
  </div>
</template>
