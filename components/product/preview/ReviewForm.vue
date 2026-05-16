<script setup lang="ts">
import { ref } from 'vue'
import { Star, User, CheckCircle2, Upload, X } from 'lucide-vue-next'
import type { ReviewCreate } from '@/types/review'
import { uploadToCloudinary } from '@/utils/cloudinary'


const props = defineProps<{
  firestoreProductId: string
  hasPurchased: boolean
}>()

const emit = defineEmits<{ submitted: [] }>()

const authStore = useAuthStore()
const { showNotification } = useNotification()
const { useCreateReview } = useReview()
const { mutate: submitReview, isPending: isSubmitting } = useCreateReview()

const form = ref({ rating: 5, comment: '', is_anonymous: false })
const selectedFiles = ref<File[]>([])
const mediaPreviews = ref<string[]>([])
const isUploading = ref(false)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
  const maxSize = 10 * 1024 * 1024

  files.forEach((file) => {
    if (!validTypes.includes(file.type)) {
      showNotification('Lỗi', 'Chỉ hỗ trợ ảnh (JPEG, PNG, GIF) và video (MP4)', 'error')
      return
    }
    if (file.size > maxSize) {
      showNotification('Lỗi', 'Kích thước file không vượt quá 10MB', 'error')
      return
    }
    if (selectedFiles.value.length >= 5) {
      showNotification('Lỗi', 'Tối đa 5 file', 'error')
      return
    }
    selectedFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = (e) => { mediaPreviews.value.push(e.target?.result as string) }
    reader.readAsDataURL(file)
  })
  target.value = ''
}

const removeMedia = (index: number) => {
  selectedFiles.value.splice(index, 1)
  mediaPreviews.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (!authStore.userId) {
    showNotification('Lỗi', 'Vui lòng đăng nhập để gửi đánh giá', 'error')
    return
  }
  if (!form.value.comment.trim()) {
    showNotification('Lỗi', 'Vui lòng nhập nội dung đánh giá', 'error')
    return
  }
  if (form.value.rating < 1) {
    showNotification('Lỗi', 'Vui lòng chọn số sao', 'error')
    return
  }

  const neonId = authStore.neonId
  if (!neonId) {
    showNotification('Lỗi', 'Không xác định được tài khoản, vui lòng đăng nhập lại', 'error')
    return
  }

  // Upload ảnh lên Cloudinary nếu có
  let mediaUrls: string[] = []
  if (selectedFiles.value.length > 0) {
  isUploading.value = true
  try {
    console.log('[upload] files:', selectedFiles.value.map(f => f.name))
    const results = await Promise.all(
      selectedFiles.value.map(file => uploadToCloudinary(file))
    )
    console.log('[upload] results:', results)
    mediaUrls = results.filter(r => r?.url).map(r => r!.url)
    console.log('[upload] mediaUrls:', mediaUrls)
  } catch (e) {
    console.error('[upload] error:', e)
    showNotification('Lỗi', 'Không thể tải ảnh lên, vui lòng thử lại', 'error')
    isUploading.value = false
    return
  } finally {
    isUploading.value = false
  }
}

console.log('[submit] payload media_urls:', mediaUrls)

  const payload: ReviewCreate = {
    user_id:              neonId,
    firestore_product_id: props.firestoreProductId,
    rating:               form.value.rating,
    comment:              form.value.comment,
    media_urls:           mediaUrls.length > 0 ? mediaUrls : undefined,
  }

  submitReview(payload, {
    onSuccess: () => {
      showNotification('Thành công', 'Cảm ơn bạn đã đánh giá', 'success')
      form.value = { rating: 5, comment: '', is_anonymous: false }
      selectedFiles.value = []
      mediaPreviews.value = []
      emit('submitted')
    },
    onError: (err: any) => {
      showNotification('Lỗi', err?.message || 'Không thể gửi đánh giá', 'error')
    },
  })
}

const loading = computed(() => isSubmitting.value || isUploading.value)
const loadingText = computed(() => isUploading.value ? 'Đang tải ảnh...' : 'Đang gửi...')
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
    <div class="flex items-center gap-2 mb-3 font-semibold text-gray-900 text-sm">
      <User class="w-4 h-4 text-gray-600" />
      <span>Viết đánh giá của bạn</span>
    </div>

    <!-- Rating -->
    <div class="mb-3">
      <div class="flex gap-1.5">
        <Star
          v-for="n in 5" :key="n"
          @click="form.rating = n"
          class="w-6 h-6 cursor-pointer transition-all"
          :class="n <= form.rating
            ? 'text-yellow-400 fill-current scale-110'
            : 'text-gray-300 hover:text-yellow-200'"
        />
      </div>
    </div>

    <!-- Comment -->
    <div class="mb-3">
      <label class="text-xs font-medium text-gray-700 mb-1.5 block">Nội dung đánh giá</label>
      <textarea
        v-model="form.comment"
        placeholder="Chia sẻ cảm nhận của bạn..."
        class="w-full h-16 p-3 border-2 border-gray-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-glow-primary-200 focus:border-glow-primary-400 transition-all text-gray-700 text-sm"
      />
    </div>

    <!-- Media Upload -->
    <div class="mb-3">
      <label class="text-xs font-medium text-gray-700 mb-1.5 block">
        Thêm ảnh/video <span class="text-gray-400">(Tối đa 5 file)</span>
      </label>
      <div class="border-2 border-dashed border-gray-200 rounded-xl p-2.5 text-center hover:border-glow-primary-400 hover:bg-pink-50 transition-all">
        <input type="file" multiple accept="image/*,video/mp4"
          @change="handleFileSelect" class="hidden" id="media-upload" />
        <label for="media-upload" class="flex items-center justify-center gap-2 cursor-pointer">
          <Upload class="w-4 h-4 text-gray-400" />
          <span class="text-gray-500 text-xs">Chọn ảnh hoặc video</span>
        </label>
      </div>

      <div v-if="mediaPreviews.length > 0" class="mt-2 grid grid-cols-5 gap-2">
        <div v-for="(preview, index) in mediaPreviews" :key="index"
          class="relative bg-gray-100 rounded-lg overflow-hidden">
          <img v-if="selectedFiles[index]?.type.startsWith('image')"
            :src="preview" alt="preview" class="w-full h-14 object-cover" />
          <video v-else :src="preview" class="w-full h-14 object-cover" />
          <button @click="removeMedia(index)" type="button"
            class="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
            <X class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="flex items-center justify-between gap-3">
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" v-model="form.is_anonymous"
          class="w-3.5 h-3.5 rounded border-gray-300" />
        <span class="text-xs text-gray-600">Ẩn danh</span>
      </label>

      <div v-if="hasPurchased"
        class="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
        <CheckCircle2 class="w-3.5 h-3.5" />
        <span>Đã mua hàng</span>
      </div>

      <button
        @click="handleSubmit"
        :disabled="loading"
        class="px-4 py-2 bg-gray-900 text-white rounded-xl font-semibold text-xs hover:bg-glow-primary-600 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        <div v-if="loading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        {{ loading ? loadingText : 'Gửi đánh giá' }}
      </button>
    </div>
  </div>
</template>