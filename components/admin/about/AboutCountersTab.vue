<!-- components/admin/about/AboutCountersTab.vue -->
<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import type { Counter } from '@/types/about'

const props = defineProps<{ modelValue: Counter[] }>()
const emit  = defineEmits<{ 'update:modelValue': [value: Counter[]] }>()

const add = () => {
  emit('update:modelValue', [
    ...props.modelValue,
    { id: `counter_${Date.now()}`, label: '', value: 0 },
  ])
}

const remove = (i: number) => {
  const updated = [...props.modelValue]
  updated.splice(i, 1)
  emit('update:modelValue', updated)
}

const update = (i: number, field: keyof Counter, value: string | number) => {
  const updated = props.modelValue.map((c, idx) =>
    idx === i ? { ...c, [field]: value } : c
  )
  emit('update:modelValue', updated)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(counter, i) in modelValue"
      :key="counter.id"
      class="bg-white rounded-xl border border-gray-200 p-4"
    >
      <div class="flex items-end gap-3">
        <div class="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Nhãn</label>
            <input
              :value="counter.label"
              @input="update(i, 'label', ($event.target as HTMLInputElement).value)"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Năm kinh nghiệm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Giá trị</label>
            <input
              :value="counter.value"
              @input="update(i, 'value', Number(($event.target as HTMLInputElement).value))"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="100"
            />
          </div>
        </div>
        <button
          @click="remove(i)"
          class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <button
      @click="add"
      class="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
    >
      <Plus class="w-4 h-4" />
      Thêm số liệu
    </button>
  </div>
</template>