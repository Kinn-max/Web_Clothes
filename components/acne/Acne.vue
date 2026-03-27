<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAcne } from '@/composables/useAcne'
import { productApi } from '@/composables/useProduct'

const hasAnalyzed = ref(false)
const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

/* ===== TYPES ===== */
interface SkincareRoutine {
  morning?: string[]
  evening?: string[]
}

interface AcneZone {
  zone: string
  severity: 'mild' | 'moderate' | 'severe'
  medical_causes?: string[]
  skincare_routine?: SkincareRoutine
}

/* ===== COMPOSABLES ===== */
const {
  advice,
  loading: acneLoading,
  error: acneError,
  detectAcne,
  reset,
} = useAcne()

const {
  getProducts,
  loading: productLoading,
  error: productError,
} = productApi()

/* ===== STATE ===== */
const products = ref<any[]>([])
const selectedFile = ref<File | null>(null)

/* ===== LIFECYCLE ===== */
onMounted(async () => {
  try {
    products.value = await getProducts()
  } catch (e) {
    console.error(e)
  }
})

/* ===== COMPUTED ===== */
const acneZones = computed<AcneZone[]>(() => {
  const zones = (advice.value || [])
    .filter((a: any) =>
      ['mild', 'moderate', 'severe'].includes(a.severity)
    )
    .map((a: any) => ({
      zone: a.region,
      severity: a.severity,
      medical_causes: a.medical_causes,
      skincare_routine: a.skincare_routine,
    }))
  
  // Lọc các vùng trùng lặp dựa trên tên vùng
  const seen = new Set<string>()
  return zones.filter(z => {
    if (seen.has(z.zone)) return false
    seen.add(z.zone)
    return true
  })
})

// Lọc sản phẩm duy nhất theo ID
const uniqueProducts = computed(() => {
  const seen = new Set()
  return products.value.filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
})

/* ===== HANDLERS ===== */
const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
    hasAnalyzed.value = false
    reset()
    
    // Tạo preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(files[0])
  }
}

const onAnalyze = async () => {
  if (!selectedFile.value) return
  hasAnalyzed.value = true
  await detectAcne(selectedFile.value)
}

const clearImage = () => {
  selectedFile.value = null
  imagePreview.value = null
  hasAnalyzed.value = false
  reset()
  
  // Reset file input để có thể chọn lại cùng file
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const addToCart = (product: any, event?: Event) => {
  // Ngăn chặn navigation khi click nút giỏ hàng
  if (event) {
    event.stopPropagation()
  }
  
  // Thêm sản phẩm vào giỏ hàng
  console.log('Thêm vào giỏ hàng:', product)
  // TODO: Implement cart logic here
  alert(`Đã thêm "${product.name}" vào giỏ hàng!`)
}

const goToProduct = (productId: number) => {
  // Navigate to product detail page
  window.location.href = `http://localhost:3000/shop/products/${productId}`
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-8 px-4">
    <div class="max-w-6xl mx-auto space-y-8">

      <!-- HEADER -->
      <div class="text-center space-y-2">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
          🔬 Phân Tích Da Mặt AI
        </h1>
        <p class="text-gray-600">Tải ảnh lên và nhận tư vấn chăm sóc da chuyên nghiệp</p>
      </div>

      <!-- UPLOAD SECTION -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 class="text-2xl font-semibold mb-6 flex items-center gap-2">
         
          <span>Tải ảnh da mặt</span>
        </h2>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Left: Upload area -->
          <div class="space-y-4">
            <div 
              v-if="!imagePreview"
              class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
              @click="fileInput?.click()"
            >
              <div class="space-y-3">
                <div class="text-6xl">📸</div>
                <p class="text-gray-600 font-medium">Nhấn để chọn ảnh</p>
                <p class="text-sm text-gray-400">Hỗ trợ: JPG, PNG, WEBP</p>
              </div>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"  
              @change="onFileChange"
              class="hidden"
            />

            <button
              v-if="!imagePreview"
              @click="fileInput?.click()"
              class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Chọn ảnh từ thiết bị
            </button>
          </div>

          <!-- Right: Preview -->
          <div v-if="imagePreview" class="space-y-4">
            <div class="relative rounded-xl overflow-hidden shadow-lg border-2 border-blue-200">
              <img 
                :src="imagePreview" 
                alt="Preview"
                class="w-full h-auto max-h-96 object-contain bg-gray-50"
              />
              <button
                @click="clearImage"
                class="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center"
                title="Xóa ảnh"
              >
                ✕
              </button>
            </div>

            <button
              @click="onAnalyze"
              :disabled="acneLoading"
              class="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="!acneLoading"> Phân tích ngay</span>
              <span v-else class="flex items-center gap-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang phân tích...
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div v-if="acneLoading || productLoading" class="text-center py-8">
        <div class="inline-flex items-center gap-3 bg-blue-50 px-6 py-4 rounded-full">
          <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-blue-700 font-medium">
            {{ acneLoading ? 'Đang phân tích ảnh...' : 'Đang tải sản phẩm...' }}
          </span>
        </div>
      </div>

      <!-- ERROR STATE -->
      <div v-if="acneError || productError" class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        ⚠️ {{ acneError || productError }}
      </div>

      <!-- NO ACNE DETECTED -->
      <div
        v-if="hasAnalyzed && !acneLoading && acneZones.length === 0"
        class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center space-y-4"
      >
        
        <h3 class="text-2xl font-semibold text-green-800 mb-2">Da khỏe mạnh!</h3>
        <p class="text-green-700">Không phát hiện vùng mụn nào. Hãy tiếp tục duy trì chế độ chăm sóc da hiện tại!</p>
        <button
          @click="clearImage"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg mt-4"
        >
          
          <span>Phân tích ảnh khác</span>
        </button>
      </div>

      <!-- ACNE ZONES -->
      <div v-if="acneZones.length > 0" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
           
            <span>Kết quả phân tích</span>
          </h2>
          <button
            @click="clearImage"
            class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
        
            <span>Phân tích ảnh khác</span>
          </button>
        </div>

        <div
          v-for="zone in acneZones"
          :key="zone.zone"
          class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6 pb-4 border-b">
            <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
              
              <span>{{ zone.zone }}</span>
            </h3>

            <span
              class="px-4 py-2 text-sm font-semibold rounded-full"
              :class="{
                'bg-red-100 text-red-700 ring-2 ring-red-200': zone.severity === 'severe',
                'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200': zone.severity === 'moderate',
                'bg-green-100 text-green-700 ring-2 ring-green-200': zone.severity === 'mild',
              }"
            >
              {{ zone.severity === 'severe' ? 'Nặng' : zone.severity === 'moderate' ? 'Trung bình' : 'Nhẹ' }}
            </span>
          </div>

          <!-- Nguyên nhân -->
          <div v-if="zone.medical_causes?.length" class="mb-6">
            <div class="flex items-center gap-2 mb-3">
              
              <p class="font-semibold text-gray-800">Nguyên nhân có thể:</p>
            </div>
            <ul class="space-y-2">
              <li 
                v-for="c in zone.medical_causes" 
                :key="c"
                class="flex items-start gap-2 text-gray-700 bg-blue-50 p-3 rounded-lg"
              >
                <span class="text-blue-600 mt-0.5">•</span>
                <span>{{ c }}</span>
              </li>
            </ul>
          </div>

          <!-- Routine -->
          <div v-if="zone.skincare_routine" class="mb-6">
            <div class="flex items-center gap-2 mb-3">
             
              <p class="font-semibold text-gray-800">Quy trình chăm sóc:</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="zone.skincare_routine.morning" class="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p class="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                 
                  <span>Buổi sáng</span>
                </p>
                <ul class="space-y-2">
                  <li
                    v-for="(m, idx) in zone.skincare_routine.morning"
                    :key="m"
                    class="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span class="font-semibold text-amber-600">{{ idx + 1 }}.</span>
                    <span>{{ m }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="zone.skincare_routine.evening" class="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <p class="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
          
                  <span>Buổi tối</span>
                </p>
                <ul class="space-y-2">
                  <li
                    v-for="(e, idx) in zone.skincare_routine.evening"
                    :key="e"
                    class="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span class="font-semibold text-indigo-600">{{ idx + 1 }}.</span>
                    <span>{{ e }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- SẢN PHẨM -->
          <div v-if="uniqueProducts.length">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xl">🛒</span>
              <p class="font-semibold text-gray-800">Sản phẩm gợi ý</p>
            </div>

            <div class="space-y-3">
              <div
                v-for="p in uniqueProducts"
                :key="p.id"
                class="group border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer bg-white flex items-center justify-between"
                @click="goToProduct(p.id)"
              >
                <div class="flex-1">
                  <p class="font-medium text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                    {{ p.name }}
                  </p>
                  <p class="text-lg font-bold text-red-600">
                    {{ p.price?.toLocaleString() }}đ
                  </p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>