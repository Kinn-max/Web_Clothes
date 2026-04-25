<script setup lang="ts">
const props = defineProps<{ show: boolean }>()

const steps = ['Đang phân tích ảnh...', 'Đang ghép trang phục...', 'Hoàn thiện kết quả...']
const stepIndex = ref(0)
const progress = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

watch(() => props.show, (val) => {
  if (val) {
    stepIndex.value = 0
    progress.value = 0
    timer = setInterval(() => {
      progress.value = Math.min(progress.value + 100 / 45, 95)
      if (progress.value > 33 && stepIndex.value === 0) stepIndex.value = 1
      if (progress.value > 66 && stepIndex.value === 1) stepIndex.value = 2
    }, 1000)
  } else {
    if (timer) clearInterval(timer)
    timer = null
  }
})

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-300"
    leave-to-class="opacity-0">
    <div v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center">
        <div class="relative w-20 h-20 mx-auto mb-6">
          <div class="absolute inset-0 rounded-full border-4 border-gray-100" />
          <div class="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div class="absolute inset-0 flex items-center justify-center">
            <svg class="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
        </div>

        <h3 class="font-bold text-gray-900 text-lg mb-1">Đang xử lý AI</h3>
        <p class="text-sm text-violet-600 font-medium mb-5 h-5 transition-all">{{ steps[stepIndex] }}</p>

        <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div class="h-full bg-gradient-to-r from-violet-500 to-pink-400 rounded-full transition-all duration-1000"
            :style="{ width: progress + '%' }" />
        </div>
        <p class="text-xs text-gray-400">Ước tính 30–60 giây · Đừng đóng trang này</p>
      </div>
    </div>
  </Transition>
</template>
