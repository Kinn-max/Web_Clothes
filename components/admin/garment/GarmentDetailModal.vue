<script setup lang="ts">
import { garmentApi } from '@/utils/api'
import type { Garment } from '@/types/garment'

const props = defineProps<{
  show: boolean
  garment: Garment | null
}>()

const emit = defineEmits<{
  close: []
}>()

const lensData = ref<{ lens_url: string; model_url: string; product_id: number } | null>(null)
const loadingLens = ref(false)
const lensError = ref('')

watch(() => props.show, (val) => {
  if (!val) {
    lensData.value = null
    lensError.value = ''
  }
})

const fetchLensLink = async () => {
  if (!props.garment) return
  loadingLens.value = true
  lensError.value = ''
  try {
    lensData.value = await garmentApi.getLensLink(props.garment.id)
  } catch {
    lensError.value = 'Không thể lấy lens link. Vui lòng thử lại.'
  } finally {
    loadingLens.value = false
  }
}

const copyText = async (text: string) => {
  await navigator.clipboard.writeText(text)
}

const openSnapchat = (url: string) => {
  window.open(url, '_blank', 'noopener')
}

const formatDate = (val: string) => {
  if (!val) return '—'
  return new Date(val).toLocaleString('vi-VN')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show && garment" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10 rounded-t-2xl">
            <h2 class="text-lg font-bold text-slate-900">Chi tiết trang phục</h2>
            <button
              @click="emit('close')"
              class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="px-6 py-5 space-y-5">
            <!-- Cloth image -->
            <div class="flex justify-center">
              <div class="w-40 h-40 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50">
                <img
                  v-if="garment.cloth_image_url"
                  :src="garment.cloth_image_url"
                  :alt="garment.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                  <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Info grid -->
            <div class="space-y-3 bg-slate-50 rounded-2xl p-4">
              <div class="flex justify-between items-start gap-4">
                <span class="text-sm text-slate-500 flex-shrink-0">Tên</span>
                <span class="text-sm font-semibold text-slate-800 text-right">{{ garment.name }}</span>
              </div>
              <div v-if="garment.color" class="flex justify-between items-center gap-4">
                <span class="text-sm text-slate-500">Màu</span>
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
                  {{ garment.color }}
                </span>
              </div>
              <div v-if="garment.description" class="flex justify-between items-start gap-4">
                <span class="text-sm text-slate-500 flex-shrink-0">Mô tả</span>
                <span class="text-sm text-slate-700 text-right">{{ garment.description }}</span>
              </div>
              <div v-if="garment.item_index !== undefined && garment.item_index !== null" class="flex justify-between items-center gap-4">
                <span class="text-sm text-slate-500">Item Index</span>
                <span class="text-sm font-mono text-slate-700">{{ garment.item_index }}</span>
              </div>
              <div v-if="garment.store_id" class="flex justify-between items-center gap-4">
                <span class="text-sm text-slate-500">Store ID</span>
                <code class="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{{ garment.store_id }}</code>
              </div>
              <div v-if="garment.firestore_product_id" class="flex justify-between items-center gap-4">
                <span class="text-sm text-slate-500 flex-shrink-0">Firebase ID</span>
                <div class="flex items-center gap-1.5">
                  <code class="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded max-w-[180px] truncate">
                    {{ garment.firestore_product_id }}
                  </code>
                  <button @click="copyText(garment.firestore_product_id!)" class="text-slate-400 hover:text-violet-600 transition-colors flex-shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center gap-4">
                <span class="text-sm text-slate-500">Tạo lúc</span>
                <span class="text-xs text-slate-600">{{ formatDate(garment.created_at) }}</span>
              </div>
            </div>

            <!-- Model URL -->
            <div v-if="garment.model_url" class="space-y-1">
              <p class="text-sm font-medium text-slate-700">Model 3D (.glb)</p>
              <div class="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                <a
                  :href="garment.model_url"
                  target="_blank"
                  rel="noopener"
                  class="text-xs text-violet-600 font-mono truncate hover:underline flex-1"
                >
                  {{ garment.model_url }}
                </a>
                <button @click="copyText(garment.model_url)" class="text-slate-400 hover:text-violet-600 transition-colors flex-shrink-0">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Snapchat Lens section -->
            <div class="border-t border-slate-100 pt-4">
              <p class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Snapchat Lens
              </p>

              <button
                v-if="!lensData"
                @click="fetchLensLink"
                :disabled="loadingLens"
                class="w-full h-10 rounded-xl border-2 border-amber-200 text-amber-700 font-medium text-sm hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <div v-if="loadingLens" class="w-4 h-4 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" />
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {{ loadingLens ? 'Đang lấy...' : 'Lấy Lens Link' }}
              </button>

              <p v-if="lensError" class="text-xs text-red-500 mt-2">{{ lensError }}</p>

              <div v-if="lensData" class="space-y-3 bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div class="space-y-1">
                  <p class="text-xs font-semibold text-amber-700 uppercase tracking-wide">Lens URL</p>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono text-slate-700 truncate flex-1">{{ lensData.lens_url }}</span>
                    <button @click="copyText(lensData.lens_url)" class="text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="copyText(lensData.lens_url)"
                    class="flex-1 h-9 rounded-lg border border-amber-300 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy URL
                  </button>
                  <button
                    @click="openSnapchat(lensData.lens_url)"
                    class="flex-1 h-9 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Mở Snapchat
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex justify-end rounded-b-2xl">
            <button
              @click="emit('close')"
              class="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
