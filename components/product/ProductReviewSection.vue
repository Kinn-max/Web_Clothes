<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Star, User, CheckCircle2, Eye, EyeOff, Upload, X } from "lucide-vue-next";
import type { Review, ReviewRequest } from "@/@type/product";
import { useAuth } from "@/composables/useAuth";
import { useReview } from "@/composables/useReview";
import { useNotification } from "@/composables/useNotification";

interface Props {
  reviews?: Review[];
}

const props = withDefaults(defineProps<Props>(), {
  reviews: () => [],
});

const route = useRoute();
const { user, token } = useAuth();
const { createReview, getProductReviews, checkUserPurchased } = useReview();
const { showNotification } = useNotification();

const productId = computed(() => route.params.id as string);

const reviews = ref<Review[]>(props.reviews || []);
const currentPage = ref(1);
const pageSize = ref(5);
const totalReviews = ref(0);
const isLoadingReviews = ref(false);
const isSubmitting = ref(false);
const hasPurchased = ref(false);
const filterRating = ref<string>("");

const showReviewForm = computed(() => !!user.value);

const newReview = ref<ReviewRequest>({
  rating: 5,
  comment: "",
  is_anonymous: false,
  media_urls: [],
});

const selectedFiles = ref<File[]>([]);
const mediaPreviews = ref<string[]>([]);

// Load reviews from API (only if not provided as props)
const loadReviews = async () => {
  // If reviews are provided as props, use them instead of loading from API
  if (props.reviews && props.reviews.length > 0) {
    reviews.value = props.reviews;
    totalReviews.value = props.reviews.length;
    return;
  }

  if (!productId.value) return;

  isLoadingReviews.value = true;
  try {
    const response = await getProductReviews(
      productId.value,
      currentPage.value,
      pageSize.value
    );
    reviews.value = (response as any)?.data || [];
    totalReviews.value = (response as any)?.total || 0;
  } catch (error) {
    showNotification({
      type: "error",
      message: "Không thể tải đánh giá",
    });
  } finally {
    isLoadingReviews.value = false;
  }
};

// Check if user has purchased
const checkPurchase = async () => {
  if (!user.value || !productId.value) return;

  try {
    hasPurchased.value = await checkUserPurchased(productId.value);
  } catch (error) {
    console.error("Error checking purchase:", error);
  }
};

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  files.forEach((file) => {
    // Check file type and size
    const validTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      showNotification({
        type: "error",
        message: "Chỉ hỗ trợ ảnh (JPEG, PNG, GIF) và video (MP4)",
      });
      return;
    }

    if (file.size > maxSize) {
      showNotification({
        type: "error",
        message: "Kích thước file không vượt quá 10MB",
      });
      return;
    }

    if (selectedFiles.value.length < 5) {
      selectedFiles.value.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        mediaPreviews.value.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      showNotification({
        type: "error",
        message: "Tối đa 5 file",
      });
    }
  });

  // Reset input
  target.value = "";
};

// Remove media
const removeMedia = (index: number) => {
  selectedFiles.value.splice(index, 1);
  mediaPreviews.value.splice(index, 1);
};

// Submit review
const handleSubmitReview = async () => {
  if (!user.value) {
    showNotification({
      type: "error",
      message: "Vui lòng đăng nhập để gửi đánh giá",
    });
    return;
  }

  if (!newReview.value.comment.trim()) {
    showNotification({
      type: "error",
      message: "Vui lòng nhập nội dung đánh giá",
    });
    return;
  }

  if (newReview.value.rating < 1) {
    showNotification({
      type: "error",
      message: "Vui lòng chọn số sao",
    });
    return;
  }

  isSubmitting.value = true;
  try {
    // Create review without file upload for now
    const reviewData = {
      rating: newReview.value.rating,
      comment: newReview.value.comment,
      is_anonymous: newReview.value.is_anonymous,
      media_urls: [],
    };

    const result: any = await createReview(productId.value, reviewData);

    showNotification({
      type: "success",
      message: "Cảm ơn bạn đã đánh giá",
    });

    // Add new review to list immediately if it has data
    if (result?.data) {
      reviews.value.unshift(result.data);
      totalReviews.value++;
    }

    // Reset form
    newReview.value = {
      rating: 5,
      comment: "",
      is_anonymous: false,
      media_urls: [],
    };
    selectedFiles.value = [];
    mediaPreviews.value = [];

    // Reload reviews only if not added immediately
    if (!result?.data) {
      currentPage.value = 1;
      await loadReviews();
    }
  } catch (error: any) {
    console.error("Catch error in ProductReviewSection:", error);
    // Extract error message - could be Error object or string
    const errorMsg = error?.message || error?.data?.message || String(error) || "Không thể gửi đánh giá";
    showNotification({
      type: "error",
      message: errorMsg,
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Calculate average rating
const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0;
  const sum = reviews.value.reduce((acc: number, review: Review) => acc + review.rating, 0);
  return (sum / reviews.value.length).toFixed(1);
});

// Count reviews by rating
const ratingCounts = computed(() => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.value.forEach((review: Review) => {
    counts[review.rating as keyof typeof counts]++;
  });
  return counts;
});

// Filter reviews by rating
const filteredReviews = computed(() => {
  if (!filterRating.value) return reviews.value;
  return reviews.value.filter(
    (review: Review) => review.rating === parseInt(filterRating.value)
  );
});

const totalPages = computed(() =>
  Math.ceil(totalReviews.value / pageSize.value)
);

onMounted(async () => {
  await loadReviews();
  await checkPurchase();
});
</script>

<template>
  <div class="mb-20">
    <h2 class="font-serif text-3xl text-gray-900 mb-8 text-center lg:text-left">
      Đánh Giá
    </h2>

    <!-- Review Summary -->
    <div
      class="bg-gradient-to-br from-pink-50 via-white to-pink-50/50 border border-pink-100 rounded-3xl p-8 mb-8 shadow-sm"
    >
      <div class="flex flex-col md:flex-row items-center gap-8">
        <div class="text-center min-w-[140px]">
          <div class="text-6xl font-bold text-glow-primary-600 mb-2">
            {{ averageRating }}
          </div>
          <div class="flex justify-center text-yellow-400 mb-2">
            <Star
              v-for="n in 5"
              :key="n"
              class="w-4 h-4 fill-current"
              :class="{ 'text-yellow-400': n <= Math.round(parseFloat(String(averageRating))) }"
            />
          </div>
          <div class="text-sm text-gray-500 font-medium">
            {{ totalReviews }} đánh giá
          </div>
        </div>

        <div class="flex flex-wrap gap-2 justify-center md:justify-start">
          <button
            @click="currentPage = 1"
            class="px-5 py-2.5 bg-glow-primary-600 text-white rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            Tất cả
          </button>
          <button
            v-for="star in [5, 4, 3, 2, 1]"
            :key="star"
            @click="filterRating = String(star); currentPage = 1"
            :class="[
              'px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1 transition-all',
              filterRating === String(star)
                ? 'bg-glow-primary-600 text-white'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-glow-primary-400 hover:text-glow-primary-600'
            ]"
          >
            <span v-for="n in 5" :key="n" class="text-lg">
              <span v-if="n <= star" :class="filterRating === String(star) ? 'text-yellow-300' : 'text-yellow-400'">★</span>
              <span v-else :class="filterRating === String(star) ? 'text-gray-400' : 'text-gray-300'">★</span>
            </span>
            <span>({{ ratingCounts[star as keyof typeof ratingCounts] }})</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Login Notice -->
    <div v-if="!showReviewForm" class="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-8">
      <p class="text-blue-800">
        <strong>Vui lòng đăng nhập</strong> để viết đánh giá sản phẩm
      </p>
    </div>

    <!-- Review Form -->
    <div
      v-if="showReviewForm"
      class="bg-white border border-gray-200 rounded-3xl p-6 mb-8 shadow-sm"
    >
      <div class="flex items-center gap-2 mb-4 font-semibold text-gray-900">
        <User class="w-5 h-5 text-gray-600" />
        <span>Viết đánh giá của bạn</span>
      </div>

      <!-- Rating -->
      <div class="mb-4">
        <label class="text-sm font-medium text-gray-700 mb-2 block"
          >Đánh giá</label
        >
        <div class="flex gap-2">
          <Star
            v-for="n in 5"
            :key="n"
            @click="newReview.rating = n"
            :class="[
              'w-7 h-7 cursor-pointer transition-all',
              n <= newReview.rating
                ? 'text-yellow-400 fill-current scale-110'
                : 'text-gray-300 hover:text-yellow-200',
            ]"
          />
        </div>
      </div>

      <!-- Comment -->
      <div class="mb-4">
        <label class="text-sm font-medium text-gray-700 mb-2 block"
          >Nội dung đánh giá</label
        >
        <textarea
          v-model="newReview.comment"
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
          class="w-full h-28 p-4 border-2 border-gray-200 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-glow-primary-200 focus:border-glow-primary-400 transition-all text-gray-700"
        ></textarea>
      </div>

      <!-- Media Upload -->
      <div class="mb-4">
        <label class="text-sm font-medium text-gray-700 mb-2 block"
          >Thêm ảnh/video <span class="text-gray-500">(Tối đa 5 file)</span></label
        >
        <div
          class="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-glow-primary-400 hover:bg-pink-50 transition-all"
        >
          <input
            type="file"
            multiple
            accept="image/*,video/mp4"
            @change="handleFileSelect"
            class="hidden"
            id="media-upload"
          />
          <label
            for="media-upload"
            class="flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload class="w-5 h-5 text-gray-400" />
            <span class="text-gray-600">
              Chọn ảnh hoặc video
            </span>
          </label>
        </div>

        <!-- Media Previews -->
        <div v-if="mediaPreviews.length > 0" class="mt-4 grid grid-cols-3 gap-3">
          <div
            v-for="(preview, index) in mediaPreviews"
            :key="index"
            class="relative bg-gray-100 rounded-lg overflow-hidden"
          >
            <img
              v-if="selectedFiles[index].type.startsWith('image')"
              :src="preview"
              alt="preview"
              class="w-full h-24 object-cover"
            />
            <video
              v-else
              :src="preview"
              class="w-full h-24 object-cover"
            ></video>
            <button
              @click="removeMedia(index)"
              type="button"
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Anonymous Toggle -->
      <div class="mb-6 flex items-center gap-3">
        <input
          type="checkbox"
          v-model="newReview.is_anonymous"
          id="anonymous"
          class="w-4 h-4 rounded border-gray-300"
        />
        <label for="anonymous" class="text-sm text-gray-700">
          Ẩn danh (không hiển thị tên của bạn)
        </label>
      </div>

      <!-- Purchase Badge -->
      <div v-if="hasPurchased" class="mb-6 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg w-fit">
        <CheckCircle2 class="w-4 h-4" />
        <span>Bạn đã mua sản phẩm này</span>
      </div>

      <!-- Submit Button -->
      <button
        @click="handleSubmitReview"
        :disabled="isSubmitting"
        class="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-glow-primary-600 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? "Đang gửi..." : "Gửi đánh giá" }}
      </button>
    </div>

    <!-- Review List -->
    <div v-if="!isLoadingReviews" class="space-y-6">
      <div
        v-for="review in filteredReviews"
        :key="review.id"
        class="flex gap-4 pb-6 border-b border-gray-100 last:border-0"
      >
        <!-- Avatar -->
        <div
          class="w-12 h-12 rounded-full bg-gradient-to-br from-glow-primary-100 to-purple-100 flex items-center justify-center font-bold text-glow-primary-700 flex-shrink-0 text-lg"
        >
          {{
            review.is_anonymous
              ? "A"
              : (review.username || review.full_name || "U").charAt(0).toUpperCase()
          }}
        </div>

        <div class="flex-1">
          <!-- User Info -->
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="font-semibold text-gray-900">
              {{
                review.is_anonymous
                  ? "Người dùng ẩn danh"
                  : review.username || review.full_name || "Người dùng"
              }}
            </span>
            <span
              v-if="review.has_purchased"
              class="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              Đã mua hàng
            </span>
            <span
              v-else
              class="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full font-medium"
            >
              Chưa mua hàng
            </span>
          </div>

          <!-- Rating Stars -->
          <div class="flex text-yellow-400 mb-2">
            <Star
              v-for="n in 5"
              :key="n"
              :class="[
                'w-3.5 h-3.5',
                n <= review.rating
                  ? 'fill-current'
                  : 'text-gray-300 fill-current',
              ]"
            />
          </div>

          <!-- Date -->
          <div class="text-xs text-gray-500 mb-3 font-medium">
            {{ new Date(review.created_at || '').toLocaleDateString('vi-VN') }}
          </div>

          <!-- Comment -->
          <p class="text-gray-700 leading-relaxed mb-3">{{ review.comment }}</p>

          <!-- Media Gallery -->
          <div
            v-if="review.media_urls && review.media_urls.length > 0"
            class="grid grid-cols-4 gap-2 mt-3"
          >
            <div
              v-for="(mediaUrl, index) in review.media_urls"
              :key="index"
              class="bg-gray-100 rounded-lg overflow-hidden"
            >
              <img
                v-if="mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i)"
                :src="mediaUrl"
                :alt="`review-media-${index}`"
                class="w-full h-20 object-cover cursor-pointer hover:opacity-80"
              />
              <video
                v-else
                :src="mediaUrl"
                class="w-full h-20 object-cover cursor-pointer hover:opacity-80"
              ></video>
            </div>
          </div>
        </div>
      </div>

      <!-- No Reviews -->
      <div
        v-if="filteredReviews.length === 0"
        class="text-center py-12 text-gray-500"
      >
        <p class="text-lg">Chưa có đánh giá nào</p>
        <p class="text-sm">Hãy là người đầu tiên đánh giá sản phẩm này</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">Đang tải đánh giá...</p>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="text-center mt-10 flex items-center justify-center gap-4"
    >
      <button
        @click="currentPage = Math.max(1, currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-glow-primary-400"
      >
        Trước
      </button>

      <div class="flex gap-2">
        <button
          v-for="page in Math.min(5, totalPages)"
          :key="page"
          @click="currentPage = page"
          :class="[
            'px-3 py-2 rounded-lg font-medium',
            currentPage === page
              ? 'bg-glow-primary-600 text-white'
              : 'border border-gray-200 hover:border-glow-primary-400',
          ]"
        >
          {{ page }}
        </button>
      </div>

      <button
        @click="currentPage = Math.min(totalPages, currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-glow-primary-400"
      >
        Sau
      </button>
    </div>

    <!-- Load More Button -->
    <div v-else-if="totalReviews > reviews.length" class="text-center mt-10">
      <button
        @click="currentPage++"
        class="px-8 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all shadow-sm hover:shadow-md active:scale-95"
      >
        Xem thêm đánh giá
      </button>
    </div>
  </div>
</template>
<style scoped>
/* Review component styles */
</style>
