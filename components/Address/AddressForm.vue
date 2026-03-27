<script setup lang="ts">
import type { Address, AddressFormData, AddressType } from "../../@type/address";
import { ADDRESS_TYPES } from "../../@type/address";
import MapPicker from "./MapPicker.vue";

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    editingAddress?: Address | null;
  }>(),
  { editingAddress: null }
);

const emit = defineEmits<{
  close: [];
  submit: [data: AddressFormData];
}>();

// ── State ──────────────────────────────────────────────────────────────────────

const isSubmitting = ref(false);
const errorMessage = ref("");
const phoneError = ref("");

const defaultForm = (): AddressFormData => ({
  contact_name: "",
  phone: "",
  address_type: "Nhà riêng",
  detail_address: "",
  latitude: null,
  longitude: null,
  is_default: false,
});

const formData = ref<AddressFormData>(defaultForm());

const isEditMode = computed(() => !!props.editingAddress);

// Khi editingAddress thay đổi → fill form
watch(
  () => props.editingAddress,
  (addr) => {
    if (addr) {
      formData.value = {
        contact_name: addr.contact_name,
        phone: addr.phone,
        address_type: addr.address_type,
        detail_address: addr.detail_address,
        latitude: addr.latitude,
        longitude: addr.longitude,
        is_default: addr.is_default,
      };
    } else {
      formData.value = defaultForm();
    }
  },
  { immediate: true }
);

// ── Validation ─────────────────────────────────────────────────────────────────

const validatePhone = () => {
  const p = formData.value.phone.trim();
  if (!p) { phoneError.value = ""; return true; }
  if (!/^[0-9]{10,11}$/.test(p)) {
    phoneError.value = "Số điện thoại phải có 10–11 chữ số";
    return false;
  }
  phoneError.value = "";
  return true;
};

// ── Handlers ───────────────────────────────────────────────────────────────────

const handlePositionUpdate = (pos: { lat: number; lng: number } | null) => {
  formData.value.latitude = pos?.lat ?? null;
  formData.value.longitude = pos?.lng ?? null;
};

const handleSubmit = async () => {
  errorMessage.value = "";
  if (!validatePhone()) return;

  const { contact_name, phone, detail_address } = formData.value;
  if (!contact_name.trim() || !phone.trim() || !detail_address.trim()) {
    errorMessage.value = "Vui lòng điền đầy đủ thông tin bắt buộc";
    return;
  }

  isSubmitting.value = true;
  try {
    emit("submit", {
      contact_name: contact_name.trim(),
      phone: phone.trim(),
      address_type: formData.value.address_type,
      detail_address: detail_address.trim(),
      latitude: formData.value.latitude,
      longitude: formData.value.longitude,
      is_default: formData.value.is_default,
    });
  } finally {
    isSubmitting.value = false;
  }
};

const handleClose = () => {
  formData.value = defaultForm();
  errorMessage.value = "";
  phoneError.value = "";
  emit("close");
};

const typeIcon: Record<string, string> = {
  "Nhà riêng": "🏠",
  "Văn phòng": "🏢",
  "Khác": "📍",
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="handleClose"
      >
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
            <h2 class="text-lg font-bold text-gray-900">
              {{ isEditMode ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới" }}
            </h2>
            <button
              @click="handleClose"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-5">

            <!-- Họ tên -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Họ và tên người nhận <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.contact_name"
                type="text"
                required
                placeholder="Nguyễn Văn A"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            <!-- SĐT -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Số điện thoại <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.phone"
                type="tel"
                required
                placeholder="0912345678"
                @input="validatePhone"
                class="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                :class="phoneError ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="phoneError" class="text-red-500 text-xs mt-1">{{ phoneError }}</p>
            </div>

            <!-- Loại địa chỉ -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Loại địa chỉ</label>
              <div class="flex gap-3">
                <button
                  v-for="type in ADDRESS_TYPES"
                  :key="type"
                  type="button"
                  @click="formData.address_type = type"
                  class="flex-1 py-2 px-3 border rounded-xl text-sm font-medium transition-all"
                  :class="formData.address_type === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'"
                >
                  {{ typeIcon[type] }} {{ type }}
                </button>
              </div>
            </div>

            <!-- Địa chỉ chi tiết -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Địa chỉ chi tiết <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="formData.detail_address"
                required
                rows="3"
                placeholder="123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
              />
            </div>

            <!-- Map Picker -->
            <MapPicker
              :initial-lat="formData.latitude"
              :initial-lng="formData.longitude"
              @update:position="handlePositionUpdate"
            />

            <!-- Đặt mặc định -->
            <label class="flex items-center gap-3 cursor-pointer select-none">
              <input
                v-model="formData.is_default"
                type="checkbox"
                class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-gray-700">Đặt làm địa chỉ mặc định</span>
            </label>

            <!-- Error -->
            <div v-if="errorMessage" class="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {{ errorMessage }}
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                @click="handleClose"
                class="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="isSubmitting || !!phoneError"
                class="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <span
                  v-if="isSubmitting"
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                />
                {{ isSubmitting ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Thêm mới" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease;
}
.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95) translateY(10px);
}
</style>