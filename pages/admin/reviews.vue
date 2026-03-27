<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900">Quản Lý Đánh Giá</h1>
        <p class="mt-2 text-gray-600">Xem và quản lý các đánh giá sản phẩm từ khách hàng</p>
      </div>

      <!-- Stats & Filter Buttons -->
      <div class="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg shadow p-8 mb-8">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-8">
          <!-- Summary Stats -->
          <div class="text-left">
            <div class="text-5xl font-bold text-pink-600 mb-2">{{ averageRating }}</div>
            <div class="flex gap-1 mb-2">
              <span v-for="n in 5" :key="n" class="text-2xl">
                <span v-if="n <= Math.round(parseFloat(averageRating))" class="text-yellow-400">★</span>
                <span v-else class="text-gray-300">★</span>
              </span>
            </div>
            <div class="text-sm text-gray-600">{{ totalReviews }} đánh giá</div>
          </div>

          <!-- Filter Buttons -->
          <div class="flex flex-wrap gap-3">
            <button
              @click="filterRating = ''; currentPage = 1"
              :class="[
                'px-4 py-2 rounded-full font-semibold text-sm transition-all',
                filterRating === ''
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-pink-500'
              ]"
            >
              Tất cả
            </button>
            <button
              v-for="star in [5, 4, 3, 2, 1]"
              :key="star"
              @click="filterRating = String(star); currentPage = 1"
              :class="[
                'px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2',
                filterRating === String(star)
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-pink-500'
              ]"
            >
              <span v-for="n in 5" :key="n" class="text-lg">
                <span v-if="n <= star" :class="filterRating === String(star) ? 'text-yellow-300' : 'text-yellow-400'">★</span>
                <span v-else :class="filterRating === String(star) ? 'text-gray-400' : 'text-gray-300'">★</span>
              </span>
              <span>({{ ratingCounts[star] || 0 }})</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Lọc theo số sao</label>
            <select v-model="filterRating" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Tất cả</option>
              <option value="5">5 Sao</option>
              <option value="4">4 Sao</option>
              <option value="3">3 Sao</option>
              <option value="2">2 Sao</option>
              <option value="1">1 Sao</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Tìm theo tên, sản phẩm..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="flex items-end">
            <button @click="resetFilters" class="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition">
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>

      <!-- Reviews Table -->
      <div v-else-if="filteredReviews.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-100 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Khách Hàng</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Sản Phẩm</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Rating</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Nội Dung</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Ngày</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Hành Động</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="review in filteredReviews" :key="review.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-900">
                <div class="font-medium">{{ review.is_anonymous ? 'Ẩn danh' : review.username }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ review.product_name || 'N/A' }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-1">
                  <span v-for="n in 5" :key="n" class="text-lg">
                    <span v-if="n <= review.rating" class="text-yellow-400">★</span>
                    <span v-else class="text-gray-300">★</span>
                  </span>
                  <span class="ml-2 text-sm font-medium">({{ review.rating }}/5)</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <div class="max-w-xs truncate">{{ review.comment }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(review.created_at) }}
              </td>
              <td class="px-6 py-4 text-sm space-x-2 flex">
                <button 
                  @click="viewReview(review)" 
                  class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-medium"
                >
                  Xem
                </button>
                <button 
                  @click="deleteReview(review.id)" 
                  class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-xs font-medium"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No Reviews -->
      <div v-else class="bg-white rounded-lg shadow p-12 text-center">
        <p class="text-gray-500 text-lg">Không có đánh giá nào</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
        >
          Trước
        </button>
        
        <div class="flex gap-1">
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition',
              currentPage === page 
                ? 'bg-blue-500 text-white' 
                : 'border border-gray-300 hover:border-gray-400'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
        >
          Sau
        </button>
      </div>

      <!-- Detail Modal -->
      <div v-if="selectedReview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold">Chi Tiết Đánh Giá</h2>
            <button @click="selectedReview = null" class="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Khách Hàng</label>
              <p class="text-gray-900">{{ selectedReview.is_anonymous ? 'Ẩn danh' : selectedReview.username }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sản Phẩm</label>
              <p class="text-gray-900">{{ selectedReview.product_name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Đánh Giá</label>
              <div class="flex items-center gap-1">
                <span v-for="n in 5" :key="n" class="text-2xl">
                  <span v-if="n <= selectedReview.rating" class="text-yellow-400">★</span>
                  <span v-else class="text-gray-300">★</span>
                </span>
                <span class="ml-2 font-medium">({{ selectedReview.rating }}/5)</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nội Dung</label>
              <p class="text-gray-700 whitespace-pre-wrap">{{ selectedReview.comment }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày Đánh Giá</label>
              <p class="text-gray-600">{{ formatDate(selectedReview.created_at) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
              <p class="text-gray-600">
                <span v-if="selectedReview.has_purchased" class="text-green-600 font-medium">✓ Đã mua hàng</span>
                <span v-else class="text-gray-600">Chưa mua hàng</span>
              </p>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button 
              @click="deleteReview(selectedReview.id)" 
              class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
            >
              Xóa Đánh Giá
            </button>
            <button 
              @click="selectedReview = null" 
              class="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useReview } from "@/composables/useReview";
import { useNotification } from "@/composables/useNotification";

definePageMeta({
  layout: 'admin',
});

const { getAllReviews, deleteReview: deleteReviewApi } = useReview();
const { showNotification } = useNotification();

const reviews = ref<any[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalReviews = ref(0);
const filterRating = ref("");
const searchQuery = ref("");
const selectedReview = ref<any>(null);

const totalPages = computed(() => Math.ceil(totalReviews.value / pageSize.value));

const ratingCounts = computed(() => {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.value.forEach((review) => {
    counts[review.rating]++;
  });
  return counts;
});

const averageRating = computed(() => {
  if (reviews.value.length === 0) return "0";
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.value.length).toFixed(1);
});

const filteredReviews = computed(() => {
  return reviews.value.filter((review) => {
    const matchesRating = !filterRating.value || review.rating === parseInt(filterRating.value);
    const matchesSearch =
      !searchQuery.value ||
      (review.username && review.username.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (review.product_name && review.product_name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (review.comment && review.comment.toLowerCase().includes(searchQuery.value.toLowerCase()));
    return matchesRating && matchesSearch;
  });
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const loadReviews = async () => {
  loading.value = true;
  try {
    const response = await getAllReviews(currentPage.value, pageSize.value);
    reviews.value = response.data || [];
    totalReviews.value = response.total || 0;
  } catch (error: any) {
    console.error("Error loading reviews:", error);
    const errorMsg = error?.message || error?.data?.message || String(error) || "Lỗi khi tải danh sách đánh giá";
    showNotification({
      type: "error",
      message: errorMsg,
    });
  } finally {
    loading.value = false;
  }
};

const deleteReview = async (id: number) => {
  if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

  try {
    await deleteReviewApi(id);
    showNotification({
      type: "success",
      message: "Đánh giá đã được xóa",
    });
    selectedReview.value = null;
    await loadReviews();
  } catch (error: any) {
    console.error("Error deleting review:", error);
    const errorMsg = error?.message || error?.data?.message || String(error) || "Lỗi khi xóa đánh giá";
    showNotification({
      type: "error",
      message: errorMsg,
    });
  }
};

const viewReview = (review: any) => {
  selectedReview.value = review;
};

const resetFilters = () => {
  filterRating.value = "";
  searchQuery.value = "";
};

onMounted(() => {
  loadReviews();
});
</script>
