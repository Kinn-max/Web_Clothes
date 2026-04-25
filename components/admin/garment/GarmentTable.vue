<script setup lang="ts">
import type { Garment } from '@/types/garment'
import type { GarmentCategory } from '@/types/category'

const props = defineProps<{
  garments: Garment[]
  loading: boolean
  categories: GarmentCategory[]
}>()

const emit = defineEmits<{
  view: [garment: Garment]
  edit: [garment: Garment]
  delete: [id: number]
  lens: [id: number]
}>()

const getCategoryName = (id?: number) => {
  if (!id) return '—'
  return props.categories.find(c => c.id === id)?.name ?? '—'
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50">
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ảnh</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tên</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Màu</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Firebase ID</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Index</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton -->
          <template v-if="loading">
            <tr v-for="n in 6" :key="n" class="border-b border-slate-50 animate-pulse">
              <td class="px-4 py-3"><div class="h-4 w-5 bg-slate-200 rounded" /></td>
              <td class="px-4 py-3"><div class="w-12 h-12 bg-slate-200 rounded-lg" /></td>
              <td class="px-4 py-3"><div class="h-4 w-40 bg-slate-200 rounded" /></td>
              <td class="px-4 py-3"><div class="h-5 w-16 bg-slate-200 rounded-full" /></td>
              <td class="px-4 py-3"><div class="h-4 w-24 bg-slate-200 rounded" /></td>
              <td class="px-4 py-3"><div class="h-4 w-28 bg-slate-200 rounded" /></td>
              <td class="px-4 py-3"><div class="h-4 w-8 bg-slate-200 rounded" /></td>
              <td class="px-4 py-3"><div class="h-8 w-32 bg-slate-200 rounded-lg ml-auto" /></td>
            </tr>
          </template>

          <!-- Empty -->
          <tr v-else-if="garments.length === 0">
            <td colspan="8" class="px-4 py-16 text-center">
              <div class="flex flex-col items-center gap-2 text-slate-400">
                <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span class="text-sm">Chưa có trang phục nào</span>
              </div>
            </td>
          </tr>

          <!-- Data rows -->
          <tr
            v-else
            v-for="(garment, idx) in garments"
            :key="garment.id"
            class="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
          >
            <td class="px-4 py-3 text-slate-400 text-xs font-mono">{{ idx + 1 }}</td>

            <td class="px-4 py-3">
              <img
                v-if="garment.cloth_image_url"
                :src="garment.cloth_image_url"
                :alt="garment.name"
                class="w-12 h-12 rounded-lg object-cover border border-slate-200"
              />
              <div v-else class="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <svg class="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </td>

            <td class="px-4 py-3 font-semibold text-slate-800 max-w-[160px] truncate">{{ garment.name }}</td>

            <td class="px-4 py-3">
              <span
                v-if="garment.color"
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100"
              >
                {{ garment.color }}
              </span>
              <span v-else class="text-slate-300 text-xs">—</span>
            </td>

            <td class="px-4 py-3 text-slate-600 text-xs">{{ getCategoryName(garment.category_id) }}</td>

            <td class="px-4 py-3">
              <div v-if="garment.firestore_product_id" class="flex items-center gap-1.5">
                <code class="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                  {{ garment.firestore_product_id.slice(0, 12) }}…
                </code>
                <button
                  @click="copyText(garment.firestore_product_id!)"
                  class="text-slate-300 hover:text-violet-600 transition-colors"
                  title="Copy Firebase ID"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <span v-else class="text-slate-300 text-xs">—</span>
            </td>

            <td class="px-4 py-3 text-slate-500 text-xs font-mono">{{ garment.item_index ?? '—' }}</td>

            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-0.5">
                <button
                  @click="emit('view', garment)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                  title="Chi tiết"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  @click="emit('edit', garment)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Sửa"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="emit('lens', garment.id)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="Snapchat Lens"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>
                <button
                  @click="emit('delete', garment.id)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Xóa"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
