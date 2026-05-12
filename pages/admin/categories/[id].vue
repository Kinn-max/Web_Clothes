<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCategory } from "../../../composables/useCategories";
import { useProduct } from "../../../composables/useProduct";
import { useNotification } from "../../../composables/useNotification";
import type { Category } from "../../../composables/useCategories";
import type { Product } from "../../../types/product";

definePageMeta({ layout: "admin" });

const route = useRoute();
const categoryId = route.params.id as string;

const category = ref<Category | null>(null);
const products = ref<Product[]>([]);
const unassignedProducts = ref<Product[]>([]);
const selectedIds = ref<string[]>([]);
const isInitialLoading = ref(true);
const showModal = ref(false);
const submitting = ref(false);

const { showNotification } = useNotification();
const { category: categoryState, getById } = useCategory();
const { getProductsByCat, getProducts, updateProduct } = useProduct();

const getUnassignedProducts = async (): Promise<Product[]> => {
  const all = await getProducts();
  return all.filter((p: Product) => !p.category_id);
};

const assignProducts = async (catId: string, productIds: string[]) => {
  await Promise.all(
    productIds.map((pid) => updateProduct(pid, { category_id: catId }, [], []))
  );
};

const removeProductFromCat = async (productId: string) => {
  await updateProduct(productId, { category_id: "" }, [], []);
};

const parseImages = (images: any): string[] => {
  if (Array.isArray(images)) return images;
  if (typeof images === "string" && images) {
    try { return JSON.parse(images); }
    catch { return [images]; }
  }
  return [];
};

const getCatImageUrl = (img?: string) =>
  img || "/images/placeholder-category.png";

const getProdImageUrl = (imgName?: string) =>
  imgName || "/images/placeholder-product.png";

const loadPageData = async () => {
  try {
    isInitialLoading.value = true;
    await getById(categoryId);
    category.value = categoryState.value;
    const res = await getProductsByCat(categoryId);
    products.value = res.map((p: any) => ({ ...p, images: parseImages(p.images) }));
  } catch (err) {
    console.error("Lỗi tải dữ liệu:", err);
  } finally {
    isInitialLoading.value = false;
  }
};

const openModal = async () => {
  showModal.value = true;
  const res = await getUnassignedProducts();
  unassignedProducts.value = res.map((p: any) => ({ ...p, images: parseImages(p.images) }));
};

const handleAssign = async () => {
  if (selectedIds.value.length === 0) return;
  submitting.value = true;
  try {
    await assignProducts(categoryId, selectedIds.value);
    await loadPageData();
    showModal.value = false;
    selectedIds.value = [];
  } finally {
    submitting.value = false;
  }
};

const handleRemove = async (productId: string) => {
  if (!confirm("Gỡ sản phẩm khỏi danh mục?")) return;
  try {
    await removeProductFromCat(productId);
    products.value = products.value.filter((p) => p.id !== productId);
    showNotification("Thành công", "Đã gỡ sản phẩm khỏi danh mục.", "success");
  } catch {
    showNotification("Lỗi", "Lỗi khi gỡ sản phẩm.", "error");
  }
};

onMounted(loadPageData);
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-5 py-10">
    <!-- Loading -->
    <div v-if="isInitialLoading" class="flex flex-col items-center justify-center h-screen gap-4">
      <div class="w-12 h-12 rounded-full border-b-2 border-blue-600 animate-spin" />
      <p class="text-slate-500 font-medium">Đang tải dữ liệu...</p>
    </div>

    <div v-else class="max-w-5xl mx-auto">
      <!-- Breadcrumb -->
      <nav class="mb-4">
        <NuxtLink to="/admin/categories" class="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
          </svg>
          Danh sách danh mục
        </NuxtLink>
      </nav>

      <!-- Category header -->
      <div class="bg-white rounded-3xl border shadow-sm p-8 flex items-center gap-8">
        <div class="w-28 h-28 rounded-2xl overflow-hidden border-4 border-slate-100 flex-shrink-0">
          <img :src="getCatImageUrl(category?.image)" class="w-full h-full object-cover" alt="category" />
        </div>
        <div class="flex-1">
          <p class="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Danh mục sản phẩm</p>
          <h1 class="text-3xl font-extrabold text-slate-900">{{ category?.name }}</h1>
          <p class="text-slate-500 mt-2 max-w-2xl">
            {{ category?.description || "Chưa có mô tả cho danh mục này." }}
          </p>
        </div>
        <button
          @click="openModal"
          class="flex-shrink-0 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
          + Thêm sản phẩm
        </button>
      </div>

      <!-- Product list -->
      <section class="mt-8">
        <h2 class="text-xl font-bold text-slate-800 mb-4">
          Sản phẩm trong nhóm ({{ products.length }})
        </h2>

        <div class="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <th class="p-4">Sản phẩm</th>
                <th class="p-4">Thương hiệu</th>
                <th class="p-4">Giá tiền</th>
                <th class="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="p in products" :key="p.id" class="hover:bg-slate-50 transition">
                <td class="p-4">
                  <div class="flex items-center gap-4">
                    <img :src="getProdImageUrl(p.images[0])" class="w-12 h-12 rounded-lg object-cover border" />
                    <span class="font-semibold text-slate-700">{{ p.name }}</span>
                  </div>
                </td>
                <td class="p-4 text-slate-600">{{ p.brand }}</td>
                <td class="p-4 font-bold text-blue-600">
                  {{ new Intl.NumberFormat("vi-VN").format(p.price) }}₫
                </td>
                <td class="p-4 text-right">
                  <!-- ✅ Fix: p.id as string, bỏ Number() -->
                  <button
                    @click="handleRemove(p.id as string)"
                    class="text-red-500 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    Gỡ bỏ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty state -->
          <div v-if="products.length === 0" class="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="text-blue-400 mb-3">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
            </svg>
            <p class="text-gray-500">Danh mục này hiện chưa có sản phẩm.</p>
          </div>
        </div>
      </section>
    </div>

    <!-- Modal -->
    <Transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50"
        @click.self="showModal = false"
      >
        <div class="bg-white w-[500px] rounded-3xl overflow-hidden shadow-2xl">
          <!-- Modal header -->
          <div class="px-6 py-5 border-b bg-slate-50 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-800">Chọn sản phẩm gán vào danh mục</h3>
            <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
          </div>

          <!-- Modal body -->
          <div class="p-4 max-h-[450px] overflow-y-auto">
            <div v-if="unassignedProducts.length === 0" class="text-center py-8 text-slate-400">
              Hết sản phẩm trống trong kho.
            </div>
            <div v-for="p in unassignedProducts" :key="p.id">
              <label class="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition">
                <input type="checkbox" :value="p.id" v-model="selectedIds" class="w-5 h-5 accent-blue-600" />
                <img :src="getProdImageUrl(p.images[0])" class="w-12 h-12 rounded object-cover border" />
                <div class="flex-1">
                  <div class="font-bold text-slate-700">{{ p.name }}</div>
                  <div class="text-xs text-slate-500">{{ p.brand }} — {{ p.price.toLocaleString() }}₫</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="px-6 py-5 border-t bg-slate-50 flex gap-3">
            <button
              @click="handleAssign"
              :disabled="submitting || selectedIds.length === 0"
              class="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {{ submitting ? "Đang xử lý..." : `Xác nhận gán (${selectedIds.length})` }}
            </button>
            <button
              @click="showModal = false"
              class="px-6 py-3 border font-bold rounded-xl hover:bg-white transition"
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>