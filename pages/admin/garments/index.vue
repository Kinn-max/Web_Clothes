<script setup lang="ts">
import { garmentApi, garmentCategoryApi } from '@/utils/api'
import type { Garment } from '@/types/garment'
import type { GarmentCategory } from '@/types/category'
import GarmentTable from '@/components/admin/garment/GarmentTable.vue'
import GarmentFormModal from '@/components/admin/garment/GarmentFormModal.vue'
import GarmentDetailModal from '@/components/admin/garment/GarmentDetailModal.vue'
import CategoryManager from '@/components/admin/garment/CategoryManager.vue'

definePageMeta({ layout: 'admin' })

const { showNotification } = useNotification()

const garments = ref<Garment[]>([])
const categories = ref<GarmentCategory[]>([])
const loading = ref(false)

const showFormModal = ref(false)
const showDetailModal = ref(false)
const showCategoryManager = ref(false)
const selectedGarment = ref<Garment | null>(null)

const searchQuery = ref('')
const filterCategory = ref<number | null>(null)

const filteredGarments = computed(() => {
  let list = garments.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(g => g.name.toLowerCase().includes(q))
  }
  if (filterCategory.value !== null) {
    list = list.filter(g => g.category_id === filterCategory.value)
  }
  return list
})

const loadGarments = async () => {
  loading.value = true
  try {
    garments.value = await garmentApi.getAll()
  } catch {
    showNotification('Lỗi', 'Không thể tải danh sách trang phục', 'error')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    categories.value = await garmentCategoryApi.getAll()
  } catch {}
}

const handleCreate = () => {
  selectedGarment.value = null
  showFormModal.value = true
}

const handleEdit = (garment: Garment) => {
  selectedGarment.value = garment
  showFormModal.value = true
}

const handleDelete = async (id: number) => {
  if (!confirm('Bạn có chắc muốn xóa trang phục này?')) return
  try {
    await garmentApi.delete(id)
    showNotification('Thành công', 'Đã xóa trang phục', 'success')
    await loadGarments()
  } catch {
    showNotification('Lỗi', 'Không thể xóa trang phục', 'error')
  }
}

const handleViewDetail = (garment: Garment) => {
  selectedGarment.value = garment
  showDetailModal.value = true
}

const handleLens = (id: number) => {
  const garment = garments.value.find(g => g.id === id)
  if (garment) {
    selectedGarment.value = garment
    showDetailModal.value = true
  }
}

const handleSaved = async () => {
  showFormModal.value = false
  await loadGarments()
}

onMounted(() => {
  Promise.all([loadGarments(), loadCategories()])
})
</script>

<template>
  <div class="p-8 bg-slate-50 min-h-screen">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Quản lý Trang phục</h1>
        <p class="text-slate-500 text-sm mt-0.5">Quản lý các garment 3D và ảnh thử đồ ảo</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="showCategoryManager = true"
          class="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-medium text-sm hover:border-slate-300 hover:bg-white transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Quản lý Categories
        </button>
        <button
          @click="handleCreate"
          class="px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-colors flex items-center gap-2 shadow-sm shadow-violet-200"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm Garment
        </button>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
      <div class="relative flex-1 min-w-48">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm tên trang phục..."
          class="w-full h-10 pl-9 pr-4 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-violet-400 transition-colors"
        />
      </div>
      <select
        v-model="filterCategory"
        class="h-10 px-3 rounded-xl border-2 border-slate-200 text-sm outline-none focus:border-violet-400 transition-colors bg-white min-w-40"
      >
        <option :value="null">Tất cả categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <button
        v-if="searchQuery || filterCategory !== null"
        @click="searchQuery = ''; filterCategory = null"
        class="h-10 px-4 rounded-xl text-sm text-slate-500 hover:text-slate-700 border-2 border-slate-200 hover:border-slate-300 transition-colors"
      >
        Xóa lọc
      </button>
      <div class="ml-auto text-sm text-slate-400">
        {{ filteredGarments.length }} trang phục
      </div>
    </div>

    <!-- Table -->
    <GarmentTable
      :garments="filteredGarments"
      :loading="loading"
      :categories="categories"
      @view="handleViewDetail"
      @edit="handleEdit"
      @delete="handleDelete"
      @lens="handleLens"
    />

    <!-- Modals -->
    <GarmentFormModal
      :show="showFormModal"
      :garment="selectedGarment"
      :categories="categories"
      @close="showFormModal = false"
      @saved="handleSaved"
    />

    <GarmentDetailModal
      :show="showDetailModal"
      :garment="selectedGarment"
      @close="showDetailModal = false"
    />

    <CategoryManager
      :show="showCategoryManager"
      @close="showCategoryManager = false"
      @updated="loadCategories"
    />
  </div>
</template>
