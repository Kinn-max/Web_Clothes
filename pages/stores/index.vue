<script setup lang="ts">
import type { Store } from '@/types/store'  
import StoreCard from '@/components/store/StoreCard.vue'

definePageMeta({ layout: 'default' })

const { useGetAllStores, findNearestStore } = useStore()

const { data: stores, isLoading: loading } = useGetAllStores({
  limit: ref(100), // lấy nhiều để tính nearest ở frontend
})

const nearestStore = ref<Store | null>(null)

const handleFindNearest = () => {
  if (!navigator.geolocation) {
    alert('Trình duyệt không hỗ trợ định vị')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      nearestStore.value = findNearestStore(
        stores.value ?? [],
        latitude,
        longitude
      )

      if (!nearestStore.value) {
        alert('Không tìm thấy cửa hàng nào có tọa độ')
      }
    },
    (err) => {
      console.error(err)
      alert('Không thể lấy vị trí của bạn')
    }
  )
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Hệ thống cửa hàng</h1>
        <p class="text-gray-600 mt-2">Tìm cửa hàng GlowUp gần bạn</p>
      </div>

      <!-- Find Nearest -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
        <button
          @click="handleFindNearest"
          :disabled="loading"
          class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          📍 Tìm cửa hàng gần nhất
        </button>

        <div v-if="nearestStore" class="mt-6">
          <h3 class="text-lg font-semibold mb-4">Cửa hàng gần bạn nhất:</h3>
          <StoreCard :store="nearestStore" show-distance />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">Đang tải...</div>

      <!-- Store list -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StoreCard
          v-for="store in stores"
          :key="store.id"
          :store="store"
        />
      </div>
    </div>
  </div>
</template>