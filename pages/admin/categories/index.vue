<script setup lang="ts">
import type { Category } from "@/composables/useCategories";
import { useCategory } from "@/composables/useCategories";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

definePageMeta({ layout: "admin" });

const { categories, error, loading, getAll, create, update, remove } = useCategory();
const router = useRouter();

const formData = ref({ name: "", description: "" });
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const editingId = ref<string | null>(null);
const isSubmitting = ref(false);
const successMessage = ref("");
const searchQuery = ref("");
const shouldRemoveImage = ref(false);

onMounted(() => getAll());

// --- Search ---
const filteredCategories = computed(() =>
  categories.value.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (cat.description ?? "").toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

// --- File input ---
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) {
    const file = target.files[0];
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
    shouldRemoveImage.value = false;
  }
};

const removePreview = () => {
  imagePreview.value = null;
  imageFile.value = null;
  if (editingId.value) shouldRemoveImage.value = true;
};

// --- Edit mode ---
const handleEdit = (cat: Category) => {
  editingId.value = cat.id as string;
  formData.value = { name: cat.name, description: cat.description || "" };
  imagePreview.value = cat.image || null;
  imageFile.value = null;
  shouldRemoveImage.value = false;
  error.value = null;
};

// --- Submit ---
const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    error.value = "Tên danh mục là bắt buộc";
    return;
  }
  try {
    isSubmitting.value = true;
    error.value = null;

    if (editingId.value) {
     await update(editingId.value, {
        name: formData.value.name.trim(),
        description: formData.value.description.trim() || undefined,
        ...(imageFile.value ? { image: imageFile.value } : {}),
        removeImage: shouldRemoveImage.value,
      });
      showSuccess("Cập nhật thành công!");
    } else {
      await create({
        name: formData.value.name.trim(),
        description: formData.value.description.trim() || undefined,
        ...(imageFile.value ? { image: imageFile.value } : {}) 
      });
      showSuccess("Đã thêm danh mục mới!");
    }
    resetForm();
  } catch {
    // error đã được set trong composable
  } finally {
    isSubmitting.value = false;
  }
};

// --- Delete ---
const handleDelete = async (id: string) => {
  if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
  try {
    await remove(id);
    showSuccess("Đã xóa danh mục thành công");
  } catch {
    error.value = "Không thể xóa danh mục";
  }
};

// --- Helpers ---
const showSuccess = (msg: string) => {
  successMessage.value = msg;
  setTimeout(() => (successMessage.value = ""), 3000);
};

const resetForm = () => {
  formData.value = { name: "", description: "" };
  imageFile.value = null;
  imagePreview.value = null;
  editingId.value = null;
  shouldRemoveImage.value = false;
  error.value = null;

  const input = document.getElementById("cat-img") as HTMLInputElement;
  if (input) input.value = "";
};

const goToDetail = (id?: string) => {
  if (!id) return;
  router.push(`/admin/categories/${id}`);
};
</script>

<template>
  <div class="admin-layout">
    <div class="container">
      <header class="page-header">
        <div class="header-content">
          <div class="breadcrumb">Quản lý hệ thống / Sản phẩm</div>
          <h1 class="main-title">Danh mục sản phẩm</h1>
        </div>
        <div class="header-stats">
          <div class="mini-stat">
            <span class="label">Tổng danh mục</span>
            <span class="value">{{ categories.length }}</span>
          </div>
        </div>
      </header>

      <div class="dashboard-grid">
        <!-- FORM PANEL -->
        <aside class="form-container">
          <div class="card editor-card">
            <div class="card-header">
              <span class="dot" :class="{ 'is-editing': editingId }"></span>
              <h3>{{ editingId ? "Sửa danh mục" : "Tạo danh mục mới" }}</h3>
            </div>

            <form @submit.prevent="handleSubmit" class="form-ui">
              <div class="field">
                <label>Tên danh mục <span class="req">*</span></label>
                <input
                  v-model="formData.name"
                  placeholder="Ví dụ: Quần ngắn nam"
                  :disabled="isSubmitting"
                />
              </div>

              <div class="field">
                <label>Mô tả</label>
                <textarea
                  v-model="formData.description"
                  rows="3"
                  placeholder="Mô tả ngắn gọn..."
                  :disabled="isSubmitting"
                ></textarea>
              </div>

              <div class="field">
                <label>Hình ảnh đại diện</label>
                <div class="upload-wrapper">
                  <div v-if="imagePreview" class="image-preview">
                    <img :src="imagePreview" alt="Preview" />
                    <button type="button" class="btn-remove-img" @click="removePreview">×</button>
                  </div>
                  <div v-else class="upload-placeholder">
                    <input
                      type="file"
                      accept="image/*"
                      @change="handleFileChange"
                      id="cat-img"
                      class="file-input"
                    />
                    <label for="cat-img">
                      <svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14m7-7H5" />
                      </svg>
                      Tải ảnh lên
                    </label>
                  </div>
                </div>
              </div>

              <Transition name="slide-up">
                <div v-if="error" class="msg-box error">{{ error }}</div>
                <div v-else-if="successMessage" class="msg-box success">{{ successMessage }}</div>
              </Transition>

              <div class="actions">
                <button type="submit" class="btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner"></span>
                  {{ editingId ? "Cập nhật ngay" : "Tạo danh mục" }}
                </button>
                <button v-if="editingId" type="button" @click="resetForm" class="btn-ghost">
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </aside>

        <!-- TABLE PANEL -->
        <main class="table-container">
          <div class="card table-card">
            <div class="table-toolbar">
              <div class="search-wrapper">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input v-model="searchQuery" placeholder="Tìm kiếm nhanh..." />
              </div>
            </div>

            <!-- Loading skeleton -->
            <div v-if="loading" class="loading-state">
              <div v-for="i in 4" :key="i" class="skeleton-row">
                <div class="skeleton s-id"></div>
                <div class="skeleton s-img"></div>
                <div class="skeleton-info">
                  <div class="skeleton s-name"></div>
                  <div class="skeleton s-desc"></div>
                </div>
                <div class="skeleton s-actions"></div>
              </div>
            </div>

            <div v-else class="scroll-area">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hình ảnh</th>
                    <th>Thông tin danh mục</th>
                    <th class="text-right">Hành động</th>
                  </tr>
                </thead>
                <TransitionGroup tag="tbody" name="list">
                  <tr
                    v-for="cat in filteredCategories"
                    :key="cat.id"
                    class="row clickable"
                    @click="goToDetail(cat.id)"
                  >
                    <td class="id-cell">#{{ cat.id?.slice(0, 6) }}</td>
                    <td class="img-cell">
                      <img
                        v-if="cat.image"
                        :src="cat.image"
                        class="table-thumb"
                        alt=""
                      />
                      <div v-else class="no-img">
                        <svg viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="3"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </div>
                    </td>
                    <td>
                      <div class="name-text">{{ cat.name }}</div>
                      <div class="desc-text text-truncate">
                        {{ cat.description || "Chưa có mô tả" }}
                      </div>
                    </td>
                    <td class="action-cell">
                      <div class="action-btns">
                        <button class="btn-edit" title="Sửa" @click.stop="handleEdit(cat)">
                          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button class="btn-delete" title="Xóa" @click.stop="handleDelete(cat.id as string)">
                          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </TransitionGroup>
              </table>

              <div v-if="filteredCategories.length === 0 && !loading" class="empty-state">
                <svg viewBox="0 0 64 64" width="48" fill="none" stroke="#cbd5e1" stroke-width="1.5">
                  <rect x="8" y="8" width="48" height="48" rx="8"/>
                  <path d="M24 32h16M32 24v16"/>
                </svg>
                <p>Không có danh mục nào</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  font-family: "Plus Jakarta Sans", sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 30px 20px;
  color: #1e293b;
}
.container { max-width: 1200px; margin: 0 auto; }

/* Header */
.page-header {
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px;
}
.breadcrumb {
  font-size: 0.75rem; color: #64748b; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.main-title { font-size: 2rem; font-weight: 800; color: #0f172a; }
.mini-stat {
  background: white; padding: 12px 24px; border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,.1); display: flex; flex-direction: column;
}
.mini-stat .label { font-size: 0.75rem; color: #6b7280; }
.mini-stat .value { font-size: 1.5rem; font-weight: 700; color: #6366f1; }

/* Grid */
.dashboard-grid {
  display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: start;
}

/* Card */
.card {
  background: white; border-radius: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,.05);
}
.editor-card { position: sticky; top: 20px; }
.card-header {
  padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; gap: 10px;
}
.card-header h3 { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
.dot.is-editing { background: #f59e0b; }

/* Form */
.form-ui { padding: 24px; }
.field { margin-bottom: 18px; }
.field label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 6px; }
.req { color: #ef4444; }
input, textarea {
  width: 100%; padding: 10px 14px; border-radius: 12px;
  border: 1px solid #e2e8f0; background: #f8fafc; transition: all .2s; font-size: .95rem;
  box-sizing: border-box;
}
input:focus, textarea:focus {
  outline: none; border-color: #6366f1; background: white;
  box-shadow: 0 0 0 4px rgba(99,102,241,.1);
}
.upload-wrapper {
  border: 2px dashed #e2e8f0; border-radius: 12px; overflow: hidden;
  min-height: 100px; display: flex; align-items: center; justify-content: center; background: #fcfdfe;
}
.image-preview { position: relative; width: 100%; padding: 10px; }
.image-preview img { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; }
.btn-remove-img {
  position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,.5); color: white;
  border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
}
.upload-placeholder { padding: 20px; text-align: center; }
.file-input { display: none; }
.upload-placeholder label {
  cursor: pointer; color: #6366f1; display: flex; flex-direction: column;
  align-items: center; gap: 5px; margin: 0; font-size: 0.85rem; font-weight: 600;
}

/* Buttons */
.btn-primary {
  width: 100%; background: #4f46e5; color: white; padding: 12px; border-radius: 12px;
  font-weight: 700; border: none; cursor: pointer; display: flex;
  justify-content: center; align-items: center; gap: 8px; transition: background .2s;
}
.btn-primary:hover:not(:disabled) { background: #4338ca; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-ghost {
  width: 100%; background: transparent; color: #64748b; padding: 10px;
  border: none; cursor: pointer; margin-top: 8px; font-weight: 600;
}

/* Table */
.table-toolbar { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; }
.search-wrapper { position: relative; max-width: 280px; }
.search-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; color: #94a3b8;
}
.search-wrapper input { padding-left: 36px; border-radius: 99px; font-size: .85rem; height: 38px; }
.scroll-area { overflow-x: auto; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th {
  background: #f8fafc; padding: 14px 24px; text-align: left; font-size: .7rem;
  font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .5px;
  border-bottom: 1px solid #e2e8f0;
}
.row td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; }
.row.clickable { cursor: pointer; transition: background .2s; }
.row.clickable:hover { background: #f8fafc; }
.id-cell { font-family: monospace; color: #94a3b8; font-weight: 600; width: 80px; }
.img-cell { width: 80px; }
.table-thumb { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; border: 1px solid #e2e8f0; }
.no-img {
  width: 44px; height: 44px; border-radius: 10px; background: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
}
.name-text { font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.desc-text { font-size: .85rem; color: #64748b; max-width: 300px; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.action-btns { display: flex; gap: 8px; justify-content: flex-end; }
.action-btns button {
  width: 34px; height: 34px; border-radius: 8px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  background: white; transition: all .2s;
}
.btn-edit:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }
.btn-delete:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
.text-right { text-align: right; }

/* Messages */
.msg-box {
  padding: 10px; border-radius: 8px; font-size: .85rem;
  margin-bottom: 12px; text-align: center; font-weight: 500;
}
.msg-box.error { background: #fef2f2; color: #991b1b; }
.msg-box.success { background: #ecfdf5; color: #065f46; }

/* Spinner */
.spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3);
  border-top-color: white; border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Skeleton */
.loading-state { padding: 8px 0; }
.skeleton-row {
  display: flex; align-items: center; gap: 16px; padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
}
.skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px;
}
.s-id { width: 50px; height: 16px; }
.s-img { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0; }
.skeleton-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.s-name { height: 14px; width: 160px; }
.s-desc { height: 12px; width: 220px; }
.s-actions { width: 80px; height: 34px; border-radius: 8px; }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty */
.empty-state {
  padding: 60px 40px; text-align: center; color: #94a3b8;
  font-size: .9rem; display: flex; flex-direction: column; align-items: center; gap: 12px;
}

/* Transitions */
.list-enter-active, .list-leave-active { transition: all .3s ease; }
.list-enter-from { opacity: 0; transform: translateX(20px); }
.list-leave-to { opacity: 0; transform: translateX(-20px); }
.slide-up-enter-active, .slide-up-leave-active { transition: all .25s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(-6px); }
.slide-up-leave-to { opacity: 0; transform: translateY(-6px); }

.actions { margin-top: 4px; }

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .editor-card { position: relative; top: 0; }
}
</style>