<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { useGetPayments, useGetPaymentDetail, formatStatus, formatDate, formatVND } = useStripePayments()
const { data, isLoading, refetch } = useGetPayments(50)

const selectedPaymentId = ref<string | null>(null)
const showModal = ref(false)

const { data: detail, isLoading: loadingDetail } = useGetPaymentDetail(selectedPaymentId)

const openDetail = (id: string) => {
  selectedPaymentId.value = id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedPaymentId.value = null
}

const stats = computed(() => {
  const payments = data.value?.data ?? []
  const succeeded = payments.filter(p => p.status === 'succeeded')
  const failed = payments.filter(p => p.status === 'failed')
  const totalVND = succeeded.reduce((sum, p) => sum + p.amount_vnd, 0)
  return {
    total: payments.length,
    succeeded: succeeded.length,
    failed: failed.length,
    totalVND,
    successRate: payments.length ? Math.round((succeeded.length / payments.length) * 100) : 0,
  }
})
</script>

<template>
  <div class="p-8 bg-slate-50 min-h-screen">

    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Quản lý thanh toán Stripe</h1>
        <p class="text-slate-500 mt-1 text-sm">Tất cả giao dịch thanh toán qua Stripe</p>
      </div>
      <button
        @click="refetch()"
        class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Làm mới
      </button>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-violet-50 rounded-xl">
            <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <span class="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">Stripe</span>
        </div>
        <p class="text-slate-500 text-sm">Tổng giao dịch</p>
        <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.total }}</p>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-emerald-50 rounded-xl">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{{ stats.successRate }}%</span>
        </div>
        <p class="text-slate-500 text-sm">Thành công</p>
        <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.succeeded }}</p>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-rose-50 rounded-xl">
            <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <p class="text-slate-500 text-sm">Thất bại</p>
        <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.failed }}</p>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-blue-50 rounded-xl">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <p class="text-slate-500 text-sm">Tổng thu (ước tính)</p>
        <p class="text-xl font-bold text-slate-900 mt-1">{{ formatVND(stats.totalVND) }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-bold text-slate-900">Danh sách giao dịch</h2>
        
          <a href="https://dashboard.stripe.com/test/payments"
          target="_blank"
          class="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium"
        >
          Xem trên Stripe
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      </div>

      <div v-if="isLoading" class="p-12 flex justify-center">
        <div class="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
      </div>

      <div v-else-if="!data?.data?.length" class="p-12 text-center text-slate-400">
        Chưa có giao dịch nào.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã giao dịch</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Đơn hàng</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Số tiền</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thẻ</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian</th>
              <th class="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chi tiết</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="payment in data.data"
              :key="payment.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-6 py-4">
                <span class="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  {{ payment.id.slice(0, 20) }}...
                </span>
              </td>
              <td class="px-6 py-4">
                <span v-if="payment.order_id" class="font-mono text-xs font-semibold text-slate-700">
                  #{{ payment.order_id.slice(0, 8).toUpperCase() }}
                </span>
                <span v-else class="text-slate-400 text-xs">—</span>
              </td>
              <td class="px-6 py-4">
                <p class="font-semibold text-slate-900 text-sm">{{ formatVND(payment.amount_vnd) }}</p>
                <p class="text-xs text-slate-400">${{ payment.amount.toFixed(2) }} {{ payment.currency }}</p>
              </td>
              <td class="px-6 py-4">
                <div v-if="payment.payment_method_details" class="flex items-center gap-1.5">
                  <span class="capitalize text-xs font-medium text-slate-700">{{ payment.payment_method_details.brand }}</span>
                  <span class="text-xs text-slate-400">****{{ payment.payment_method_details.last4 }}</span>
                </div>
                <span v-else class="text-slate-400 text-xs">—</span>
              </td>
              <td class="px-6 py-4">
                <span :class="['text-xs font-bold px-2.5 py-1 rounded-full', formatStatus(payment.status).cls]">
                  {{ formatStatus(payment.status).label }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ formatDate(payment.created) }}</td>
              <td class="px-6 py-4 text-center">
                <button
                  @click="openDetail(payment.id)"
                  class="px-3 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                >
                  Xem
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        @click.self="closeModal"
      >
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-900">Chi tiết giao dịch</h3>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
          </div>

          <div v-if="loadingDetail" class="p-12 flex justify-center">
            <div class="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
          </div>

          <div v-else-if="detail" class="p-6 space-y-4">
            <div class="flex justify-center">
              <span :class="['text-sm font-bold px-4 py-2 rounded-full', formatStatus(detail.status).cls]">
                {{ formatStatus(detail.status).label }}
              </span>
            </div>

            <div class="space-y-3 bg-slate-50 rounded-xl p-4">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Mã giao dịch</span>
                <span class="font-mono text-xs text-slate-700 text-right max-w-[200px] break-all">{{ detail.id }}</span>
              </div>
              <div v-if="detail.order_id" class="flex justify-between text-sm">
                <span class="text-slate-500">Mã đơn hàng</span>
                <span class="font-mono font-semibold text-slate-900">#{{ detail.order_id.slice(0, 8).toUpperCase() }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Số tiền (VND)</span>
                <span class="font-bold text-slate-900">{{ formatVND(detail.amount_vnd) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Số tiền (USD)</span>
                <span class="text-slate-700">${{ detail.amount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Thời gian</span>
                <span class="text-slate-700">{{ formatDate(detail.created) }}</span>
              </div>
              <template v-if="detail.payment_method_details">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Loại thẻ</span>
                  <span class="capitalize font-medium text-slate-700">{{ detail.payment_method_details.brand }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Số thẻ</span>
                  <span class="font-mono text-slate-700">**** **** **** {{ detail.payment_method_details.last4 }}</span>
                </div>
              </template>
              <template v-if="detail.billing_details">
                <div v-if="detail.billing_details.name" class="flex justify-between text-sm">
                  <span class="text-slate-500">Tên chủ thẻ</span>
                  <span class="text-slate-700">{{ detail.billing_details.name }}</span>
                </div>
                <div v-if="detail.billing_details.email" class="flex justify-between text-sm">
                  <span class="text-slate-500">Email</span>
                  <span class="text-slate-700">{{ detail.billing_details.email }}</span>
                </div>
              </template>
            </div>

            <div class="flex gap-3 pt-2">
              <a
                v-if="detail.receipt_url"
                :href="detail.receipt_url"
                target="_blank"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Xem biên lai
              </a>
              <a
                :href="`https://dashboard.stripe.com/test/payments/${detail.id}`"
                target="_blank"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Xem trên Stripe
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>