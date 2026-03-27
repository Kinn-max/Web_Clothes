<script setup lang="ts">
import { doc, getDoc, updateDoc } from "firebase/firestore";
import type { Address, AddressFormData }  from "../../@type/address";
import AddressCard from "@/components/Address/AddressCard.vue";
import AddressForm from "@/components/Address/AddressForm.vue";
import { useAddress } from "@/composables/useAddress";

const { user, isAuthenticated } = useAuth();
const nuxtApp = useNuxtApp();
const db = nuxtApp.$db as import("firebase/firestore").Firestore;

const {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = useAddress();



onMounted(async () => {
  if (!isAuthenticated.value) {
    navigateTo("/auth/login");
    return;
  }
  await loadAll();
});



const isPageLoading = ref(true);
const toast = ref({ show: false, message: "", type: "success" as "success" | "error" });

// Profile
const isProfileSubmitting = ref(false);
const phoneError = ref("");
const profileForm = ref({
  full_name: "",
  email: "",
  phone: "",
});

// Address
const addresses = ref<Address[]>([]);
const showAddressForm = ref(false);
const editingAddressData = ref<Address | null>(null);



const loadAll = async () => {
  isPageLoading.value = true;
  try {
    // Load profile từ Firestore users/{userId}
    const userId = user.value?.userId;
    if (!userId) return;

    const userSnap = await getDoc(doc(db, "users", userId));
    if (userSnap.exists()) {
      const data = userSnap.data();
      profileForm.value = {
        full_name: data.full_name ?? "",
        email: data.email ?? user.value?.email ?? "",
        phone: data.phone ?? "",
      };
    }

    // Load addresses
    addresses.value = await getAllAddresses();
  } catch (err) {
    console.error("[settings] loadAll:", err);
    showToast("Có lỗi xảy ra khi tải dữ liệu.", "error");
  } finally {
    isPageLoading.value = false;
  }
};



const getInitials = (name: string) => (name ? name.charAt(0).toUpperCase() : "U");

const validatePhone = () => {
  const p = profileForm.value.phone.trim();
  if (!p) { phoneError.value = ""; return true; }
  if (!/^[0-9]{10,11}$/.test(p)) {
    phoneError.value = "SĐT không hợp lệ (10–11 số)";
    return false;
  }
  phoneError.value = "";
  return true;
};

const handleUpdateProfile = async () => {
  if (!validatePhone()) return;

  const userId = user.value?.userId;
  if (!userId) return;

  isProfileSubmitting.value = true;
  try {
    await updateDoc(doc(db, "users", userId), {
      full_name: profileForm.value.full_name.trim(),
      phone: profileForm.value.phone.trim() || "",
      updated_at: Date.now(),
    });
    showToast("Cập nhật thông tin thành công!", "success");
  } catch (err: any) {
    showToast(err.message || "Lỗi cập nhật hồ sơ", "error");
  } finally {
    isProfileSubmitting.value = false;
  }
};



const refreshAddresses = async () => {
  addresses.value = await getAllAddresses();
};

const openCreateAddressForm = () => {
  editingAddressData.value = null;
  showAddressForm.value = true;
};

const handleEditAddress = (id: string) => {
  const found = addresses.value.find((a) => a.id === id);
  if (found) {
    editingAddressData.value = found;
    showAddressForm.value = true;
  }
};

const handleCloseAddressForm = () => {
  showAddressForm.value = false;
  editingAddressData.value = null;
};

const handleAddressFormSubmit = async (data: AddressFormData) => {
  try {
    if (editingAddressData.value) {
      await updateAddress(editingAddressData.value.id, data);
      showToast("Cập nhật địa chỉ thành công", "success");
    } else {
      await createAddress(data);
      showToast("Thêm địa chỉ mới thành công", "success");
    }
    await refreshAddresses();
    handleCloseAddressForm();
  } catch (err: any) {
    showToast(err.message || "Lỗi xử lý địa chỉ", "error");
  }
};

const handleDeleteAddress = async (id: string) => {
  try {
    await deleteAddress(id);
    showToast("Đã xóa địa chỉ", "success");
    await refreshAddresses();
  } catch (err: any) {
    showToast(err.message || "Lỗi xóa địa chỉ", "error");
  }
};

const handleSetDefaultAddress = async (id: string) => {
  try {
    await setDefaultAddress(id);
    showToast("Đã đặt làm địa chỉ mặc định", "success");
    await refreshAddresses();
  } catch (err: any) {
    showToast(err.message || "Lỗi đặt mặc định", "error");
  }
};



const showToast = (message: string, type: "success" | "error") => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Thiết lập tài khoản</h1>
        <p class="mt-1 text-gray-500 text-sm">Quản lý hồ sơ và địa chỉ giao hàng của bạn</p>
      </div>

      <!-- Loading -->
      <div v-if="isPageLoading" class="flex flex-col items-center justify-center py-24">
        <div class="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        <p class="mt-4 text-gray-500 text-sm">Đang tải dữ liệu...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <!-- Cột trái: Profile -->
        <div class="lg:col-span-4">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <!-- Avatar header -->
            <div class="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
                {{ getInitials(profileForm.full_name) }}
              </div>
              <div class="text-white min-w-0">
                <h2 class="text-lg font-bold truncate">{{ profileForm.full_name || "User" }}</h2>
                <p class="text-blue-100 text-sm truncate">{{ profileForm.email }}</p>
              </div>
            </div>

            <!-- Form -->
            <div class="p-6">
              <h3 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Thông tin cá nhân
              </h3>

              <form @submit.prevent="handleUpdateProfile" class="space-y-4">
                <!-- Email readonly -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    :value="profileForm.email"
                    disabled
                    class="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed"
                  />
                </div>

                <!-- Họ tên -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="profileForm.full_name"
                    type="text"
                    required
                    class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <!-- SĐT -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    v-model="profileForm.phone"
                    type="tel"
                    @input="validatePhone"
                    class="w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    :class="phoneError ? 'border-red-400' : 'border-gray-300'"
                  />
                  <p v-if="phoneError" class="text-red-500 text-xs mt-1">{{ phoneError }}</p>
                </div>

                <button
                  type="submit"
                  :disabled="isProfileSubmitting || !!phoneError"
                  class="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <span
                    v-if="isProfileSubmitting"
                    class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  />
                  {{ isProfileSubmitting ? "Đang lưu..." : "Lưu thay đổi" }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Cột phải: Address book -->
        <div class="lg:col-span-8">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">

            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Sổ địa chỉ
              </h3>
              <button
                @click="openCreateAddressForm"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Thêm địa chỉ
              </button>
            </div>

            <!-- Empty -->
            <div
              v-if="addresses.length === 0"
              class="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
            >
              <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <h4 class="text-base font-semibold text-gray-700 mb-1">Chưa có địa chỉ nào</h4>
              <p class="text-sm text-gray-400 mb-5">Thêm địa chỉ để nhận hàng dễ dàng hơn.</p>
              <button
                @click="openCreateAddressForm"
                class="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                Thêm địa chỉ ngay
              </button>
            </div>

            <!-- Address list -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AddressCard
                v-for="address in addresses"
                :key="address.id"
                :address="address"
                @edit="handleEditAddress"
                @delete="handleDeleteAddress"
                @setDefault="handleSetDefaultAddress"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <Transition name="toast">
        <div
          v-if="toast.show"
          class="fixed bottom-6 right-6 px-5 py-3.5 rounded-xl shadow-xl z-50 flex items-center gap-3"
          :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
        >
          <span class="text-lg">{{ toast.type === "success" ? "✓" : "✕" }}</span>
          <p class="text-sm font-medium">{{ toast.message }}</p>
        </div>
      </Transition>

      <!-- Address Form Modal -->
      <AddressForm
        :is-open="showAddressForm"
        :editing-address="editingAddressData"
        @close="handleCloseAddressForm"
        @submit="handleAddressFormSubmit"
      />
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>