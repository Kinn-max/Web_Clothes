<script setup lang="ts">
import type { Store } from "@/@type/store";

interface Props {
  store: Store;
  showDistance?: boolean;
}

defineProps<Props>();

const formatDistance = (distance?: number) => {
  if (!distance) return "";
  return distance < 1
    ? `${(distance * 1000).toFixed(0)}m`
    : `${distance.toFixed(1)}km`;
};
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
  >
    <div class="flex items-start justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-900">{{ store.name }}</h3>
      <span
        v-if="showDistance && store.distance_km"
        class="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
      >
        {{ formatDistance(store.distance_km) }}
      </span>
    </div>

    <div class="space-y-2 mb-4">
      <div class="flex items-start gap-2 text-sm text-gray-600">
        <svg
          class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>{{ store.address_detail }}</span>
      </div>

      <div v-if="store.phone" class="flex items-center gap-2 text-sm text-gray-600">
        <svg
          class="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        <a :href="`tel:${store.phone}`" class="hover:text-blue-600">
          {{ store.phone }}
        </a>
      </div>

      <div v-if="store.manager_name" class="flex items-center gap-2 text-sm text-gray-600">
        <svg
          class="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span>Quản lý: {{ store.manager_name }}</span>
      </div>
    </div>

    <div class="flex gap-2">
      
        :href="`https://www.google.com/maps?q=${store.latitude},${store.longitude}`"
        target="_blank"
        class="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 text-center"
      <a>
        📍 Chỉ đường
      </a>
    </div>
  </div>
</template>