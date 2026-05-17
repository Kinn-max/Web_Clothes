<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { clearCart } = useCart()  
const route = useRoute()
const router = useRouter()

const status = computed(() => route.query.status as string)
const orderId = computed(() => route.query.orderId as string)
const transactionNo = computed(() => route.query.transactionNo as string)
const errorMessage = computed(() => route.query.message as string)

const isSuccess = computed(() => status.value === 'success')

onMounted(async () => {
  if (isSuccess.value) {
    await clearCart()  
  }
})

const goToOrders = () => router.push('/order/view_order')
const goHome = () => router.push('/')
const retryPayment = () => router.push('/order/view_order') 
</script>

<template>
  <div class="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
    <div class="max-w-md w-full">

      <!-- Success State -->
      <div v-if="isSuccess" class="text-center">
        <div class="relative mx-auto mb-8 w-28 h-28">
          <div class="absolute inset-0 rounded-full bg-[#D4E8D0] animate-ping opacity-30" />
          <div class="relative flex items-center justify-center w-28 h-28 rounded-full bg-[#E8F5E5] border-2 border-[#5DA85A]">
            <svg class="w-12 h-12 text-[#5DA85A]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 class="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A] mb-2">
          Thanh toán thành công!
        </h1>
        <p class="text-[#6B6B6B] text-sm mb-6">
          Đơn hàng của bạn đã được xác nhận và đang được xử lý.
        </p>

        <div class="bg-white rounded-2xl border border-[#E8E4DF] p-5 mb-8 text-left space-y-3">
          <div class="flex justify-between items-center text-sm">
            <span class="text-[#9B9B9B]">Mã đơn hàng</span>
            <span class="font-mono font-semibold text-[#1A1A1A] text-xs bg-[#F5F3F0] px-2 py-1 rounded">
              #{{ orderId }}
            </span>
          </div>
          <div v-if="transactionNo" class="flex justify-between items-center text-sm">
            <span class="text-[#9B9B9B]">Mã giao dịch Stripe</span>
            <span class="font-mono text-[#5DA85A] text-xs">{{ transactionNo }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-[#9B9B9B]">Trạng thái</span>
            <span class="flex items-center gap-1.5 text-[#5DA85A] font-medium text-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-[#5DA85A] inline-block" />
              Đã thanh toán
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button
            @click="goToOrders"
            class="w-full py-3.5 rounded-xl bg-[#1A1A1A] text-white font-medium text-sm tracking-wide hover:bg-[#2D2D2D] transition-colors"
          >
            Xem đơn hàng của tôi
          </button>
          <button
            @click="goHome"
            class="w-full py-3.5 rounded-xl border border-[#E8E4DF] text-[#1A1A1A] font-medium text-sm hover:bg-[#F5F3F0] transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>

      <!-- Failed State -->
      <div v-else class="text-center">
        <div class="relative mx-auto mb-8 w-28 h-28">
          <div class="relative flex items-center justify-center w-28 h-28 rounded-full bg-[#FDF0F0] border-2 border-[#E05252]">
            <svg class="w-12 h-12 text-[#E05252]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 class="font-['Playfair_Display'] text-3xl font-bold text-[#1A1A1A] mb-2">
          Thanh toán thất bại
        </h1>
        <p class="text-[#6B6B6B] text-sm mb-6">
          {{ errorMessage || 'Đã có lỗi xảy ra trong quá trình thanh toán.' }}
        </p>

        <div class="bg-white rounded-2xl border border-[#E8E4DF] p-5 mb-8 text-left">
          <div class="flex justify-between items-center text-sm">
            <span class="text-[#9B9B9B]">Mã đơn hàng</span>
            <span class="font-mono font-semibold text-[#1A1A1A] text-xs bg-[#F5F3F0] px-2 py-1 rounded">
              #{{ orderId }}
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button
            @click="retryPayment"
            class="w-full py-3.5 rounded-xl bg-[#1A1A1A] text-white font-medium text-sm tracking-wide hover:bg-[#2D2D2D] transition-colors"
          >
            Thử lại thanh toán
          </button>
          <button
            @click="goHome"
            class="w-full py-3.5 rounded-xl border border-[#E8E4DF] text-[#1A1A1A] font-medium text-sm hover:bg-[#F5F3F0] transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>

    </div>
  </div>
</template>