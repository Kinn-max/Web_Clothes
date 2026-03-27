<script setup lang="ts">
import type { ShippingTracking } from "@/@type/shipping";

interface Props {
  trackings: ShippingTracking[];
}

defineProps<Props>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<template>
  <div class="flow-root">
    <ul role="list" class="-mb-8">
      <li v-for="(tracking, idx) in trackings" :key="tracking.id">
        <div class="relative pb-8">
          <!-- Line connector -->
          <span
            v-if="idx !== trackings.length - 1"
            class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />

          <div class="relative flex space-x-3">
            <!-- Icon -->
            <div>
              <span
                class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                :class="
                  idx === 0
                    ? 'bg-green-500'
                    : 'bg-gray-400'
                "
              >
                <svg
                  class="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </div>

            <!-- Content -->
            <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
              <div>
                <p class="text-sm font-medium text-gray-900">
                  <ShippingStatusBadge :status="tracking.status" />
                </p>
                <p v-if="tracking.location" class="mt-1 text-sm text-gray-600">
                  📍 {{ tracking.location }}
                </p>
                <p v-if="tracking.description" class="mt-1 text-sm text-gray-500">
                  {{ tracking.description }}
                </p>
                <p v-if="tracking.updated_by_name" class="mt-1 text-xs text-gray-400">
                  Bởi: {{ tracking.updated_by_name }}
                </p>
              </div>
              <div class="whitespace-nowrap text-right text-sm text-gray-500">
                <time :datetime="tracking.created_at">
                  {{ formatDate(tracking.created_at) }}
                </time>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="trackings.length === 0" class="text-center py-8 text-gray-500">
      Chưa có thông tin vận chuyển
    </div>
  </div>
</template>