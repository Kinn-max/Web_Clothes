<script setup lang="ts">
import { CreditCard, Wallet, Building2 } from "lucide-vue-next";

const props = defineProps<{
  selectedMethod: string;
}>();

const emit = defineEmits<{
  selectMethod: [method: string];
}>();

const paymentMethods = [
  {
    id: "COD",
    name: "Thanh toán khi nhận hàng (COD)",
    description: "Thanh toán bằng tiền mặt khi nhận hàng",
    icon: Wallet,
  },
  {
    id: "Banking",
    name: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản qua tài khoản ngân hàng",
    icon: Building2,
  }
];
</script>

<template>
  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <h2 class="text-lg font-bold text-gray-900 mb-4">Phương thức thanh toán</h2>
    
    <div class="space-y-3">
      <div
        v-for="method in paymentMethods"
        :key="method.id"
        @click="emit('selectMethod', method.id)"
        :class="[
          'flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all',
          selectedMethod === method.id
            ? 'border-glow-primary-500 bg-glow-primary-50'
            : 'border-gray-200 hover:border-glow-primary-300 bg-white'
        ]"
      >
        <input
          type="radio"
          :checked="selectedMethod === method.id"
          class="mt-1 w-5 h-5 text-glow-primary-600 focus:ring-glow-primary-500 cursor-pointer"
          @click.stop
        />
        <component :is="method.icon" class="w-6 h-6 text-glow-primary-600 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="font-semibold text-gray-900">{{ method.name }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ method.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
