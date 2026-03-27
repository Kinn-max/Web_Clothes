<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCategory } from "@/composables/useCategories";
import { useProduct } from "@/composables/useProduct";
import type { Category } from "../../@type/category";
import type { Product } from "../../@type/product";

const route = useRoute();
const categoryId = route.params.id as string;
const config = useRuntimeConfig();

const category = ref<Category | null>(null);
const products = ref<Product[]>([]);
const loading = ref(true);

const { category: categoryState, getById } = useCategory();
const api = useProduct();

/* ===== Helpers ===== */
const parseImages = (images: any): string[] => {
  if (Array.isArray(images)) return images;
  if (typeof images === "string" && images) {
    try {
      return JSON.parse(images);
    } catch {
      return [images];
    }
  }
  return [];
};

const catImage = (img?: string) =>
  img || "/images/placeholder-category.png";
const productImage = (img?: string) =>
  img || "/images/placeholder-category.png";

const loadData = async () => {
  try {
    loading.value = true;
    await getById(categoryId);         
    // category.value = categoryState.value;
    const res = await api.getProductsByCat(categoryId); 
    products.value = res.map((p: any) => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : [],
    }));
  } finally {
    loading.value = false;
  }
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(loadData);
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-indigo-100">
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px]"
      ></div>
      <div
        class="absolute top-[40%] -left-[10%] w-[30%] h-[30%] rounded-full bg-blue-100/40 blur-[100px]"
      ></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-6 py-10">
      <nav class="flex items-center justify-between mb-12">
        <NuxtLink
          to="/home"
          class="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-all duration-300"
        >
          <div
            class="p-2 rounded-xl bg-white shadow-sm border border-slate-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </div>
          <span class="font-bold tracking-tight">Trở về</span>
        </NuxtLink>

        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span
            class="text-xs font-bold text-slate-400 uppercase tracking-widest"
            >Store Live</span
          >
        </div>
      </nav>

      <div v-if="loading" class="space-y-12 animate-pulse">
        <div class="h-64 bg-white rounded-[40px] border border-slate-200"></div>
        <div class="grid grid-cols-4 gap-8">
          <div
            v-for="i in 4"
            :key="i"
            class="h-80 bg-white rounded-3xl border border-slate-200"
          ></div>
        </div>
      </div>

      <div v-else class="space-y-16">
        <header class="relative group">
          <div
            class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[40px] blur-2xl opacity-[0.08] group-hover:opacity-[0.12] transition-opacity"
          ></div>
          <div
            class="relative flex flex-col md:flex-row gap-10 items-center bg-white/80 backdrop-blur-xl p-10 rounded-[40px] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
          >
            <div class="relative">
              <div
                class="absolute inset-0 bg-indigo-500 rounded-[32px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"
              ></div>
              <img
                :src="catImage(category?.image)"
                class="relative w-48 h-48 md:w-56 md:h-56 rounded-[32px] object-cover shadow-2xl border-4 border-white transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div class="flex-1 text-center md:text-left">
              <span
                class="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-extrabold uppercase tracking-[0.2em] mb-4 inline-block"
                >Collection</span
              >
              <h1
                class="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4"
              >
                {{ category?.name }}
              </h1>
              <p
                class="text-lg text-slate-500 max-w-2xl leading-relaxed font-medium"
              >
                {{
                  category?.description ||
                  "Khám phá bộ sưu tập độc bản và tinh tế dành riêng cho bạn."
                }}
              </p>

              <div
                class="mt-8 flex flex-wrap justify-center md:justify-start gap-4"
              >
                <div
                  class="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 cursor-default"
                >
                  {{ products.length }} Thiết kế
                </div>
                <button
                  class="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Chia sẻ
                </button>
              </div>
            </div>
          </div>
        </header>

        <div class="space-y-8">
          <div class="flex items-center justify-between">
            <h2 class="text-3xl font-black tracking-tighter text-slate-800">
              Sản phẩm nổi bật
            </h2>
            <div class="h-[2px] flex-1 mx-8 bg-slate-100 hidden sm:block"></div>
          </div>

          <div
            v-if="products.length === 0"
            class="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200"
          >
            <div
              class="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-12 h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800">
              Kho hàng đang cập nhật
            </h3>
            <p class="text-slate-500 mt-2">
              Vui lòng quay lại sau để đón nhận những siêu phẩm mới nhất.
            </p>
          </div>

          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
          >
            <NuxtLink
              v-for="(p, index) in products"
              :key="p.id"
              :to="`/shop/products/${p.id}`"
              class="group relative flex flex-col bg-white rounded-[32px] p-4 transition-all duration-500 hover:-translate-y-3 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(79,70,229,0.15)] border border-slate-100 hover:border-indigo-100"
            >
              <div
                class="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-slate-50 mb-6"
              >
                <img
                  :src="productImage(p.images[0])"
                  class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>

              <div class="px-2 pb-2">
                <p
                  class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1"
                >
                  {{ p.brand }}
                </p>
                <h3 class="text-lg font-extrabold text-slate-800 truncate">
                  {{ p.name }}
                </h3>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <footer
        v-if="!loading && products.length > 0"
        class="mt-32 pb-20 text-center"
      >
        <div
          class="inline-flex items-center gap-4 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm"
        >
          <span class="pl-4 text-sm font-bold text-slate-500"
            >Bạn đã xem hết bộ sưu tập này</span
          >
          <button
            @click="scrollToTop"
            class="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all"
          >
            Lên đầu trang
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Custom Cubic Bezier cho chuyển động mượt hơn */
.transition-all {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hiệu ứng mờ dần khi render */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-16 > * {
  animation: fadeInUp 0.8s ease backwards;
}

header {
  animation-delay: 0.1s;
}
.space-y-8 {
  animation-delay: 0.3s;
}
</style>
