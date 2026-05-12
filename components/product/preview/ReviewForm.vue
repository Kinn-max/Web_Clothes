<script setup lang="ts">
import { Star, User, CheckCircle2, Upload, X } from 'lucide-vue-next'
import type { ReviewCreate } from '@/types/review'

const props = defineProps<{
  firestoreProductId: string
  hasPurchased: boolean
}>()

const emit = defineEmits<{
  submitted: []
}>()

const authStore = useAuthStore()
const { showNotification } = useNotification()
const { useCreateReview } = useReview()
const { mutate: submitReview, isPending: isSubmitting } = useCreateReview()

const form = ref({
  rating: 5,
  comment: '',
  is_anonymous: false,
})

const selectedFiles = ref<File[]>([])
const mediaPreviews = ref<string[]>([])

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files  = Array.from(target.files || [])
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
  const maxSize    = 10 * 1024 * 1024

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

const handleSubmit = () => {
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

  const payload: ReviewCreate = {
    user_id:              Number(authStore.userId),
    firestore_product_id: props.firestoreProductId,
    rating:               form.value.rating,
    comment:              form.value.comment,
  }

  submitReview(payload, {
    onSuccess: () => {
      showNotification('Thành công', 'Cảm ơn bạn đã đánh giá', 'success')
      form.value     = { rating: 5, comment: '', is_anonymous: false }
      selectedFiles.value  = []
      mediaPreviews.value  = []
      emit('submitted')
    },
    onError: (err: any) => {
      showNotification('Lỗi', err?.message || 'Không thể gửi đánh giá', 'error')
    },
  })
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-3xl p-6 mb-8 shadow-sm">
    <div class="flex items-center gap-2 mb-4 font-semibold text-gray-900">
      <User class="w-5 h-5 text-gray-600" />
      <span>Viết đánh giá của bạn</span>
    </div>

    <!-- Rating -->
    <div class="mb-4">
      <label class="text-sm font-medium text-gray-700 mb-2 block">Đánh giá</label>
      <div class="flex gap-2">
        <Star
          v-for="n in 5" :key="n"
          @click="form.rating = n"
          class="w-7 h-7 cursor-pointer transition-all"
          :class="n <= form.rating
            ? 'text-yellow-400 fill-current scale-110'
            : 'text-gray-300 hover:text-yellow-200'"
        />
      </div>
    </div>

    <!-- Comment -->
    <div class="mb-4">
      <label class="text-sm font-medium text-gray-700 mb-2 block">Nội dung đánh giá</label>
      <textarea
        v-model="form.comment"
        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
        class="w-full h-28 p-4 border-2 border-gray-200 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-glow-primary-200 focus:border-glow-primary-400 transition-all text-gray-700"
      />
    </div>

    <!-- Media Upload -->
    <div class="mb-4">
      <label class="text-sm font-medium text-gray-700 mb-2 block">
        Thêm ảnh/video <span class="text-gray-500">(Tối đa 5 file)</span>
      </label>
      <div class="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-glow-primary-400 hover:bg-pink-50 transition-all">
        <input type="file" multiple accept="image/*,video/mp4"
          @change="handleFileSelect" class="hidden" id="media-upload" />
        <label for="media-upload" class="flex items-center justify-center gap-2 cursor-pointer">
          <Upload class="w-5 h-5 text-gray-400" />
          <span class="text-gray-600">Chọn ảnh hoặc video</span>
        </label>
      </div>

      <div v-if="mediaPreviews.length > 0" class="mt-4 grid grid-cols-3 gap-3">
        <div v-for="(preview, index) in mediaPreviews" :key="index"
          class="relative bg-gray-100 rounded-lg overflow-hidden">
          <img v-if="selectedFiles[index].type.startsWith('image')"
            :src="preview" alt="preview" class="w-full h-24 object-cover" />
          <video v-else :src="preview" class="w-full h-24 object-cover" />
          <button @click="removeMedia(index)" type="button"
            class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Anonymous -->
    <label class="mb-6 flex items-center gap-3 cursor-pointer select-none">
      <input type="checkbox" v-model="form.is_anonymous" id="anonymous"
        class="w-4 h-4 rounded border-gray-300" />
      <span class="text-sm text-gray-700">Ẩn danh (không hiển thị tên của bạn)</span>
    </label>

    <!-- Purchase Badge -->
    <div v-if="hasPurchased"
      class="mb-6 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg w-fit">
      <CheckCircle2 class="w-4 h-4" />
      <span>Bạn đã mua sản phẩm này</span>
    </div>

    <!-- Submit -->
    <button @click="handleSubmit" :disabled="isSubmitting"
      class="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-glow-primary-600 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
      {{ isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá' }}
    </button>
  </div>
</template>