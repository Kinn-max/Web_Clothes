<script setup lang="ts">
import { garmentApi } from '@/utils/api'
import type { Garment } from '@/types/garment'
import type { GarmentCategory } from '@/types/category'

const props = defineProps<{
  show: boolean
  garment: Garment | null
  categories: GarmentCategory[]
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { showNotification } = useNotification()

const isNew = computed(() => !props.garment)

const form = reactive({
  name: '',
  description: '',
  color: '',
  firestore_product_id: '',
  category_id: '' as string | number,
  store_id: '',
  item_index: '' as string | number,
})

const glbFile = ref<File | null>(null)
const glbFileName = ref('')
const clothImageFile = ref<File | null>(null)
const clothImagePreview = ref('')
const submitting = ref(false)
const glbInputRef = ref<HTMLInputElement | null>(null)
const clothInputRef = ref<HTMLInputElement | null>(null)

watch(() => props.show, (val) => {
  if (!val) return
  glbFile.value = null
  glbFileName.value = ''
  clothImageFile.value = null
  clothImagePreview.value = ''

  if (props.garment) {
    Object.assign(form, {
      name: props.garment.name ?? '',
      description: props.garment.description ?? '',
      color: props.garment.color ?? '',
      firestore_product_id: props.garment.firestore_product_id ?? '',
      category_id: props.garment.category_id ?? '',
      store_id: props.garment.store_id ?? '',
      item_index: props.garment.item_index ?? '',
    })
    clothImagePreview.value = props.garment.cloth_image_url ?? ''
  } else {
    Object.assign(form, {
      name: '', description: '', color: '',
      firestore_product_id: '', category_id: '', store_id: '', item_index: '',
    })
  }
})

const onGlbChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.name.endsWith('.glb')) {
    showNotification('Lỗi', 'File phải có định dạng .glb', 'error')
    ;(e.target as HTMLInputElement).value = ''
    return
  }
  glbFile.value = file
  glbFileName.value = file.name
}

const onClothChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  clothImageFile.value = file
  if (clothImagePreview.value && clothImagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(clothImagePreview.value)
  }
  clothImagePreview.value = URL.createObjectURL(file)
}

const validate = () => {
  if (!form.name.trim()) {
    showNotification('Lỗi', 'Tên trang phục không được để trống', 'error')
    return false
  }
  if (isNew.value && !glbFile.value) {
    showNotification('Lỗi', 'File 3D (.glb) là bắt buộc khi tạo mới', 'error')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validate()) return
  submitting.value = true

  try {
    const fd = new FormData()
    fd.append('name', form.name.trim())
    if (form.description) fd.append('description', form.description)
    if (form.color) fd.append('color', form.color)
    if (form.firestore_product_id) fd.append('firestore_product_id', form.firestore_product_id)
    if (form.category_id !== '') fd.append('category_id', String(form.category_id))
    if (form.store_id) fd.append('store_id', form.store_id)
    if (form.item_index !== '') fd.append('item_index', String(form.item_index))
    if (glbFile.value) fd.append('file', glbFile.value)
    if (clothImageFile.value) fd.append('cloth_image', clothImageFile.value)

    if (isNew.value) {
      await garmentApi.create(fd)
      showNotification('Thành công', 'Đã thêm trang phục mới', 'success')
    } else {
      await garmentApi.update(props.garment!.id, fd)
      showNotification('Thành công', 'Đã cập nhật trang phục', 'success')
    }
    emit('saved')
  } catch {
    showNotification('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại', 'error')
  } finally {
    submitting.value = false
  }
}

onUnmounted(() => {
  if (clothImagePreview.value && clothImagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(clothImagePreview.value)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />

        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10 rounded-t-2xl">
            <h2 class="text-lg font-bold text-slate-900">
              {{ isNew ? 'Thêm trang phục' : 'Cập nhật trang phục' }}
            </h2>
            <button
              @click="emit('close')"
              class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <div class="px-6 py-5 space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Tên trang phục <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Nhập tên trang phục"
                class="w-full h-10 px-3 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-violet-400 transition-colors"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
              <textarea
                v-model="form.description"
                rows="2"
                placeholder="Mô tả ngắn về trang phục"
                class="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-violet-400 transition-colors resize-none"
              />
            </div>

            <!-- Color + Firebase ID (2 cols) -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Màu sắc</label>
                <input
                  v-model="form.color"
                  type="text"
                  placeholder="vd: Xanh lam"
                  class="w-full h-10 px-3 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-violet-400 transition-colors"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Item Index</label>
                <input
                  v-model="form.item_index"
                  type="number"
                  placeholder="0"
                  class="w-full h-10 px-3 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-violet-400 transition-colors"
                />
              </div>
            </div>

            <!-- Firebase Product ID -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Firebase Product ID</label>
              <input
                v-model="form.firestore_product_id"
                type="text"
                placeholder="ID sản phẩm trên Firestore"
                class="w-full h-10 px-3 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-violet-400 transition-colors font-mono"
              />
            </div>

            <!-- Category + Store ID -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  v-model="form.category_id"
                  class="w-full h-10 px-3 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-violet-400 transition-colors bg-white"
                >
                  <option value="">Không có</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Store ID (UUID)</label>
                <input
                  v-model="form.store_id"
                  type="text"
                  placeholder="uuid..."
                  class="w-full h-10 px-3 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-violet-400 transition-colors font-mono"
                />
              </div>
            </div>

            <!-- GLB File -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                File 3D (.glb)
                <span v-if="isNew" class="text-red-500">*</span>
                <span v-else class="text-slate-400 font-normal ml-1">(giữ file cũ nếu không chọn)</span>
              </label>
              <div
                class="relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors"
                :class="glbFile ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-violet-300'"
                @click="glbInputRef?.click()"
              >
                <input ref="glbInputRef" type="file" accept=".glb" class="hidden" @change="onGlbChange" />
                <div v-if="glbFileName" class="flex items-center justify-center gap-2 text-violet-700">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="text-sm font-medium truncate max-w-xs">{{ glbFileName }}</span>
                </div>
                <div v-else class="text-sm text-slate-400">
                  <svg class="w-6 h-6 mx-auto mb-1 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Click để chọn file .glb
                </div>
              </div>
            </div>

            <!-- Cloth Image -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Ảnh trang phục
                <span class="text-slate-400 font-normal ml-1">(jpg/png/webp)</span>
              </label>
              <div class="flex gap-4 items-start">
                <div
                  class="flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors"
                  :class="clothImageFile ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-violet-300'"
                  @click="clothInputRef?.click()"
                >
                  <input ref="clothInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onClothChange" />
                  <div v-if="clothImageFile" class="text-sm text-violet-700 font-medium truncate">{{ clothImageFile.name }}</div>
                  <div v-else class="text-sm text-slate-400">Click để chọn ảnh</div>
                </div>
                <div v-if="clothImagePreview" class="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200">
                  <img :src="clothImagePreview" alt="Preview" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
            <button
              @click="emit('close')"
              :disabled="submitting"
              class="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              @click="handleSubmit"
              :disabled="submitting"
              class="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <div v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {{ submitting ? 'Đang lưu...' : 'Lưu' }}
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
