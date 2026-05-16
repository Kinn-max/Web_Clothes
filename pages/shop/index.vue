<script setup lang="ts">
import { useProduct } from "../../composables/useProduct";
import { useCategory } from "../../composables/useCategories";
import type { Product } from "../../types/product";
import type { Category } from "@/types/category";
import ShopHero       from "@/components/shop/ShopHero.vue";
import ShopSidebar    from "@/components/shop/ShopSidebar.vue";
import ShopToolbar    from "@/components/shop/ShopToolbar.vue";
import ProductCard    from "@/components/shop/ProductCard.vue";
import ShopPagination from "@/components/shop/ShopPagination.vue";
import { useAuth }         from "@/composables/useAuth";
import { useCart }         from "@/composables/useCart";
import { useNotification } from "@/composables/useNotification";
import type { AddToCartPayload } from "@/types/cart";

const sortBy           = ref("featured");
const searchQuery      = ref("");
const priceRange       = ref({ min: "", max: "" });
const products         = ref<Product[]>([]);
const selectedCategory = ref<string | null>(null);
const searchKeyword    = ref("");

const { getProducts }        = useProduct();
const { isAuthenticated }    = useAuth();
const { addToCart }          = useCart();
const { showNotification }   = useNotification();
const { categories, getAll } = useCategory();

const validCategories = computed<Category[]>(() =>
  categories.value
    .filter((c): c is typeof c & { id: string } => !!c.id)
    .map(c => ({ ...c, id: c.id as string }))
)

// Product.id là string (Firestore), ProductCard lại expect number
const addingToCartProductId = ref<string | null>(null) // track string id nội bộ

// ProductCard expect number | null → truyền null khi không loading
const addingToCartId = computed<string | null>(() => null) 

const handleQuickAddToCart = async (product: Product) => {
  if (!isAuthenticated.value) {
    navigateTo("/auth/login");
    return;
  }

  addingToCartProductId.value = String(product.id ?? "");
  try {
    const payload: AddToCartPayload = {
      product_id:  String(product.id),
      name:        product.name,
      price:       product.price,
      brand:       product.brand,
      images:      Array.isArray(product.images)
                     ? product.images
                     : product.images ? [product.images] : [],
      gender:      product.gender,
      description: product.description,
    };
    await addToCart(payload, 1);
    showNotification("Thành công", `Đã thêm ${product.name} vào giỏ hàng!`, "success");
  } catch {
    showNotification("Lỗi", "Có lỗi xảy ra khi thêm vào giỏ hàng.", "error");
  } finally {
    addingToCartProductId.value = null;
  }
};

const handleApplyPrice = () => {};

onMounted(async () => {
  try {
    await getAll();
    products.value = await getProducts();
  } catch (err) {
    console.error("Lỗi load dữ liệu:", err);
  }
});

const filteredProducts = computed(() =>
  products.value.filter((p) => {
    const matchCategory =
      selectedCategory.value === null ||
      String(p.category_id) === selectedCategory.value;
    const matchKeyword = p.name
      .toLowerCase()
      .includes(searchKeyword.value.toLowerCase());
    return matchCategory && matchKeyword;
  })
);
</script>

<template>
  <div class="min-h-screen bg-glow-bg font-sans text-gray-900">
    <!-- <ShopHero title="Bộ Sưu Tập" /> -->

    <div class="container mx-auto px-4 pb-24">
      <div class="flex flex-col lg:flex-row gap-12">
        <ShopSidebar
          v-model:selectedCategory="selectedCategory"
          v-model:priceRange="priceRange"
          v-model:searchQuery="searchQuery"
          :categories="validCategories"
          @applyPrice="handleApplyPrice"
          @update:selectedCategory="(catId) => (selectedCategory = catId)"
          @update:searchQuery="(query) => (searchKeyword = query)"
        />

        <main class="flex-1">
          <ShopToolbar :count="filteredProducts.length" v-model:sortBy="sortBy" />

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <ProductCard
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              :addingToCartId="addingToCartId"
              imageBaseUrl=""
              @quickAdd="handleQuickAddToCart"
            />
          </div>

          <ShopPagination
            :currentPage="1"
            :totalPages="3"
            @update:currentPage="(page) => console.log('Page changed to:', page)"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap");
</style>