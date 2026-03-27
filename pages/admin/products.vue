<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useProduct } from "@/composables/useProduct";
import { useCategory } from "@/composables/useCategories";

definePageMeta({ layout: "admin" });

const {
  products,
  loading,
  loadProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = useProduct();

const categoryApi = useCategory();
const { categories } = categoryApi;

const showModal = ref(false);
const submitting = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  name: "",
  brand: "",
  gender: "Unisex",
  price: 0,
  quantity: 0,
  description: "",
  category_id: "",
});

const selectedFiles = ref<File[]>([]);
const previewUrls = ref<string[]>([]);
const keepImages = ref<string[]>([]); // ảnh cũ giữ lại khi edit

const toast = ref<{ message: string; type: "success" | "error" } | null>(null);
const showToast = (message: string, type: "success" | "error") => {
  toast.value = { message, type };
  setTimeout(() => (toast.value = null), 3000);
};


const resetForm = () => {
  Object.assign(form, {
    name: "", brand: "", gender: "Unisex",
    price: 0, quantity: 0, description: "", category_id: "",
  });
  selectedFiles.value = [];
  previewUrls.value = [];
  keepImages.value = [];
};

const openModal = (product?: any) => {
  resetForm();
  if (product) {
    editingId.value = product.id;
    Object.assign(form, {
      name: product.name ?? "",
      brand: product.brand ?? "",
      gender: product.gender ?? "Unisex",
      price: product.price ?? 0,
      quantity: product.quantity ?? 0,
      description: product.description ?? "",
      category_id: product.category_id ?? "",
    });
    keepImages.value = Array.isArray(product.images) ? [...product.images] : [];
  } else {
    editingId.value = null;
  }
  showModal.value = true;
};

const handleFileChange = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  selectedFiles.value = files;
  previewUrls.value = files.map((f) => URL.createObjectURL(f));
};

const removeKeepImage = (idx: number) => {
  keepImages.value.splice(idx, 1);
};

const handleSubmit = async () => {
  if (!form.name || !form.price) {
    showToast("Vui lòng nhập tên và giá sản phẩm", "error");
    return;
  }
  if (!form.category_id) {
    showToast("Vui lòng chọn danh mục", "error");
    return;
  }

  submitting.value = true;
  const data = {
    name: form.name,
    brand: form.brand,
    gender: form.gender,
    price: Number(form.price),
    quantity: Number(form.quantity),
    description: form.description,
    category_id: form.category_id,
  };

  try {
    if (editingId.value) {
      await updateProduct(
        editingId.value,
        data,
        selectedFiles.value,
        keepImages.value
      );
      showToast("Cập nhật sản phẩm thành công", "success");
    } else {
      await createProduct(data, selectedFiles.value);
      showToast("Thêm sản phẩm thành công", "success");
    }
    showModal.value = false;
    await loadProducts();
  } catch (err) {
    console.error(err);
    showToast("Có lỗi xảy ra khi lưu", "error");
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id: string) => {
  if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
  try {
    await deleteProduct(id);
    showToast("Xóa sản phẩm thành công", "success");
    await loadProducts();
  } catch (err) {
    console.error(err);
    showToast("Lỗi khi xóa sản phẩm", "error");
  }
};

onMounted(() => {
  loadProducts();
  categoryApi.getAll();
});
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <!-- Header -->
      <div class="header">
        <div>
          <h1 class="title">Quản lý sản phẩm</h1>
          <p class="subtitle">Danh sách và quản lý kho hàng</p>
        </div>
        <button class="btn btn-primary" @click="openModal()">+ Thêm sản phẩm</button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Table -->
      <div v-else class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Kho</th>
              <th>Thương hiệu</th>
              <th>Giới tính</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, idx) in products" :key="p.id">
              <td>{{ idx + 1 }}</td>
              <td>
                <img
                  v-if="p.images && p.images.length"
                  :src="p.images[0]"
                  class="thumb"
                  alt="product"
                />
                <span v-else class="no-img">No Img</span>
              </td>
              <td>
                <div class="product-name">{{ p.name }}</div>
                <div class="product-desc">{{ p.description }}</div>
              </td>
              <td class="price">
                {{ new Intl.NumberFormat("vi-VN").format(p.price) }}₫
              </td>
              <td>
                <span :class="['badge', p.quantity > 0 ? 'badge-success' : 'badge-error']">
                  {{ p.quantity }}
                </span>
              </td>
              <td>{{ p.brand }}</td>
              <td>{{ p.gender }}</td>
              <td>
                <div class="action-btns">
                  <button class="btn-icon btn-edit" @click="openModal(p)" title="Sửa">✏️</button>
                  <button class="btn-icon btn-delete" @click="handleDelete(p.id)" title="Xóa">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!products.length" class="empty">Chưa có sản phẩm nào.</div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới" }}</h2>
          <button @click="showModal = false" class="close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="grid-2">
            <div class="form-group">
              <label>Tên sản phẩm <span class="req">*</span></label>
              <input v-model="form.name" type="text" class="input" placeholder="VD: Nước hoa Dior" />
            </div>
            <div class="form-group">
              <label>Thương hiệu</label>
              <input v-model="form.brand" type="text" class="input" placeholder="VD: Dior" />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Giá (VNĐ) <span class="req">*</span></label>
              <input v-model="form.price" type="number" class="input" min="0" />
            </div>
            <div class="form-group">
              <label>Số lượng kho</label>
              <input v-model="form.quantity" type="number" class="input" min="0" />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Giới tính</label>
              <select v-model="form.gender" class="input">
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
            <div class="form-group">
              <label>Danh mục <span class="req">*</span></label>
              <select v-model="form.category_id" class="input">
                <option value="">-- Chọn danh mục --</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>

          <!-- Upload ảnh -->
          <div class="form-group">
            <label>Hình ảnh</label>
            <input
              type="file"
              multiple
              accept="image/*"
              @change="handleFileChange"
              class="input file-input"
            />

            <!-- Preview ảnh mới -->
            <div v-if="previewUrls.length" class="img-preview-row">
              <img v-for="src in previewUrls" :key="src" :src="src" class="preview-img" />
            </div>

            <!-- Ảnh cũ khi edit -->
            <div v-else-if="keepImages.length" class="img-preview-row">
              <div
                v-for="(img, idx) in keepImages"
                :key="img"
                class="keep-img-wrap"
              >
                <img :src="img" class="preview-img" />
                <button class="remove-img-btn" @click="removeKeepImage(idx)" title="Xóa ảnh này">✕</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Mô tả</label>
            <textarea v-model="form.description" rows="3" class="input" placeholder="Thông tin sản phẩm..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Hủy</button>
          <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
            {{ submitting ? "Đang lưu..." : "Lưu sản phẩm" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div
        v-if="toast"
        :class="['toast', toast.type === 'success' ? 'toast-success' : 'toast-error']"
      >
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ... giữ nguyên toàn bộ style cũ, chỉ thêm phần mới */

.keep-img-wrap { position: relative; display: inline-block; }
.remove-img-btn {
  position: absolute; top: -6px; right: -6px;
  background: #ef4444; color: white;
  border: none; border-radius: 50%;
  width: 20px; height: 20px;
  font-size: 10px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.img-preview-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.preview-img { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
.file-input { padding: 6px; }
.thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; }
.no-img { width: 48px; height: 48px; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999; border-radius: 6px; }
.product-name { font-weight: 500; color: #111827; }
.product-desc { font-size: 12px; color: #6b7280; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.price { font-weight: 500; color: #2563eb; }
.req { color: #ef4444; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.empty { text-align: center; padding: 32px; color: #6b7280; }
.action-btns { display: flex; gap: 8px; }

/* giữ nguyên các style khác từ file cũ */
.page-container { min-height: 100vh; background: #f9fafb; padding: 24px; }
.content-wrapper { max-width: 100%; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.title { font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0; }
.subtitle { color: #6b7280; margin: 0; }
.loading-state { text-align: center; padding: 48px; }
.spinner { display: inline-block; width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.table-wrapper { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.1); overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
.data-table th { background: #f3f4f6; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
.data-table td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; }
.data-table tr:hover { background: #f9fafb; }
.badge { padding: 4px 8px; border-radius: 99px; font-size: 12px; font-weight: 600; }
.badge-success { background: #dcfce7; color: #16a34a; }
.badge-error { background: #fee2e2; color: #dc2626; }
.btn { padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; border: none; transition: all .2s; }
.btn-primary { background: #2563eb; color: white; }
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { opacity: .7; cursor: not-allowed; }
.btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; }
.btn-secondary:hover { background: #f3f4f6; }
.btn-icon { padding: 6px 10px; border-radius: 4px; border: none; cursor: pointer; font-size: 16px; }
.btn-edit { background: #eff6ff; }
.btn-edit:hover { background: #dbeafe; }
.btn-delete { background: #fef2f2; }
.btn-delete:hover { background: #fee2e2; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; justify-content: center; align-items: center; z-index: 50; padding: 16px; }
.modal { background: white; width: 100%; max-width: 600px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); overflow: hidden; max-height: 90vh; display: flex; flex-direction: column; }
.modal-header { padding: 16px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { font-size: 18px; font-weight: 600; margin: 0; }
.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #9ca3af; }
.modal-body { padding: 24px; overflow-y: auto; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.input { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
.input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
.modal-footer { padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 24px; border-radius: 8px; color: white; font-weight: 500; z-index: 100; }
.toast-success { background: #10b981; }
.toast-error { background: #ef4444; }
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>