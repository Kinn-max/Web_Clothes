<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import ProductGallery from "@/components/product/ProductGallery.vue";
import ProductInfo from "@/components/product/ProductInfo.vue";
import GarmentSelector from "@/components/product/GarmentSelector.vue";
import ProductReviewSection from "@/components/product/ProductReviewSection.vue";
import RelatedProducts from "@/components/product/RelatedProducts.vue";
import { useNotification } from "@/composables/useNotification";
import { useAuth } from "@/composables/useAuth";
import { useCart } from "@/composables/useCart";
import { useProduct } from "@/composables/useProduct";
import { garmentApi } from "@/utils/api";

const route = useRoute();
const { isAuthenticated } = useAuth();
const { showNotification } = useNotification();
const { addToCart } = useCart();
const { getProductById, getRelatedProducts } = useProduct();

// State
const product = ref<any>(null);
const relatedProducts = ref<any[]>([]);
const reviews = ref<any[]>([]);
const selectedImage = ref("");
const quantity = ref(1);
const loading = ref(true);
const loadingRelated = ref(true);
const addingToCart = ref(false);
const garments = ref<any[]>([]);
const loadingGarments = ref(false);

const IMAGE_BASE_URL = "http://localhost:8081/uploads/products";


const mockReviews = [
  {
    id: 1,
    user: "Nguyễn Thùy Linh",
    rating: 5,
    date: "10/01/2026",
    content: "Sản phẩm dùng rất thích, mùi thơm nhẹ nhàng, giao hàng nhanh!",
    verify: true,
  },
  {
    id: 2,
    user: "Trần Minh",
    rating: 4,
    date: "08/01/2026",
    content: "Đóng gói cẩn thận, shop tư vấn nhiệt tình.",
    verify: true,
  },
  {
    id: 3,
    user: "Le Ha",
    rating: 5,
    date: "05/01/2026",
    content: "Chất lượng tuyệt vời so với giá tiền.",
    verify: false,
  },
];

const newReview = ref({
  user: "Khách hàng",
  rating: 5,
  content: "",
});


const handleAddToCart = async () => {
  if (!isAuthenticated.value) {
    navigateTo("/auth/login");
    return;
  }
  if (!product.value) return;
  
  addingToCart.value = true;
  try {
     await addToCart(
      {
        product_id: product.value.id,
        name: product.value.name,
        price: product.value.price,
        brand: product.value.brand,
        images: product.value.images,      
        gender: product.value.gender,
        description: product.value.description,
      },
      quantity.value
    );
    showNotification("Thành công", "Đã thêm sản phẩm vào giỏ hàng!", "success");
  } catch (error) {
    console.error("Failed to add to cart:", error);
    showNotification("Lỗi", "Có lỗi xảy ra khi thêm vào giỏ hàng.", "error");
  } finally {
    addingToCart.value = false;
  }
};

const handleSubmitReview = () => {
  console.log("Submitting review:", newReview.value);
  showNotification("Cảm ơn", "Đánh giá của bạn đã được ghi nhận!", "success");
};


const loadProductData = async () => {
  try {
    loading.value = true;
    
    // Load product details
    const orderId = route.params.id as string

    const productData = await getProductById(orderId);
    product.value = productData;
    
    // Set selected image
    // if (productData.images && productData.images.length > 0) {
    //   selectedImage.value = productData.images[0];
    // }
    
    // Set reviews
    reviews.value = mockReviews;
    
  } catch (error) {
    console.error("Error loading product:", error);
    showNotification("Lỗi", "Không thể tải thông tin sản phẩm", "error");
  } finally {
    loading.value = false;
  }
};

const loadGarments = async () => {
  const firestoreId = route.params.id as string;
  loadingGarments.value = true;
  try {
    garments.value = await garmentApi.getByProductId(firestoreId);
  } catch {
    garments.value = [];
  } finally {
    loadingGarments.value = false;
  }
};

const loadRelatedProducts = async () => {
  try {
    loadingRelated.value = true;
    const orderId = route.params.id as string

    // Lấy 4 sản phẩm liên quan
    const related = await getRelatedProducts(orderId, 4);
    relatedProducts.value = related;
    
  } catch (error) {
    console.error("Error loading related products:", error);

  } finally {
    loadingRelated.value = false;
  }
};


onMounted(async () => {
  await loadProductData();
  await loadRelatedProducts();
  await loadGarments();
});


watch(() => route.params.id, async (newId) => {
  if (newId) {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    quantity.value = 1;
    selectedImage.value = "";
    garments.value = [];

    await loadProductData();
    await loadRelatedProducts();
    await loadGarments();
  }
});
</script>

<template>
  <div class="min-h-screen bg-white pb-20">
    <!-- Loading -->
    <div v-if="loading" class="container mx-auto px-4 py-32 flex items-center justify-center">
      <div class="w-12 h-12 border-4 border-gray-200 border-t-glow-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Product Detail -->
    <div v-else-if="product" class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm mb-8 text-gray-500">
        <NuxtLink to="/home" class="hover:text-glow-primary-600 transition-colors">Trang chủ</NuxtLink>
        <span class="w-1 h-1 rounded-full bg-gray-300"></span>
        <NuxtLink to="/shop" class="hover:text-glow-primary-600 transition-colors">Cửa hàng</NuxtLink>
        <span class="w-1 h-1 rounded-full bg-gray-300"></span>
        <span class="text-gray-900 font-medium">{{ product.name }}</span>
      </nav>

      <!-- Product Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        <ProductGallery 
          :images="product.images || []"
          v-model:selectedImage="selectedImage"
          :imageBaseUrl="IMAGE_BASE_URL"
        />

        <div>
          <ProductInfo
            :product="product"
            v-model:quantity="quantity"
            :addingToCart="addingToCart"
            :reviewsCount="reviews.length"
            @addToCart="handleAddToCart"
            @toggleWishlist="() => {}"
          />

          <!-- AR Garment Section -->
          <GarmentSelector
            v-if="garments.length > 0 || loadingGarments"
            :garments="garments"
            :loading="loadingGarments"
            :product-name="product?.name ?? ''"
            :firestore-product-id="(route.params.id as string)"
            class="mt-8"
          />
        </div>
      </div>

      <!-- Reviews Section -->
      <ProductReviewSection 
        :reviews="reviews"
        :newReview="newReview"
        @submitReview="handleSubmitReview"
      />

      <!-- Related Products -->
      <div v-if="loadingRelated" class="mt-20">
        <h2 class="font-serif text-3xl text-gray-900 text-center mb-10">Sản Phẩm Tương Tự</h2>
        <div class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-gray-200 border-t-glow-primary-600 rounded-full animate-spin"></div>
        </div>
      </div>
      
      <RelatedProducts 
        v-else-if="relatedProducts.length > 0"
        :products="relatedProducts"
        :imageBaseUrl="IMAGE_BASE_URL"
      />
    </div>

    <!-- Error State -->
    <div v-else class="container mx-auto px-4 py-32 text-center">
      <div class="text-6xl mb-4">😕</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
      <p class="text-gray-600 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <NuxtLink 
        to="/shop"
        class="inline-block px-6 py-3 bg-glow-primary-600 text-white font-bold rounded-xl hover:bg-glow-primary-700 transition-colors"
      >
        Quay lại cửa hàng
      </NuxtLink>
    </div>
  </div>
</template>