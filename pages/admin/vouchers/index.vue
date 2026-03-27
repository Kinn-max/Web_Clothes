<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useVoucher } from "@/composables/useVoucher";
import type { Voucher } from "../../../@type/voucher";

definePageMeta({ layout: "admin" });

type VoucherForm = Omit<Voucher, "id" | "created_at"> & {
  id?: string;
};

const {
  vouchers,
  voucher,
  loading,
  error,
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
} = useVoucher();

const showForm = ref(false);
const showDetail = ref(false);
const isEdit = ref(false);

const form = reactive<VoucherForm>({
  code: "",
  discount_type: "percent",
  discount_value: 0,  
  min_order_value: 0,
  max_discount: null,
  quantity: 1,
  start_date: "",
  end_date: "",
  status: "active",
});

onMounted(() => getAll());

const resetForm = () => {
  Object.assign(form, {
    code: "",
    discount_type: "percent",
    discount_value: 0,
    min_order_value: 0,
    max_discount: null,
    quantity: 1,
    start_date: "",
    end_date: "",
    status: "active",
  });
};

const openAdd = () => {
  resetForm();
  isEdit.value = false;
  showForm.value = true;
};

const openEdit = async (id: string) => {
  await getById(id);
  if (!voucher.value) return;

  Object.assign(form, voucher.value);
  isEdit.value = true;
  showForm.value = true;
};

const submitForm = async () => {
  if (isEdit.value && form.id) {
    await update(form.id, form);
  } else {
    await create(form);
  }

  showForm.value = false;
  resetForm();
  await getAll();
};

const toggleStatus = async (v: Voucher) => {
  await updateStatus(v.id, v.status === "active" ? "inactive" : "active");
  await getAll();
};

const deleteVoucher = async (id: string) => {
  if (!confirm("Xóa mã khuyến mãi này?")) return;
  await remove(id);
  await getAll();
};

const viewDetail = async (id: string) => {
  await getById(id);
  showDetail.value = true;
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8"
  >
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1
            class="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
          >
            Quản lý khuyến mãi
          </h1>
          <p class="text-gray-600">Tạo và quản lý mã giảm giá cho khách hàng</p>
        </div>
        <button
          @click="openAdd"
          class="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 transition-all duration-300 hover:scale-105"
        >
          <span class="flex items-center gap-2">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tạo mã mới
          </span>
        </button>
      </div>

      <!-- STATE -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"
        ></div>
      </div>

      <div
        v-if="error"
        class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
      >
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>
      <div
        v-if="!loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="v in vouchers"
          :key="v.id"
          class="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 hover:-translate-y-1"
        >
          <!-- Gradient Overlay -->
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full"
          ></div>

          <!-- Status Badge -->
          <div class="absolute top-4 right-4">
            <button
              @click="toggleStatus(v)"
              class="px-4 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all duration-300 hover:scale-105"
              :class="
                v.status === 'active'
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              "
            >
              {{ v.status === "active" ? "Đang hoạt động" : " Tạm dừng" }}
            </button>
          </div>

          <div class="p-6 pt-8">
            <div class="mb-4">
              <div
                class="inline-block px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-dashed border-indigo-300"
              >
                <p class="text-2xl font-black text-indigo-600 tracking-wider">
                  {{ v.code }}
                </p>
              </div>
            </div>
            <div class="flex items-baseline gap-2 mb-4">
              <span
                class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              >
                {{ v.discount_value.toLocaleString() }}
              </span>
              <span class="text-xl font-semibold text-gray-500">
                {{ v.discount_type === "percent" ? "%" : "VNĐ" }}
              </span>
            </div>

            <!-- Details -->
            <div class="space-y-2 mb-6 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <svg
                  class="w-4 h-4 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span
                  >Đơn tối thiểu:
                  <strong class="text-gray-900"
                    >{{ v.min_order_value.toLocaleString() }}đ</strong
                  ></span
                >
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <svg
                  class="w-4 h-4 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span
                  >Số lượng:
                  <strong class="text-gray-900">{{ v.quantity }}</strong></span
                >
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <svg
                  class="w-4 h-4 text-pink-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span class="text-xs">
                  {{ new Date(v.start_date).toLocaleDateString("vi-VN") }} -
                  {{ new Date(v.end_date).toLocaleDateString("vi-VN") }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-4 border-t border-gray-100">
              <button
                @click="viewDetail(v.id)"
                class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium text-sm"
              >
                <div style="display: flex; align-items: center; gap: 8px">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-eye-icon lucide-eye"
                    color="blue"
                  >
                    <path
                      d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Xem
                </div>
              </button>
              <button
                @click="openEdit(v.id)"
                class="flex-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors duration-200 font-medium text-sm"
              >
                <div style="display: flex; align-items: center; gap: 8px">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-pencil-icon lucide-pencil"
                    color="indigo"
                  >
                    <path
                      d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
                    />
                    <path d="m15 5 4 4" />
                  </svg>
                  Sửa
                </div>
              </button>
              <button
                @click="deleteVoucher(v.id)"
                class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 font-medium text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-trash-icon lucide-trash"
                  color="red"
                >
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="vouchers.length === 0" class="col-span-full">
          <div class="text-center py-20">
            <div
              class="inline-block p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full mb-4"
            >
              <svg
                class="w-16 h-16 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Chưa có mã khuyến mãi
            </h3>
            <p class="text-gray-500 mb-6">
              Tạo mã khuyến mãi đầu tiên để thu hút khách hàng
            </p>
            <button
              @click="openAdd"
              class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              + Tạo mã đầu tiên
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD / EDIT MODAL -->
    <Transition name="modal">
      <div
        v-if="showForm"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showForm = false"
      >
        <div
          class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        >
          <div
            class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white"
          >
            <h2 class="text-2xl font-bold">
              {{ isEdit ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới" }}
            </h2>
            <p class="text-indigo-100 text-sm mt-1">
              Điền thông tin để {{ isEdit ? "cập nhật" : "tạo" }} mã giảm giá
            </p>
          </div>

          <!-- Modal Body -->
          <div class="p-8">
            <div class="grid grid-cols-2 gap-4">
              <!-- Code -->
              <div class="col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Mã khuyến mãi</label
                >
                <input
                  v-model="form.code"
                  placeholder="VD: SUMMER2024"
                  class="input-vip w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Loại giảm giá</label
                >
                <select v-model="form.discount_type" class="input-vip w-full">
                  <option value="percent">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (VNĐ)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Giá trị giảm</label
                >
                <input
                  v-model.number="form.discount_value"
                  type="number"
                  placeholder="0"
                  class="input-vip w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Đơn hàng tối thiểu</label
                >
                <input
                  v-model.number="form.min_order_value"
                  type="number"
                  placeholder="0"
                  class="input-vip w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Số lượng</label
                >
                <input
                  v-model.number="form.quantity"
                  type="number"
                  placeholder="1"
                  class="input-vip w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Ngày bắt đầu</label
                >
                <input
                  v-model="form.start_date"
                  type="date"
                  class="input-vip w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Ngày kết thúc</label
                >
                <input
                  v-model="form.end_date"
                  type="date"
                  class="input-vip w-full"
                />
              </div>

              <!-- Status -->
              <div class="col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2"
                  >Trạng thái</label
                >
                <select v-model="form.status" class="input-vip w-full">
                  <option value="active">Kích hoạt</option>
                  <option value="inactive">Tạm dừng</option>
                </select>
              </div>
            </div>

            <!-- Modal Actions -->
            <div class="flex gap-3 mt-8">
              <button
                @click="showForm = false"
                class="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200"
              >
                Hủy bỏ
              </button>
              <button
                @click="submitForm"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {{ isEdit ? "Cập nhật" : "Tạo mới" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- DETAIL MODAL -->
    <Transition name="modal">
      <div
        v-if="showDetail && voucher"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showDetail = false"
      >
        <div
          class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        >
          <!-- Modal Header -->
          <div
            class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white"
          >
            <h2 class="text-2xl font-bold">
              <div style="display: flex; align-items: center; gap: 8px">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-receipt-text-icon lucide-receipt-text"
                  color="white"
                >
                  <path d="M13 16H8" />
                  <path d="M14 8H8" />
                  <path d="M16 12H8" />
                  <path
                    d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"
                  />
                </svg>
                Chi tiết khuyến mãi
              </div>
            </h2>
          </div>

          <!-- Modal Body -->
          <div class="p-8">
            <div class="space-y-4">
              <div
                class="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span class="text-gray-600 font-medium">Mã khuyến mãi</span>
                <span class="font-bold text-indigo-600 text-lg">{{
                  voucher.code
                }}</span>
              </div>
              <div
                class="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span class="text-gray-600 font-medium">Loại giảm giá</span>
                <span class="font-semibold">{{
                  voucher.discount_type === "percent"
                    ? "Phần trăm (%)"
                    : "Số tiền (VNĐ)"
                }}</span>
              </div>
              <div
                class="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span class="text-gray-600 font-medium">Giá trị</span>
                <span class="font-bold text-2xl text-purple-600">
                  {{ voucher.discount_value.toLocaleString()
                  }}{{ voucher.discount_type === "percent" ? "%" : "đ" }}
                </span>
              </div>
              <div
                class="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span class="text-gray-600 font-medium">Đơn tối thiểu</span>
                <span class="font-semibold"
                  >{{ voucher.min_order_value.toLocaleString() }}đ</span
                >
              </div>
              <div
                class="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span class="text-gray-600 font-medium">Số lượng</span>
                <span class="font-semibold">{{ voucher.quantity }}</span>
              </div>
              <div
                class="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <span class="text-gray-600 font-medium">Trạng thái</span>
                <span
                  class="px-3 py-1 rounded-full text-sm font-semibold"
                  :class="
                    voucher.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-600'
                  "
                >
                  {{
                    voucher.status === "active" ? "✓ Hoạt động" : "○ Tạm dừng"
                  }}
                </span>
              </div>
            </div>

            <button
              @click="showDetail = false"
              class="w-full mt-8 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.input-vip {
  border: 2px solid #e5e7eb;
  padding: 12px 16px;
  border-radius: 12px;
  transition: all 0.3s;
  font-size: 15px;
}

.input-vip:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-vip:hover {
  border-color: #c7d2fe;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .animate-scale-in {
  animation: scaleIn 0.3s ease;
}

.modal-leave-active .animate-scale-in {
  animation: scaleOut 0.2s ease;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes scaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>
