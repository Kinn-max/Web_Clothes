<script setup lang="ts">
import { useStore } from "@/composables/useStore";
import type { Store } from "@/@type/store";

definePageMeta({
  layout: "default",
});

const { getAllStores, findNearestStore, loading } = useStore();

const stores = ref<Store[]>([]);
const nearestStore = ref<Store | null>(null);

const fetchStores = async () => {
  try {
    stores.value = await getAllStores();
  } catch (error) {
    console.error(error);
  }
};

const findNearest = () => {
  if (!navigator.geolocation) {
    alert("Trình duyệt không hỗ trợ định vị");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        nearestStore.value = await findNearestStore(
          position.coords.latitude,
          position.coords.longitude
        );
      } catch (error) {
        console.error(error);
      }
    },
    (error) => {
      console.error(error);
      alert("Không thể lấy vị trí của bạn");
    }
  );
};

onMounted(() => {
  fetchStores();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Hệ thống cửa hàng</h1>
        <p class="text-gray-600 mt-2">Tìm cửa hàng GlowUp gần bạn</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
        <button
          @click="findNearest"
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

      <div v-if="loading" class="text-center py-12">Đang tải...</div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StoreCard v-for="store in stores" :key="store.id" :store="store" />
      </div>
    </div>
  </div>
</template>