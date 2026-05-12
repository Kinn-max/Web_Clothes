<script setup lang="ts">
import type { Store } from '@/types/store'
import { MapPin, Phone, User } from 'lucide-vue-next'

interface Props {
  store: Store
  showDistance?: boolean
}

defineProps<Props>()

const formatDistance = (distance?: number) => {
  if (!distance) return ''
  return distance < 1
    ? `${(distance * 1000).toFixed(0)}m`
    : `${distance.toFixed(1)}km`
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">

    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-900">{{ store.name }}</h3>
      <span v-if="showDistance && store.distance_km"
        class="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
        {{ formatDistance(store.distance_km) }}
      </span>
    </div>

    <!-- Info -->
    <div class="space-y-2 mb-4">

      <!-- Địa chỉ -->
      <div class="flex items-start gap-2 text-sm text-gray-600">
        <MapPin class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <span>{{ store.address_detail }}</span>
      </div>

      <!-- Phone -->
      <div v-if="store.phone" class="flex items-center gap-2 text-sm text-gray-600">
        <Phone class="w-5 h-5 text-gray-400" />
        <a :href="`tel:${store.phone}`" class="hover:text-blue-600">
          {{ store.phone }}
        </a>
      </div>

      <!-- Manager -->
      <div v-if="store.manager_name" class="flex items-center gap-2 text-sm text-gray-600">
        <User class="w-5 h-5 text-gray-400" />
        <span>Quản lý: {{ store.manager_name }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <a
        :href="`https://www.google.com/maps?q=${store.latitude},${store.longitude}`"
        target="_blank"
        class="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 text-center"
      >
        📍 Chỉ đường
      </a>
    </div>
  </div>
</template>