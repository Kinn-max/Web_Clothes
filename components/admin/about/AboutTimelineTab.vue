<!-- components/admin/about/AboutTimelineTab.vue -->
<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import type { TimelineItem } from '@/types/about'

const props = defineProps<{ modelValue: TimelineItem[] }>()
const emit  = defineEmits<{ 'update:modelValue': [value: TimelineItem[]] }>()

const add = () => {
  emit('update:modelValue', [
    ...props.modelValue,
    { year: '', title: '', content: '' },
  ])
}

const remove = (i: number) => {
  const updated = [...props.modelValue]
  updated.splice(i, 1)
  emit('update:modelValue', updated)
}

const update = (i: number, field: keyof TimelineItem, value: string) => {
  const updated = props.modelValue.map((item, idx) =>
    idx === i ? { ...item, [field]: value } : item
  )
  emit('update:modelValue', updated)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(item, i) in modelValue"
      :key="i"
      class="bg-white rounded-xl border border-gray-200 p-4"
    >
      <div class="flex items-start gap-3">
        <div class="flex-1 space-y-2">
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Năm</label>
              <input
                :value="item.year"
                @input="update(i, 'year', ($event.target as HTMLInputElement).value)"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="2024"
              />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-medium text-gray-500 mb-1">Tiêu đề</label>
              <input
                :value="item.title"
                @input="update(i, 'title', ($event.target as HTMLInputElement).value)"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Sự kiện quan trọng"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Mô tả</label>
            <textarea
              :value="item.content"
              @input="update(i, 'content', ($event.target as HTMLTextAreaElement).value)"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Mô tả sự kiện..."
            />
          </div>
        </div>

        <button
          @click="remove(i)"
          class="mt-1 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
      Thêm mốc lịch sử
    </button>
  </div>
</template>