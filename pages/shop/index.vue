<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useProduct } from "../../composables/useProduct";
import { useCategory } from "../../composables/useCategories";
import type { Product } from "../../@type/product";
import ShopHero from "@/components/shop/ShopHero.vue";
import ShopSidebar from "@/components/shop/ShopSidebar.vue";
import ShopToolbar from "@/components/shop/ShopToolbar.vue";
import ProductCard from "@/components/shop/ProductCard.vue";
import ShopPagination from "@/components/shop/ShopPagination.vue";
import { useAuth } from "@/composables/useAuth";
import { useCart } from "@/composables/useCart";
import { useNotification } from "@/composables/useNotification";

const sortBy = ref("featured");
const searchQuery = ref("");
const priceRange = ref({ min: "", max: "" });

const products = ref<Product[]>([]);
const selectedCategory = ref<string | null>(null);
const searchKeyword = ref("");

const { getProducts } = useProduct();
const { isAuthenticated } = useAuth();
const { addToCart } = useCart();
const { showNotification } = useNotification();
const { categories, getAll } = useCategory();

const IMAGE_BASE_URL = "http://localhost:8081/uploads/products";
const addingToCartId = ref<number | null>(null);

const handleQuickAddToCart = async (product: Product) => {
  if (!isAuthenticated.value) {
    navigateTo("/auth/login");
    return;
  }
  if (typeof product.id !== "number") {
    console.error("Invalid product id", product.id);
    return;
  }

  addingToCartId.value = product.id;
  try {
    await addToCart(product.id, 1);
    showNotification(
      "Thành công",
      `Đã thêm ${product.name} vào giỏ hàng!`,
      "success"
    );
  } catch (error) {
    console.error("Failed to add to cart:", error);
    showNotification("Lỗi", "Có lỗi xảy ra khi thêm vào giỏ hàng.", "error");
  } finally {
    addingToCartId.value = null;
  }
};

const handleApplyPrice = () => {
  console.log("Applying price filter:", priceRange.value);
};

onMounted(async () => {
  try {
    await getAll();
    products.value = await getProducts();
  } catch (err) {
    console.error("Lỗi load dữ liệu:", err);
  }
});

const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    // filter theo category
    const matchCategory =
      selectedCategory.value === null ||
      p.category_id === selectedCategory.value;
    const matchKeyword = p.name
      .toLowerCase()
      .includes(searchKeyword.value.toLowerCase());

    return matchCategory && matchKeyword;
  });
});
</script>

<template>
  <div class="min-h-screen bg-glow-bg font-sans text-gray-900">
    <ShopHero title="Bộ Sưu Tập" />

    <div class="container mx-auto px-4 pb-24">
      <div class="flex flex-col lg:flex-row gap-12">
        <ShopSidebar
          v-model:selectedCategory="selectedCategory"
          v-model:priceRange="priceRange"
          v-model:searchQuery="searchQuery"
          :categories="categories"
          @applyPrice="handleApplyPrice"
          @update:selectedCategory="(catId) => (selectedCategory = catId)"
          @update:searchQuery="(query) => (searchKeyword = query)"
        />

        <main class="flex-1">
          <ShopToolbar :count="products.length" v-model:sortBy="sortBy" />

          <div
            class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12"
          >
            <ProductCard
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              :addingToCartId="addingToCartId"
              :imageBaseUrl="IMAGE_BASE_URL"
              @quickAdd="handleQuickAddToCart"
            />
          </div>

          <ShopPagination
            :currentPage="1"
            :totalPages="3"
            @update:currentPage="
              (page) => console.log('Page changed to:', page)
            "
          />
        </main>
      </div>
    </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap");
</style>
