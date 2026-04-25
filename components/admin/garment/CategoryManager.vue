<script setup lang="ts">
import { garmentCategoryApi } from '@/utils/api'
import type { GarmentCategory } from '@/types/category'

const props = defineProps<{ show: boolean }>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const { showNotification } = useNotification()

const categories = ref<GarmentCategory[]>([])
const loading = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ name: '', description: '' })

const isEditing = computed(() => editingId.value !== null)

const loadCategories = async () => {
  loading.value = true
  try {
    categories.value = await garmentCategoryApi.getAll()
  } catch {
    showNotification('Lỗi', 'Không thể tải categories', 'error')
  } finally {
    loading.value = false
  }
}

watch(() => props.show, (val) => {
  if (val) loadCategories()
})

const startEdit = (cat: GarmentCategory) => {
  editingId.value = cat.id
  form.name = cat.name
  form.description = cat.description ?? ''
}

const cancelEdit = () => {
  editingId.value = null
  form.name = ''
  form.description = ''
}

const handleSubmit = async () => {
  if (!form.name.trim()) {
    showNotification('Lỗi', 'Tên category không được để trống', 'error')
    return
  }
  submitting.value = true
  try {
    if (isEditing.value) {
      await garmentCategoryApi.update(editingId.value!, {
        name: form.name.trim(),
        description: form.description || undefined,
      })
      showNotification('Thành công', 'Đã cập nhật category', 'success')
    } else {
      await garmentCategoryApi.create({
        name: form.name.trim(),
        description: form.description || undefined,
      })
      showNotification('Thành công', 'Đã thêm category mới', 'success')
    }
    cancelEdit()
    await loadCategories()
    emit('updated')
  } catch {
    showNotification('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại', 'error')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Xóa category này?')) return
  try {
    await garmentCategoryApi.delete(id)
    showNotification('Thành công', 'Đã xóa category', 'success')
    await loadCategories()
    emit('updated')
  } catch {
    showNotification('Lỗi', 'Không thể xóa category', 'error')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <h2 class="text-lg font-bold text-slate-900">Quản lý Categories</h2>
            <button
              @click="emit('close')"
              class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <!-- Add/Edit Form -->
            <div class="bg-slate-50 rounded-2xl p-4 space-y-3">
              <h3 class="text-sm font-semibold text-slate-700">
                {{ isEditing ? 'Chỉnh sửa category' : 'Thêm category mới' }}
              </h3>
              <input
                v-model="form.name"
                type="text"
                placeholder="Tên category *"
                class="w-full h-10 px-3 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-violet-400 transition-colors bg-white"
              />
              <input
                v-model="form.description"
                type="text"
                placeholder="Mô tả (tùy chọn)"
                class="w-full h-10 px-3 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-violet-400 transition-colors bg-white"
              />
              <div class="flex gap-2">
                <button
                  v-if="isEditing"
                  @click="cancelEdit"
                  class="px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-medium hover:bg-white transition-colors"
                >
                  Hủy
                </button>
                <button
                  @click="handleSubmit"
                  :disabled="submitting"
                  class="flex-1 py-2 rounded-xl text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  :class="isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-violet-600 hover:bg-violet-700'"
                >
                  <div v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {{ submitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : '+ Thêm') }}
                </button>
              </div>
            </div>

            <!-- Category list -->
            <div v-if="loading" class="space-y-2 animate-pulse">
              <div v-for="n in 4" :key="n" class="h-14 bg-slate-100 rounded-xl" />
            </div>

            <div v-else-if="categories.length === 0" class="text-center py-8 text-slate-400 text-sm">
              Chưa có category nào
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                :class="editingId === cat.id ? 'bg-blue-50 border-blue-200' : 'bg-white'"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-800">{{ cat.name }}</p>
                  <p v-if="cat.description" class="text-xs text-slate-400 truncate">{{ cat.description }}</p>
                </div>
                <div class="flex gap-1 flex-shrink-0">
                  <button
                    @click="startEdit(cat)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="handleDelete(cat.id)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
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
