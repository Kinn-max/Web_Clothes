<script setup lang="ts">
import { useStore } from "@/composables/useStore";
import type { Store } from "@/@type/store";

definePageMeta({
  layout: "admin",
});

const showEditModal = ref(false);
const selectedStore = ref<Store | null>(null);
const isUpdating = ref(false);

const openEdit = (store: Store) => {
  selectedStore.value = { ...store };
  showEditModal.value = true;
};

const closeEdit = () => {
  showEditModal.value = false;
  selectedStore.value = null;
};

const handleUpdateStore = async () => {
  if (!selectedStore.value) return;

  try {
    isUpdating.value = true;
    await updateStore(selectedStore.value.id, selectedStore.value);
    await fetchMyStores();
    closeEdit();
  } catch (err) {
    console.error(err);
  } finally {
    isUpdating.value = false;
  }
};

const { getMyStores, loading, updateStore } = useStore();

const myStores = ref<Store[]>([]);

const fetchMyStores = async () => {
  try {
    myStores.value = await getMyStores();
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  fetchMyStores();
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8"
  >
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <div
          class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Cửa hàng của tôi</h1>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div
          class="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="myStores.length === 0"
      class="bg-white rounded-2xl shadow-sm border border-gray-200 p-12"
    >
      <div class="text-center max-w-md mx-auto">
        <div
          class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          Chưa có cửa hàng nào
        </h3>
        <p class="text-gray-500">
          Bạn chưa được phân công quản lý cửa hàng nào. Vui lòng liên hệ quản
          trị viên để được hỗ trợ.
        </p>
      </div>
    </div>

    <!-- Stores List -->
    <div v-else class="space-y-6">
      <div
        v-for="store in myStores"
        :key="store.id"
        class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <!-- Store Header -->
        <div
          class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">
                {{ store.name }}
              </h3>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <span
                  class="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                ></span>
                <span class="font-medium">Đang hoạt động</span>
              </div>
            </div>

            <button
              @click="openEdit(store)"
              class="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 font-medium"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Cập nhật</span>
            </button>
          </div>
        </div>

        <!-- Store Content -->
        <div class="p-6">
          <!-- Store Information Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              class="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200"
            >
              <div
                class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-xs font-bold text-red-700 uppercase mb-1 tracking-wide"
                >
                  Địa chỉ
                </p>
                <p class="text-sm text-gray-900 font-medium leading-relaxed">
                  {{ store.address_detail || "Chưa cập nhật" }}
                </p>
              </div>
            </div>

            <div
              v-if="store.phone"
              class="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
            >
              <div
                class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-xs font-bold text-green-700 uppercase mb-1 tracking-wide"
                >
                  Điện thoại
                </p>
                <p class="text-sm text-gray-900 font-medium">
                  {{ store.phone }}
                </p>
              </div>
            </div>

            <div
              v-if="store.email"
              class="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
            >
              <div
                class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-xs font-bold text-blue-700 uppercase mb-1 tracking-wide"
                >
                  Email
                </p>
                <p class="text-sm text-gray-900 font-medium break-all">
                  {{ store.email }}
                </p>
              </div>
            </div>
          </div>

          <!-- Google Map - Full Width -->
          <div class="w-full">
            <div class="flex items-center gap-2 mb-3">
              <svg
                class="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <h4 class="font-bold text-gray-900 text-lg">
                Vị trí trên bản đồ
              </h4>
            </div>

            <div
              class="w-full h-[450px] rounded-xl overflow-hidden border-2 border-gray-300 shadow-xl"
            >
              <iframe
                v-if="store.latitude && store.longitude"
                class="w-full h-full"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                :src="`https://www.google.com/maps?q=${store.latitude},${store.longitude}&z=16&output=embed`"
              ></iframe>

              <div
                v-else
                class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
              >
                <svg
                  class="w-20 h-20 mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <p class="text-lg font-semibold text-gray-600 mb-1">
                  Chưa có tọa độ bản đồ
                </p>
                <p class="text-sm text-gray-500">
                  Vui lòng cập nhật vị trí cửa hàng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Store Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showEditModal && selectedStore"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeEdit"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showEditModal"
            class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
          >
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-white">
                      Cập nhật cửa hàng
                    </h2>
                    <p class="text-blue-100 text-sm">
                      Chỉnh sửa thông tin cửa hàng
                    </p>
                  </div>
                </div>

                <button
                  @click="closeEdit"
                  class="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <svg
                    class="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div class="space-y-5">
                <!-- Store Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Tên cửa hàng <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="selectedStore.name"
                    placeholder="Nhập tên cửa hàng"
                    class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <!-- Address -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="selectedStore.address_detail"
                    placeholder="Nhập địa chỉ chi tiết"
                    rows="3"
                    class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <!-- Coordinates -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Tọa độ bản đồ
                  </label>
                  <div class="grid grid-cols-2 gap-4">
                    <input
                      v-model="selectedStore.latitude"
                      placeholder="Latitude (VD: 10.7769)"
                      type="number"
                      step="any"
                      class="border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                    <input
                      v-model="selectedStore.longitude"
                      placeholder="Longitude (VD: 106.7009)"
                      type="number"
                      step="any"
                      class="border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <!-- Contact Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Số điện thoại
                    </label>
                    <input
                      v-model="selectedStore.phone"
                      placeholder="Nhập số điện thoại"
                      type="tel"
                      class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email
                    </label>
                    <input
                      v-model="selectedStore.email"
                      placeholder="Nhập email"
                      type="email"
                      class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div
              class="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200"
            >
              <button
                @click="closeEdit"
                :disabled="isUpdating"
                class="px-6 py-2.5 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Hủy bỏ
              </button>

              <button
                @click="handleUpdateStore"
                :disabled="isUpdating"
                class="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg
                  v-if="isUpdating"
                  class="w-5 h-5 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{{ isUpdating ? "Đang lưu..." : "Lưu thay đổi" }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
