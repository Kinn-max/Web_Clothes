<!-- components/admin/about/AboutHeroTab.vue -->
<script setup lang="ts">
import type { HeroContent } from '@/types/about'

const props = defineProps<{ modelValue: HeroContent }>()
const emit  = defineEmits<{ 'update:modelValue': [value: HeroContent] }>()

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
    <h2 class="text-base font-semibold text-gray-800">Phần Hero</h2>

    <!-- Tiêu đề -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
      <input
        :value="form.title"
        @input="emit('update:modelValue', { ...form, title: ($event.target as HTMLInputElement).value })"
        type="text"
        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="GlowUp — Nâng tầm vẻ đẹp..."
      />
    </div>

    <!-- Mô tả phụ -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả phụ</label>
      <textarea
        :value="form.subtitle"
        @input="emit('update:modelValue', { ...form, subtitle: ($event.target as HTMLTextAreaElement).value })"
        rows="3"
        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        placeholder="Chúng tôi cung cấp..."
      />
    </div>

    <!-- URL ảnh -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">URL ảnh nền</label>
      <input
        :value="form.image"
        @input="emit('update:modelValue', { ...form, image: ($event.target as HTMLInputElement).value })"
        type="text"
        class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="https://..."
      />

      <!-- Preview -->
      <img
        v-if="form.image"
        :src="form.image"
        alt="preview"
        class="mt-3 w-full h-40 object-cover rounded-lg border border-gray-200"
      />
    </div>
  </div>
</template>