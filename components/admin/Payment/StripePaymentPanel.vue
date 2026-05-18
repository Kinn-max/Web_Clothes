<script setup lang="ts">
const { useGetPayments, formatStatus, formatDate, formatVND } = useStripePayments()
const { data, isLoading } = useGetPayments(5)

const recentPayments = computed(() => data.value?.data ?? [])
const succeededCount = computed(() => recentPayments.value.filter(p => p.status === 'succeeded').length)
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div class="flex items-center justify-between p-6 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <!-- Stripe logo màu tím -->
        <div class="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
          </svg>
        </div>
        <div>
          <h2 class="font-bold text-slate-900">Giao dịch Stripe</h2>
          <p class="text-xs text-slate-400">{{ succeededCount }}/{{ recentPayments.length }} thành công</p>
        </div>
      </div>
      <NuxtLink
        to="/admin/payments"
        class="text-xs text-violet-600 font-medium hover:underline"
      >
        Xem tất cả →
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="p-6 space-y-3">
      <div v-for="i in 3" :key="i" class="h-10 bg-slate-50 rounded-xl animate-pulse" />
    </div>

    <!-- Empty -->
    <div v-else-if="!recentPayments.length" class="p-8 text-center text-slate-400 text-sm">
      Chưa có giao dịch nào.
    </div>

    <!-- List -->
    <div v-else class="divide-y divide-slate-50">
      <div
        v-for="payment in recentPayments"
        :key="payment.id"
        class="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-mono text-[10px] font-bold flex-shrink-0">
            {{ payment.order_id ? payment.order_id.slice(0, 4).toUpperCase() : 'STR' }}
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ formatVND(payment.amount_vnd) }}</p>
            <p class="text-xs text-slate-400">{{ formatDate(payment.created) }}</p>
          </div>
        </div>
        <span :class="['text-[10px] font-bold px-2 py-1 rounded-full', formatStatus(payment.status).cls]">
          {{ formatStatus(payment.status).label }}
        </span>
      </div>
    </div>
  </div>
</template>