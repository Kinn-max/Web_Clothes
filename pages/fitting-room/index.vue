<script setup lang="ts">
import PersonUpload from '@/components/catvton/PersonUpload.vue'
import ClothPreview from '@/components/catvton/ClothPreview.vue'
import GarmentSelector from '@/components/catvton/GarmentSelector.vue'
import ResultView from '@/components/catvton/ResultView.vue'
import ControlPanel from '@/components/catvton/ControlPanel.vue'
import LoadingOverlay from '@/components/catvton/LoadingOverlay.vue'


const route = useRoute()
const { tryOn, loading, error, result, reset } = useCatVTON()
const { showNotification } = useNotification()

const personFile = ref<File | null>(null)

const clothImageUrl = ref<string>(route.query.cloth_image_url as string ?? '')
const productName = ref<string>(route.query.product_name as string ?? '')

function handleGarmentSelect(garment: { imageUrl: string; name: string }) {
  clothImageUrl.value = garment.imageUrl
  productName.value = garment.name
}
const productId = computed(() => route.query.product_id as string ?? '')

const options = ref({
  cloth_type: (route.query.cloth_type as 'upper' | 'lower' | 'overall') ?? 'upper',
  num_steps: 50,
  guidance: 2.5,
  seed: 42,
})

const canTryOn = computed(() => !!personFile.value && !!clothImageUrl.value)

async function handleTryOn() {
  if (!personFile.value) {
    showNotification('Thiếu ảnh', 'Vui lòng tải ảnh của bạn lên trước', 'warning')
    return
  }
  if (!clothImageUrl.value) {
    showNotification('Thiếu trang phục', 'Không tìm thấy ảnh trang phục', 'error')
    return
  }

  let clothFile: File
  try {
    const res = await fetch(clothImageUrl.value)
    const blob = await res.blob()
    clothFile = new File([blob], 'cloth.jpg', { type: blob.type || 'image/jpeg' })
  } catch {
    showNotification('Lỗi', 'Không thể tải ảnh trang phục, vui lòng thử lại', 'error')
    return
  }

  await tryOn(personFile.value, clothFile, options.value)
  if (result.value) {
    showNotification('Thành công', 'Đã tạo xong ảnh thử đồ!', 'success')
  }
}

function handleRetry() {
  reset()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50">
    <LoadingOverlay :show="loading" />
    <BaseNotification />

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div class="container mx-auto px-4 h-16 flex items-center gap-4 max-w-6xl">
        <NuxtLink
          :to="productId ? `/shop/products/${productId}` : '/shop'"
          class="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-gray-200 text-gray-600 hover:border-violet-400 hover:text-violet-600 transition-colors flex-shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <div class="flex-1 min-w-0">
          <h1 class="font-bold text-gray-900 text-lg leading-none">Phòng thử đồ AI</h1>
          <p v-if="productName" class="text-xs text-gray-500 truncate mt-0.5">{{ productName }}</p>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 rounded-full flex-shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
          <span class="text-xs font-semibold text-violet-700">CatVTON AI</span>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container mx-auto px-4 py-6 max-w-6xl">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Left panel: Person + Cloth -->
        <div class="lg:col-span-4 space-y-4">
          <PersonUpload @update:file="personFile = $event" />
          <ClothPreview
            :imageUrl="clothImageUrl"
            :productName="productName"
            :clothType="options.cloth_type" />

          <GarmentSelector
            :selectedUrl="clothImageUrl"
            @select="handleGarmentSelect" />
        </div>

        <!-- Right panel: Result -->
        <div class="lg:col-span-8 flex flex-col min-h-[400px]">
          <ResultView :result="result" class="flex-1" @retry="handleRetry" />
        </div>
      </div>

      <!-- Controls + CTA -->
      <div class="mt-6 space-y-4">
        <ControlPanel v-model:options="options" />

        <button
          @click="handleTryOn"
          :disabled="!canTryOn || loading"
          class="w-full h-14 rounded-2xl font-bold text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-3"
          :class="canTryOn && !loading
            ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-pink-600 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Thử ngay
        </button>

        <p v-if="!personFile" class="text-center text-sm text-gray-400">
          Tải ảnh của bạn lên để bắt đầu
        </p>
        <p v-else-if="!clothImageUrl" class="text-center text-sm text-amber-500">
          Vui lòng chọn sản phẩm từ trang chi tiết để thử đồ
        </p>
      </div>
    </main>
  </div>
</template>
