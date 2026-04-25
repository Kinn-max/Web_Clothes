<script setup lang="ts">
import type { Garment } from '@/types/garment'

const props = defineProps<{
  garments: Garment[]
  loading: boolean
  productName: string
  firestoreProductId: string
}>()

const selectedGarment = ref<Garment | null>(null)

watch(
  () => props.garments,
  (list) => {
    if (list.length > 0 && !selectedGarment.value) {
      selectedGarment.value = list[0]
    }
  },
  { immediate: true },
)

const tryOnUrl = computed(() => {
  if (!selectedGarment.value?.cloth_image_url) return null
  const params = new URLSearchParams({
    product_id: props.firestoreProductId,
    cloth_image_url: selectedGarment.value.cloth_image_url,
    product_name: props.productName,
    cloth_type: 'upper',
  })
  return `/fitting-room?${params.toString()}`
})

const arViewerUrl = computed(() => {
  if (!selectedGarment.value?.model_url) return null
  return `/ar-viewer?garment_id=${selectedGarment.value.id}`
})

const previewImage = computed(
  () => selectedGarment.value?.cloth_image_url || selectedGarment.value?.model_url || '',
)
</script>

<template>
  <div v-if="loading || garments.length > 0" class="pt-8 border-t border-gray-100">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-5">
      <svg class="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <h3 class="font-bold text-gray-900 text-base">Thử đồ ảo</h3>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-4 animate-pulse">
      <div class="h-4 w-20 bg-gray-200 rounded-full" />
      <div class="flex gap-2">
        <div v-for="n in 4" :key="n" class="w-8 h-8 rounded-full bg-gray-200" />
      </div>
      <div class="aspect-square w-32 rounded-xl bg-gray-200" />
      <div class="flex gap-3">
        <div class="h-11 flex-1 rounded-xl bg-gray-200" />
        <div class="h-11 flex-1 rounded-xl bg-gray-200" />
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="garments.length > 0">
      <!-- Color swatches -->
      <div class="mb-4">
        <p class="text-sm text-gray-500 mb-2">
          Chọn màu:
          <span class="font-semibold text-gray-800 ml-1">{{ selectedGarment?.color }}</span>
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="garment in garments"
            :key="garment.id"
            type="button"
            :title="garment.name"
            @click="selectedGarment = garment"
            class="w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-150 hover:scale-110 focus:outline-none relative flex-shrink-0"
            :class="selectedGarment?.id === garment.id
              ? 'border-violet-500 ring-2 ring-violet-300'
              : 'border-gray-200 hover:border-violet-400'"
          >
            <img
              v-if="garment.cloth_image_url || garment.model_url"
              :src="garment.cloth_image_url || garment.model_url"
              :alt="garment.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gray-300" />

            <div
              v-if="selectedGarment?.id === garment.id"
              class="absolute inset-0 flex items-center justify-center bg-violet-600/20"
            >
              <svg class="w-3 h-3 text-violet-700 drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Preview image -->
      <div
        v-if="previewImage"
        class="mb-5 w-32 aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50"
      >
        <img :src="previewImage" :alt="selectedGarment?.name" class="w-full h-full object-cover" />
      </div>

      <!-- Action buttons -->
      <div class="flex gap-3">
        <NuxtLink
          v-if="tryOnUrl"
          :to="tryOnUrl"
          class="flex-1 h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 shadow-md shadow-violet-100 hover:from-violet-700 hover:to-pink-600 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Thử đồ AI
        </NuxtLink>

        <NuxtLink
          v-if="arViewerUrl"
          :to="arViewerUrl"
          class="flex-1 h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md shadow-blue-100 hover:from-blue-700 hover:to-cyan-600 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
          </svg>
          Xem 3D
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
