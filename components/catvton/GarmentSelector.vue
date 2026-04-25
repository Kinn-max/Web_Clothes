<script setup lang="ts">
import { garmentApi } from '@/utils/api'
import type { Garment } from '@/types/garment'

const props = defineProps<{
  selectedUrl?: string
  firestoreProductId?: string
}>()

const emit = defineEmits<{
  select: [{ imageUrl: string; name: string }]
}>()

const garments = ref<Garment[]>([])
const loading = ref(true)
const fetchError = ref(false)

onMounted(async () => {
  try {
    // Lọc theo firestore_product_id nếu có
    if (props.firestoreProductId) {
      garments.value = await garmentApi.getByProductId(props.firestoreProductId)
    } else {
      garments.value = await garmentApi.getAll()
    }
  } catch {
    fetchError.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <p class="text-sm font-semibold text-gray-700">Chọn trang phục khác</p>

    <div v-if="loading" class="flex justify-center py-4">
      <div class="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
    </div>

    <p v-else-if="fetchError" class="text-sm text-red-500 text-center py-2">
      Không thể tải danh sách trang phục
    </p>

    <p v-else-if="garments.length === 0" class="text-sm text-gray-400 text-center py-2">
      Chưa có trang phục nào
    </p>

    <div v-else class="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-0.5">
      <button
    v-for="garment in garments"
    :key="garment.id"
    @click="emit('select', { 
      imageUrl: garment.cloth_image_url ?? garment.model_url, 
      name: garment.name 
    })"
    :class="selectedUrl === (garment.cloth_image_url ?? garment.model_url)
      ? 'border-violet-500 ring-2 ring-violet-300'
      : 'border-gray-200 hover:border-violet-400'"
  >
    <img 
      :src="garment.cloth_image_url ?? '/placeholder-cloth.png'" 
      :alt="garment.name" 
      class="w-full h-full object-cover" 
    />
  </button>
    </div>
  </div>
</template>
