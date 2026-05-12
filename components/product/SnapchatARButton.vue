<script setup lang="ts">
import QRCode from 'qrcode'
import { garmentApi } from '@/utils/api'

const props = defineProps<{
  garmentId: number | null
  garmentName?: string
}>()

const lensUrl = ref<string | null>(null)
const qrDataUrl = ref<string | null>(null)
const loading = ref(false)
const error = ref(false)

const fetchLensLink = async () => {
  if (!props.garmentId) return
  loading.value = true
  error.value = false
  lensUrl.value = null
  qrDataUrl.value = null

  try {
    const data = await garmentApi.getLensLink(props.garmentId)
    lensUrl.value = data.lens_url

    qrDataUrl.value = await QRCode.toDataURL(data.lens_url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

const openSnapchat = () => {
  if (lensUrl.value) {
    window.open(lensUrl.value, '_blank')
  }
}

watch(() => props.garmentId, (newId) => {
  if (newId) fetchLensLink()
}, { immediate: true })
</script>

<template>
  <div class="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-4">
      <div class="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-sm">
        👻
      </div>
      <div>
        <p class="font-bold text-gray-900 text-sm">Thử AR Snapchat</p>
        <p class="text-xs text-gray-500">Mở Snapchat để thử đồ realtime</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-4">
      <div class="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-3">
      <p class="text-sm text-red-500">Không thể tải Snapchat lens</p>
      <button
        @click="fetchLensLink"
        class="mt-2 text-xs text-yellow-600 underline hover:text-yellow-700"
      >
        Thử lại
      </button>
    </div>

    <!-- No garment selected -->
    <div v-else-if="!garmentId" class="text-center py-3">
      <p class="text-sm text-gray-400">Chọn màu sắc để xem QR</p>
    </div>

    <!-- Ready -->
    <div v-else-if="qrDataUrl" class="space-y-3">
      <!-- QR Code -->
      <div class="flex flex-col items-center gap-2">
        <img
          :src="qrDataUrl"
          alt="Snapchat AR QR Code"
          class="w-36 h-36 rounded-xl border-4 border-white shadow-md"
        />
        <p class="text-xs text-gray-500 text-center">
          📱 Quét bằng camera Snapchat
        </p>
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-2">
        <div class="flex-1 h-px bg-gray-200" />
        <span class="text-xs text-gray-400">hoặc</span>
        <div class="flex-1 h-px bg-gray-200" />
      </div>

      <!-- Open button -->
      <button
        @click="openSnapchat"
        class="w-full h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-colors shadow-sm"
      >
        <span>👻</span>
        Mở Snapchat AR
      </button>
    </div>
  </div>
</template>
