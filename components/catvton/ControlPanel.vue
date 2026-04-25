<script setup lang="ts">
interface TryOnOptions {
  cloth_type: 'upper' | 'lower' | 'overall'
  num_steps: number
  guidance: number
  seed: number
}

const props = defineProps<{
  options: TryOnOptions
}>()

const emit = defineEmits<{
  'update:options': [opts: TryOnOptions]
}>()

const expanded = ref(false)

function update(key: keyof TryOnOptions, value: any) {
  emit('update:options', { ...props.options, [key]: value })
}

function randomSeed() {
  update('seed', Math.floor(Math.random() * 100000))
}
</script>

<template>
  <div class="rounded-2xl border-2 border-gray-200 bg-white overflow-hidden">
    <!-- cloth_type - always visible -->
    <div class="p-4">
      <p class="text-sm font-semibold text-gray-700 mb-3">Loại trang phục</p>
      <div class="flex gap-2">
        <button
          v-for="opt in [{ value: 'upper', label: 'Áo trên' }, { value: 'lower', label: 'Quần' }, { value: 'overall', label: 'Toàn thân' }]"
          :key="opt.value"
          @click="update('cloth_type', opt.value)"
          class="flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-200"
          :class="options.cloth_type === opt.value
            ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
            : 'border-2 border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600'">
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Advanced toggle -->
    <button @click="expanded = !expanded"
      class="w-full px-4 py-2.5 flex items-center justify-between text-sm text-gray-500 bg-gray-50 border-t-2 border-gray-100 hover:bg-gray-100 transition-colors">
      <span class="font-medium">Tùy chỉnh nâng cao</span>
      <svg class="w-4 h-4 transition-transform duration-200" :class="expanded ? 'rotate-180' : ''"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-show="expanded" class="p-4 border-t-2 border-gray-100 space-y-5">
      <!-- num_steps -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="text-sm font-medium text-gray-700">Số bước xử lý</label>
          <span class="text-sm font-bold text-violet-600">{{ options.num_steps }}</span>
        </div>
        <input type="range" min="20" max="100" step="5"
          :value="options.num_steps"
          @input="update('num_steps', Number(($event.target as HTMLInputElement).value))"
          class="w-full accent-violet-600 cursor-pointer" />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>Nhanh (20)</span><span>Đẹp (100)</span>
        </div>
      </div>

      <!-- guidance -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="text-sm font-medium text-gray-700">Độ bám hình ảnh</label>
          <span class="text-sm font-bold text-violet-600">{{ options.guidance.toFixed(1) }}</span>
        </div>
        <input type="range" min="1.0" max="5.0" step="0.1"
          :value="options.guidance"
          @input="update('guidance', Number(($event.target as HTMLInputElement).value))"
          class="w-full accent-violet-600 cursor-pointer" />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>Tự do (1.0)</span><span>Chính xác (5.0)</span>
        </div>
      </div>

      <!-- seed -->
      <div>
        <label class="text-sm font-medium text-gray-700 block mb-2">Seed</label>
        <div class="flex gap-2">
          <input type="number" :value="options.seed" min="0"
            @input="update('seed', Number(($event.target as HTMLInputElement).value))"
            class="flex-1 px-3 py-2 text-sm rounded-xl border-2 border-gray-200 outline-none focus:border-violet-400 transition-colors" />
          <button @click="randomSeed"
            class="px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-600 hover:border-violet-400 hover:text-violet-600 transition-colors whitespace-nowrap">
            Ngẫu nhiên
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
