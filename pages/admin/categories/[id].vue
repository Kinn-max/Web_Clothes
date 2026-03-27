<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCategory } from "../../../composables/useCategories";
import { productApi } from "../../../composables/useProduct";
import { useNotification } from "../../../composables/useNotification";
import type { Category } from "../../../@type/category";
import type { Product } from "../../../@type/product";

definePageMeta({ layout: "admin" });

const route = useRoute();
const categoryId = Number(route.params.id);

const category = ref<Category | null>(null);
const products = ref<Product[]>([]);
const unassignedProducts = ref<Product[]>([]);
const selectedIds = ref<number[]>([]);
const isInitialLoading = ref(true);
const showModal = ref(false);
const submitting = ref(false);

const { showNotification } = useNotification();
const { category: categoryState, getById } = useCategory();
const api = productApi();

const parseImages = (images: any): string[] => {
  if (Array.isArray(images)) return images;
  if (typeof images === "string" && images) {
    try {
      return JSON.parse(images);
    } catch (e) {
      return [images];
    }
  }
  return [];
};

const getCatImageUrl = (img?: string) => {
  if (!img) return "/images/placeholder-category.png";
  return `http://localhost:8081/uploads/categories/${img}`;
};

const getProdImageUrl = (imgName?: string) => {
  if (!imgName) return "/images/placeholder-product.png";
  return `http://localhost:8081/uploads/products/${imgName}`;
};

const loadPageData = async () => {
  try {
    isInitialLoading.value = true;
    await getById(categoryId);
    category.value = categoryState.value;

    const res = await api.getProductsByCat(categoryId);
    products.value = res.map((p: any) => ({
      ...p,
      images: parseImages(p.images),
    }));
  } catch (err) {
    console.error("Lỗi tải dữ liệu:", err);
  } finally {
    isInitialLoading.value = false;
  }
};

const openModal = async () => {
  showModal.value = true;
  const res = await api.getUnassignedProducts();
  unassignedProducts.value = res.map((p: any) => ({
    ...p,
    images: parseImages(p.images),
  }));
};

const handleAssign = async () => {
  if (selectedIds.value.length === 0) return;
  submitting.value = true;
  try {
    await api.assignProducts(categoryId, selectedIds.value);
    await loadPageData();
    showModal.value = false;
    selectedIds.value = [];
  } finally {
    submitting.value = false;
  }
};

const handleRemove = async (productId: number) => {
  if (!confirm("Gỡ sản phẩm khỏi danh mục?")) return;
  try {
    await api.removeProductFromCat(categoryId, productId);
    products.value = products.value.filter((p) => p.id !== productId);
    showNotification("Thành công", "Đã gỡ sản phẩm khỏi danh mục.", "success");
  } catch (err) {
    showNotification("Lỗi", "Lỗi khi gỡ sản phẩm.", "error");
  }
};

onMounted(loadPageData);
</script>

<template>
  <div class="detail-page">
    <div class="container" v-if="!isInitialLoading">
      <nav class="mb-4">
        <NuxtLink
          to="/admin/categories"
          class="text-blue-600 font-medium hover:underline"
        >
          <div class="flex items-center gap-2 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>

            <span class="font-medium">Danh sách danh mục</span>
          </div>
        </NuxtLink>
      </nav>

      <header class="category-card shadow-sm border">
        <div class="flex items-center gap-8">
          <div class="image-box">
            <img
              :src="getCatImageUrl(category?.image)"
              class="cat-img"
              alt="category"
            />
          </div>
          <div class="flex-1">
            <div
              class="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1"
            >
              Danh mục sản phẩm
            </div>
            <h1 class="text-3xl font-extrabold text-slate-900">
              {{ category?.name }}
            </h1>
            <p class="text-slate-500 mt-2 max-w-2xl">
              {{ category?.description || "Chưa có mô tả cho danh mục này." }}
            </p>
          </div>
          <button class="btn-add" @click="openModal">
            <span> + Thêm sản phẩm</span>
          </button>
        </div>
      </header>

      <section class="mt-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-slate-800">
            Sản phẩm trong nhóm ({{ products.length }})
          </h2>
        </div>

        <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="bg-slate-50 text-slate-500 text-xs uppercase font-bold"
              >
                <th class="p-4">Sản phẩm</th>
                <th class="p-4">Thương hiệu</th>
                <th class="p-4">Giá tiền</th>
                <th class="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr
                v-for="p in products"
                :key="p.id"
                class="hover:bg-slate-50 transition"
              >
                <td class="p-4">
                  <div class="flex items-center gap-4">
                    <img
                      :src="getProdImageUrl(p.images[0])"
                      class="w-12 h-12 rounded-lg object-cover border"
                    />
                    <span class="font-semibold text-slate-700">{{
                      p.name
                    }}</span>
                  </div>
                </td>
                <td class="p-4 text-slate-600">{{ p.brand }}</td>
                <td class="p-4 font-bold text-blue-600">
                  {{ new Intl.NumberFormat("vi-VN").format(p.price) }}₫
                </td>
                <td class="p-4 text-right">
                  <button
                    @click="handleRemove(Number(p.id))"
                    class="btn-remove"
                  >
                    Gỡ bỏ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            v-if="products.length === 0"
            class="p-12 text-center text-slate-400"
          >
            <div
              class="flex flex-col items-center justify-center text-center py-10"
            >
              <div class="mb-3 text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-box"
                >
                  <path
                    d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
                  />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>

              <p class="text-gray-500 text-base">
                Danh mục này hiện chưa có sản phẩm.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="flex flex-col items-center justify-center h-screen">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
      <p class="mt-4 text-slate-500 font-medium">Đang tải dữ liệu...</p>
    </div>

    <Transition name="fade">
      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="showModal = false"
      >
        <div class="modal-box">
          <div
            class="p-6 border-b flex justify-between items-center bg-slate-50"
          >
            <h3 class="text-lg font-bold text-slate-800">
              Chọn sản phẩm gán vào danh mục
            </h3>
            <button
              @click="showModal = false"
              class="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div class="p-4 max-h-[450px] overflow-y-auto">
            <div
              v-if="unassignedProducts.length === 0"
              class="text-center py-8 text-slate-400"
            >
              Hết sản phẩm trống trong kho.
            </div>
            <div
              v-for="p in unassignedProducts"
              :key="p.id"
              class="prod-item-select"
            >
              <label
                class="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  :value="p.id"
                  v-model="selectedIds"
                  class="w-5 h-5 accent-blue-600"
                />
                <img
                  :src="getProdImageUrl(p.images[0])"
                  class="w-12 h-12 rounded object-cover border"
                />
                <div class="flex-1">
                  <div class="font-bold text-slate-700">{{ p.name }}</div>
                  <div class="text-xs text-slate-500">
                    {{ p.brand }} - {{ p.price.toLocaleString() }}₫
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="p-6 border-t bg-slate-50 flex gap-3">
            <button
              class="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              @click="handleAssign"
              :disabled="submitting || selectedIds.length === 0"
            >
              {{
                submitting
                  ? "Đang xử lý..."
                  : `Xác nhận gán (${selectedIds.length})`
              }}
            </button>
            <button
              class="px-6 py-3 border font-bold rounded-xl hover:bg-white"
              @click="showModal = false"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.detail-page {
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 40px 20px;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
}

.category-card {
  background: white;
  padding: 30px;
  border-radius: 24px;
}
.image-box {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  overflow: hidden;
  border: 4px solid #f1f5f9;
}
.cat-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-add {
  background: #0f172a;
  color: white;
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  transition: all 0.2s;
}
.btn-add:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-remove {
  color: #ef4444;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}
.btn-remove:hover {
  background: #fef2f2;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-box {
  background: white;
  width: 500px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
