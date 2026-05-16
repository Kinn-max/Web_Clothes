<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import ProductGallery from "@/components/product/ProductGallery.vue";
import ProductInfo from "@/components/product/ProductInfo.vue";
import GarmentSelector from "@/components/product/GarmentSelector.vue";
import SnapchatARButton from "@/components/product/SnapchatARButton.vue";
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
const { useAverageRating } = useReview();

const product         = ref<any>(null);
const relatedProducts = ref<any[]>([]);
const selectedImage   = ref("");
const quantity        = ref(1);
const loading         = ref(true);
const loadingRelated  = ref(true);
const addingToCart    = ref(false);
const garments        = ref<any[]>([]);
const loadingGarments = ref(false);
const selectedGarment = ref<any>(null);

const firestoreProductId = computed(() => route.params.id as string);

// Lấy stats từ API
const { data: statsData } = useAverageRating(firestoreProductId);
const avgRating    = computed(() => statsData.value?.avg_rating ?? 0);
const reviewsCount = computed(() => statsData.value?.total_reviews ?? 0);

const IMAGE_BASE_URL = "http://localhost:8081/uploads/products";

const handleSelectGarment = (garment: any) => {
  selectedGarment.value = garment;
};

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
        product_id:  product.value.id,
        name:        product.value.name,
        price:       product.value.price,
        brand:       product.value.brand,
        images:      product.value.images,
        gender:      product.value.gender,
        description: product.value.description,
      },
      quantity.value
    );
    showNotification("Thành công", "Đã thêm sản phẩm vào giỏ hàng!", "success");
  } catch (error) {
    showNotification("Lỗi", "Có lỗi xảy ra khi thêm vào giỏ hàng.", "error");
  } finally {
    addingToCart.value = false;
  }
};

const loadProductData = async () => {
  try {
    loading.value = true;
    const productData = await getProductById(route.params.id as string);
    product.value = productData;
  } catch (error) {
    showNotification("Lỗi", "Không thể tải thông tin sản phẩm", "error");
  } finally {
    loading.value = false;
  }
};

const loadGarments = async () => {
  loadingGarments.value = true;
  try {
    garments.value = await garmentApi.getByProductId(route.params.id as string);
  } catch {
    garments.value = [];
  } finally {
    loadingGarments.value = false;
  }
};

const loadRelatedProducts = async () => {
  try {
    loadingRelated.value = true;
    relatedProducts.value = await getRelatedProducts(route.params.id as string, 4);
  } catch {
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
    quantity.value      = 1;
    selectedImage.value = "";
    garments.value      = [];
    selectedGarment.value = null;
    await loadProductData();
    await loadRelatedProducts();
    await loadGarments();
  }
});
</script>

<template>
  <div class="min-h-screen bg-white pb-20">
    <div v-if="loading" class="container mx-auto px-4 py-32 flex items-center justify-center">
      <div class="w-12 h-12 border-4 border-gray-200 border-t-glow-primary-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="product" class="container mx-auto px-4 py-8 max-w-7xl">
      <nav class="flex items-center gap-2 text-sm mb-8 text-gray-500">
        <NuxtLink to="/home" class="hover:text-glow-primary-600 transition-colors">Trang chủ</NuxtLink>
        <span class="w-1 h-1 rounded-full bg-gray-300"></span>
        <NuxtLink to="/shop" class="hover:text-glow-primary-600 transition-colors">Cửa hàng</NuxtLink>
        <span class="w-1 h-1 rounded-full bg-gray-300"></span>
        <span class="text-gray-900 font-medium">{{ product.name }}</span>
      </nav>

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
            :reviewsCount="reviewsCount"
            :avgRating="avgRating"
            @addToCart="handleAddToCart"
            @toggleWishlist="() => {}"
          />

          <GarmentSelector
            v-if="garments.length > 0 || loadingGarments"
            :garments="garments"
            :loading="loadingGarments"
            :product-name="product?.name ?? ''"
            :firestore-product-id="(route.params.id as string)"
            class="mt-8"
            @selectGarment="handleSelectGarment"
          />

          <SnapchatARButton
            v-if="selectedGarment"
            :garment-id="selectedGarment.id"
            :garment-name="selectedGarment.name"
            class="mt-4"
          />

          <NuxtLink
            :to="`/photo-tryon?garment_id=${product.id}&product_name=${encodeURIComponent(product.name)}&product_id=${product.id}`"
            class="mt-4 flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-violet-200 bg-violet-50 text-violet-700 font-bold text-sm hover:bg-violet-100 hover:border-violet-300 transition-all"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Thử 3D Photo
          </NuxtLink>
        </div>
      </div>

      <ProductReviewSection />

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

    <div v-else class="container mx-auto px-4 py-32 text-center">
      <div class="text-6xl mb-4">😕</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
      <p class="text-gray-600 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <NuxtLink to="/shop" class="inline-block px-6 py-3 bg-glow-primary-600 text-white font-bold rounded-xl hover:bg-glow-primary-700 transition-colors">
        Quay lại cửa hàng
      </NuxtLink>
    </div>
  </div>
</template>