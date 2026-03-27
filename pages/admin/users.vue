<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

import { onMounted } from "vue";
import { useUsers } from "@/composables/useUser";

const {
  users,
  loading,
  showModal,
  editingUser,
  form,
  toast,
  loadUsers,
  openModal,
  saveUser,
  deleteUser,
} = useUsers();

onMounted(() => loadUsers());
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <!-- Header -->
      <div class="header">
        <h1 class="title">Quản lý người dùng</h1>
        <p class="subtitle">Quản lý thông tin và quyền truy cập của người dùng</p>
      </div>

      <!-- Actions Bar -->
      <div class="actions-bar">
        <div class="user-count">
          <span class="count-number">{{ users.length }}</span> người dùng
        </div>
        <button class="btn btn-primary" @click="openModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14" /><path d="M12 5v14" />
          </svg>
          Thêm người dùng
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">Đang tải dữ liệu...</p>
      </div>

      <!-- Table -->
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Người dùng</th>
              <th>Liên hệ</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td><span class="user-id">#{{ u.id.slice(0, 6) }}</span></td>
              <td>
                <div class="user-info">
                  <div class="avatar">
                    {{ u.full_name?.charAt(0).toUpperCase() || "U" }}
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ u.full_name }}</div>
                    <div class="user-email">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ u.phone || "-" }}</td>
              <td><span class="badge badge-role">{{ u.role }}</span></td>
              <td>
                <span :class="['badge', u.status === 'active' ? 'badge-active' : 'badge-inactive']">
                  {{ u.status === "active" ? "Hoạt động" : "Khóa" }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-edit" @click="openModal(u)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 21a8 8 0 0 1 10.821-7.487"/>
                      <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>
                      <circle cx="10" cy="8" r="5"/>
                    </svg>
                    Sửa
                  </button>
                  <button class="btn btn-delete" @click="deleteUser(u.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      <path d="M3 6h18"/>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="users.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <h3 class="empty-title">Chưa có người dùng</h3>
          <p class="empty-text">Bắt đầu bằng cách thêm người dùng mới</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">
            {{ editingUser ? "Sửa người dùng" : "Thêm người dùng mới" }}
          </h2>
          <button class="close-btn" @click="showModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Họ và tên <span class="required">*</span></label>
            <input v-model="form.full_name" type="text" placeholder="Nhập họ tên" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Email <span class="required">*</span></label>
            <input v-model="form.email" type="email" placeholder="example@email.com" class="form-input"
              :disabled="!!editingUser" />
          </div>

          <div class="form-group">
            <label class="form-label">Số điện thoại</label>
            <input v-model="form.phone" type="text" placeholder="0123456789" class="form-input" />
          </div>

          <div class="form-group">
            <label class="form-label">Vai trò</label>
            <select v-model="form.role" class="form-select">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              Mật khẩu
              <span v-if="!editingUser" class="required">*</span>
              <span v-else class="optional">(để trống nếu không đổi)</span>
            </label>
            <input v-model="form.password" type="password" placeholder="••••••••" class="form-input"
              :required="!editingUser" />
          </div>

          <div class="form-group">
            <label class="form-label">Trạng thái</label>
            <select v-model="form.status" class="form-select">
              <option value="active">Hoạt động</option>
              <option value="inactive">Khóa</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="showModal = false">Hủy</button>
          <button class="btn btn-save" @click="saveUser">
            {{ editingUser ? "Cập nhật" : "Tạo mới" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" :class="['toast', toast.type === 'success' ? 'toast-success' : 'toast-error']">
        <svg v-if="toast.type === 'success'" class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"/>
        </svg>
        <svg v-else class="toast-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"/>
        </svg>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.page-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 2rem;
}

.content-wrapper { max-width: 100%; margin: 0 auto; }

.header { margin-bottom: 2rem; }
.title { font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0; }
.subtitle { color: #6b7280; margin: 0; }

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.user-count { font-size: 0.875rem; color: #6b7280; }
.count-number { font-weight: 500; color: #111827; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}
.btn:focus { outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3); }
.btn-primary { background-color: #2563eb; color: white; }
.btn-primary:hover { background-color: #1d4ed8; }
.btn-edit { background-color: #eab308; color: white; padding: 0.375rem 0.75rem; }
.btn-edit:hover { background-color: #ca8a04; }
.btn-delete { background-color: #ef4444; color: white; padding: 0.375rem 0.75rem; }
.btn-delete:hover { background-color: #dc2626; }
.btn-cancel { background-color: white; border: 1px solid #d1d5db; color: #374151; }
.btn-cancel:hover { background-color: #f9fafb; }
.btn-save { background-color: #2563eb; color: white; }
.btn-save:hover { background-color: #1d4ed8; }

.loading-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
}
.spinner {
  display: inline-block;
  width: 3rem; height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { margin-top: 1rem; color: #6b7280; }

.table-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.table { width: 100%; border-collapse: collapse; }
.table thead { background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; }
.table th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.table tbody tr { border-bottom: 1px solid #e5e7eb; transition: background-color 0.2s; }
.table tbody tr:hover { background-color: #f9fafb; }
.table td { padding: 1rem 1.5rem; font-size: 0.875rem; white-space: nowrap; }

.user-id { font-weight: 500; color: #111827; }
.user-info { display: flex; align-items: center; }
.avatar {
  width: 2.5rem; height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: 600; flex-shrink: 0;
}
.user-details { margin-left: 1rem; }
.user-name { font-weight: 500; color: #111827; }
.user-email { color: #6b7280; font-size: 0.875rem; }

.badge { display: inline-block; padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 600; border-radius: 9999px; }
.badge-role { background-color: #f3e8ff; color: #7c3aed; }
.badge-active { background-color: #dcfce7; color: #16a34a; }
.badge-inactive { background-color: #fee2e2; color: #dc2626; }

.action-buttons { display: flex; gap: 0.5rem; }

.empty-state { text-align: center; padding: 3rem; }
.empty-icon { width: 3rem; height: 3rem; margin: 0 auto; color: #9ca3af; stroke-width: 2; }
.empty-title { margin-top: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #111827; }
.empty-text { margin-top: 0.25rem; font-size: 0.875rem; color: #6b7280; }

.modal-overlay {
  position: fixed; inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 50; padding: 1rem;
}
.modal {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%; max-width: 28rem;
}
.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex; align-items: center; justify-content: space-between;
}
.modal-title { font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0; }
.close-btn {
  background: none; border: none; color: #9ca3af; cursor: pointer;
  padding: 0; width: 1.5rem; height: 1.5rem; transition: color 0.2s;
}
.close-btn:hover { color: #6b7280; }
.close-btn svg { width: 100%; height: 100%; stroke-width: 2; }

.modal-body { padding: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
.required { color: #ef4444; }
.optional { color: #6b7280; font-size: 0.75rem; }

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}
.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.form-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  color: #9ca3af;
}
.form-select { background-color: white; }

.modal-footer {
  padding: 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 0.5rem 0.5rem;
  display: flex; justify-content: flex-end; gap: 0.75rem;
}

.toast {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  color: white; z-index: 50;
  display: flex; align-items: center; gap: 0.5rem;
}
.toast-success { background-color: #10b981; }
.toast-error { background-color: #ef4444; }
.toast-icon { width: 1.25rem; height: 1.25rem; }
.toast-message { font-weight: 500; }

.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from, .toast-leave-to { transform: translateY(0.5rem); opacity: 0; }

@media (max-width: 768px) {
  .table { display: block; overflow-x: auto; }
  .action-buttons { flex-direction: column; }
}
</style>