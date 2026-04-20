<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-x-5"
    leave-active-class="transition-all duration-300 ease-in"
    leave-to-class="opacity-0 translate-x-5"
  >
    <div
      v-if="visible"
      class="absolute top-1/2 -translate-y-1/2 right-4 z-10 flex flex-col gap-3 w-[180px]"
    >
      <!-- Toggle button -->
      <button
        class="self-end flex items-center gap-1.5 px-3 py-1.5 rounded-full
               bg-black/60 backdrop-blur-sm text-white/80 text-xs
               hover:bg-black/80 transition-colors"
        @click="open = !open"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        {{ open ? 'Ẩn' : 'Tuỳ chỉnh' }}
      </button>

      <!-- Slider panel -->
      <Transition
        enter-active-class="transition-opacity duration-[400ms]"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-[400ms]"
        leave-to-class="opacity-0"
      >
        <div
          v-if="open"
          class="bg-black/70 backdrop-blur-md rounded-2xl p-4 flex flex-col gap-4 border border-white/10"
        >
          <p class="text-white text-xs font-bold tracking-wider uppercase text-center">
            Kích thước áo
          </p>

          <!-- Scale X -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center">
              <label class="text-white/60 text-xs flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 12h8M8 17h8" />
                </svg>
                Ngang
              </label>
              <span class="text-red-400 text-xs font-mono font-bold">{{ scaleX.toFixed(2) }}×</span>
            </div>
            <input type="range" min="0.5" max="2.0" step="0.02" :value="scaleX"
              class="slider-thumb w-full h-1.5 rounded-full appearance-none cursor-pointer"
              @input="$emit('update:scaleX', parseFloat($event.target.value))" />
          </div>

          <!-- Scale Y -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center">
              <label class="text-white/60 text-xs flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v8M8 12h8" />
                </svg>
                Dọc
              </label>
              <span class="text-red-400 text-xs font-mono font-bold">{{ scaleY.toFixed(2) }}×</span>
            </div>
            <input type="range" min="0.5" max="2.0" step="0.02" :value="scaleY"
              class="slider-thumb w-full h-1.5 rounded-full appearance-none cursor-pointer"
              @input="$emit('update:scaleY', parseFloat($event.target.value))" />
          </div>

          <!-- Offset Y -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center">
              <label class="text-white/60 text-xs flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7M12 3v18" />
                </svg>
                Vị trí
              </label>
              <span class="text-red-400 text-xs font-mono font-bold">{{ offsetY.toFixed(2) }}</span>
            </div>
            <input type="range" min="-0.5" max="0.5" step="0.01" :value="offsetY"
              class="slider-thumb w-full h-1.5 rounded-full appearance-none cursor-pointer"
              @input="$emit('update:offsetY', parseFloat($event.target.value))" />
          </div>

          <!-- Sleeve strength -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center">
              <label class="text-white/60 text-xs flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3" />
                </svg>
                Tay áo
              </label>
              <span class="text-red-400 text-xs font-mono font-bold">{{ sleeveStrength.toFixed(2) }}</span>
            </div>
            <input type="range" min="0.0" max="1.0" step="0.05" :value="sleeveStrength"
              class="slider-thumb w-full h-1.5 rounded-full appearance-none cursor-pointer"
              @input="$emit('update:sleeveStrength', parseFloat($event.target.value))" />
          </div>

          <div class="border-t border-white/10" />

          <button
            class="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20
                   text-white/70 hover:text-white text-xs font-semibold
                   transition-all active:scale-95"
            @click="$emit('reset')"
          >
            ↺ Reset về mặc định
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  visible:        { type: Boolean, default: true },
  scaleX:         { type: Number,  default: 1.0 },
  scaleY:         { type: Number,  default: 1.0 },
  offsetY:        { type: Number,  default: 0.0 },
  sleeveStrength: { type: Number,  default: 0.75 },
})

defineEmits(['update:scaleX', 'update:scaleY', 'update:offsetY', 'update:sleeveStrength', 'reset'])

const open = ref(true)
</script>

<style scoped>
.slider-thumb {
  background: rgba(255, 255, 255, 0.15);
  accent-color: #f87171;
}
.slider-thumb::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f87171;
  cursor: pointer;
  -webkit-appearance: none;
  box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.3);
}
.slider-thumb::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f87171;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.3);
}
</style>
