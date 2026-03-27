<script setup lang="ts">
import type { ShippingMethod } from "@/@type/shipping";

interface Props {
  method: ShippingMethod;
  selected?: boolean;
}

interface Emits {
  (e: "select", method: ShippingMethod): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};
</script>

<template>
  <div
    class="relative rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md"
    :class="
      selected
        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
        : 'border-gray-200 hover:border-gray-300'
    "
    @click="emit('select', method)"
  >
    <!-- Selected indicator -->
    <div
      v-if="selected"
      class="absolute top-2 right-2 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center"
    >
      <svg
        class="h-3 w-3 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h3 class="text-sm font-semibold text-gray-900">
          {{ method.name }}
        </h3>
        <p class="text-xs text-gray-500 mt-1">
          {{ method.provider_name }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          ⏱️ {{ method.estimated_days_min }}-{{ method.estimated_days_max }} ngày
        </p>
        <p v-if="method.description" class="text-xs text-gray-500 mt-1">
          {{ method.description }}
        </p>
      </div>
      <div class="text-right">
        <p class="text-lg font-bold text-gray-900">
          {{ formatPrice(method.fixed_fee) }}
        </p>
      </div>
    </div>
  </div>
</template>