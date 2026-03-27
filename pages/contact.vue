<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useStore } from "@/composables/useStore";
import type { Store } from "@/@type/store";

definePageMeta({ title: "Liên hệ - GlowUp" });

const form = ref({
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
});

const errors = ref({} as Record<string, string>);
const submitting = ref(false);

// Get stores from API
const { getAllStores, loading } = useStore();
const stores = ref<Store[]>([]);
const selectedStore = ref<Store | null>(null);

const fetchStores = async () => {
  try {
    stores.value = await getAllStores();
    // Select first store as default
    if (stores.value.length > 0) {
      selectedStore.value = stores.value[0];
    }
  } catch (error) {
    console.error("Error fetching stores:", error);
  }
};

onMounted(() => {
  fetchStores();
});

function validate() {
  errors.value = {};
  if (!form.value.name) errors.value.name = "Vui lòng nhập họ và tên.";
  if (!form.value.phone) errors.value.phone = "Vui lòng nhập số điện thoại.";
  if (!form.value.email) errors.value.email = "Vui lòng nhập email.";
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.value.email))
    errors.value.email = "Email không hợp lệ.";
  if (!form.value.subject) errors.value.subject = "Vui lòng nhập tiêu đề.";
  if (!form.value.message) errors.value.message = "Vui lòng nhập nội dung.";
  return Object.keys(errors.value).length === 0;
}

async function submitForm() {
  if (!validate()) return;
  submitting.value = true;
  try {
    await $fetch("/api/contact", { method: "POST", body: form.value }).catch(
      () => null
    );
    alert("Cảm ơn! Chúng tôi đã nhận được yêu cầu.");
    form.value = { name: "", phone: "", email: "", subject: "", message: "" };
  } catch (err) {
    console.error(err);
    alert("Gửi thất bại, vui lòng thử lại sau.");
  } finally {
    submitting.value = false;
  }
}

// Get map embed URL
const getMapUrl = (store: Store) => {
  if (store.latitude && store.longitude) {
    return `https://www.google.com/maps?q=${store.latitude},${store.longitude}&z=16&output=embed`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(
    store.address_detail
  )}&output=embed`;
};

// Get Google Maps link
const getMapLink = (store: Store) => {
  if (store.latitude && store.longitude) {
    return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(
    store.address_detail
  )}`;
};
</script>

<template>
  <section class="relative w-full">
    <div
      class="h-64 md:h-80 bg-center bg-cover flex items-center"
      style="
        background-image: linear-gradient(
            rgba(6, 11, 18, 0.15),
            rgba(6, 11, 18, 0.15)
          ),
          url('https://images.unsplash.com/photo-1521790945508-bf2a36314e85?auto=format&fit=crop&w=1600&q=80');
      "
    >
      <div class="container mx-auto px-4 text-white">
        <h1 class="text-3xl md:text-4xl font-serif font-bold">
          Liên hệ với chúng tôi
        </h1>
        <p class="mt-2 max-w-2xl">
          Chúng tôi cam kết phản hồi nhanh chóng và hỗ trợ tận tâm. Liên hệ để
          được tư vấn miễn phí.
        </p>
      </div>
    </div>
  </section>

  <section class="container mx-auto px-4 py-10">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div
          class="inline-block w-12 h-12 border-4 border-glow-primary-600 border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="mt-4 text-gray-600 font-medium">Đang tải thông tin...</p>
      </div>
    </div>

    <!-- Store Selector (if multiple stores) -->
    <div v-else-if="stores.length > 1" class="mb-6">
      <label class="block text-sm font-semibold text-gray-700 mb-2"
        >Chọn cửa hàng</label
      >
      <select
        v-model="selectedStore"
        class="w-full max-w-md border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-glow-primary-600 focus:ring-2 focus:ring-glow-primary-100 outline-none"
      >
        <option v-for="store in stores" :key="store.id" :value="store">
          {{ store.name }}
        </option>
      </select>
    </div>

    <!-- Contact Content -->
    <div v-if="selectedStore" class="grid lg:grid-cols-3 gap-8">
      <!-- Contact cards -->
      <div class="lg:col-span-1 space-y-4">
        <div class="p-6 bg-white rounded-xl shadow-sm border">
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 bg-glow-primary-100 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5 text-glow-primary-600"
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
            <div class="flex-1">
              <h3 class="font-semibold mb-2">{{ selectedStore.name }}</h3>
              <p class="text-gray-600 text-sm">
                {{ selectedStore.address_detail }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="selectedStore.phone"
          class="p-6 bg-white rounded-xl shadow-sm border"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5 text-green-600"
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
            <div class="flex-1">
              <h4 class="font-semibold text-sm text-gray-700 mb-1">Hotline</h4>
              <a
                :href="`tel:${selectedStore.phone}`"
                class="text-glow-primary-600 font-medium hover:underline"
              >
                {{ selectedStore.phone }}
              </a>
            </div>
          </div>
        </div>

        <div
          v-if="selectedStore.email"
          class="p-6 bg-white rounded-xl shadow-sm border"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5 text-blue-600"
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
            <div class="flex-1">
              <h4 class="font-semibold text-sm text-gray-700 mb-1">Email</h4>
              <a
                :href="`mailto:${selectedStore.email}`"
                class="text-glow-primary-600 font-medium hover:underline break-all"
              >
                {{ selectedStore.email }}
              </a>
            </div>
          </div>
        </div>

        <div class="p-6 bg-white rounded-xl shadow-sm border">
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-sm text-gray-700 mb-1">
                Thời gian làm việc
              </h4>
              <p class="text-gray-600 text-sm">Thứ 2 – Thứ 7 | 8:00 – 17:30</p>
              <p class="text-gray-500 text-xs mt-1">Chủ nhật: Nghỉ</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Map + Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Google Map -->
        <div
          class="w-full rounded-xl overflow-hidden shadow-md border-2 border-gray-200"
        >
          <iframe
            class="w-full h-64 md:h-96"
            loading="lazy"
            :src="getMapUrl(selectedStore)"
            :title="`${selectedStore.name} location`"
          ></iframe>
        </div>

        <!-- Contact form + reasons -->
        <div class="grid md:grid-cols-2 gap-6">
          <form
            @submit.prevent="submitForm"
            class="bg-white p-6 rounded-xl shadow-sm border"
          >
            <h3 class="font-semibold text-lg mb-4">
              Gửi tin nhắn cho chúng tôi
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Họ và tên <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.name"
                  class="mt-1 w-full border-2 border-gray-300 rounded-lg p-2.5 focus:border-glow-primary-600 focus:ring-2 focus:ring-glow-primary-100 outline-none"
                  placeholder="Nguyễn Văn A"
                />
                <p v-if="errors.name" class="text-sm text-red-500 mt-1">
                  {{ errors.name }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Số điện thoại <span class="text-red-500">*</span></label
                >
                <input
                  v-model="form.phone"
                  class="mt-1 w-full border-2 border-gray-300 rounded-lg p-2.5 focus:border-glow-primary-600 focus:ring-2 focus:ring-glow-primary-100 outline-none"
                  placeholder="0901234567"
                />
                <p v-if="errors.phone" class="text-sm text-red-500 mt-1">
                  {{ errors.phone }}
                </p>
              </div>
            </div>

            <div class="mt-3">
              <label class="block text-sm font-medium text-gray-700"
                >Email <span class="text-red-500">*</span></label
              >
              <input
                v-model="form.email"
                type="email"
                class="mt-1 w-full border-2 border-gray-300 rounded-lg p-2.5 focus:border-glow-primary-600 focus:ring-2 focus:ring-glow-primary-100 outline-none"
                placeholder="name@domain.com"
              />
              <p v-if="errors.email" class="text-sm text-red-500 mt-1">
                {{ errors.email }}
              </p>
            </div>

            <div class="mt-3">
              <label class="block text-sm font-medium text-gray-700"
                >Tiêu đề <span class="text-red-500">*</span></label
              >
              <input
                v-model="form.subject"
                class="mt-1 w-full border-2 border-gray-300 rounded-lg p-2.5 focus:border-glow-primary-600 focus:ring-2 focus:ring-glow-primary-100 outline-none"
                placeholder="Bạn cần hỗ trợ về..."
              />
              <p v-if="errors.subject" class="text-sm text-red-500 mt-1">
                {{ errors.subject }}
              </p>
            </div>

            <div class="mt-3">
              <label class="block text-sm font-medium text-gray-700"
                >Nội dung <span class="text-red-500">*</span></label
              >
              <textarea
                v-model="form.message"
                rows="5"
                class="mt-1 w-full border-2 border-gray-300 rounded-lg p-2.5 focus:border-glow-primary-600 focus:ring-2 focus:ring-glow-primary-100 outline-none resize-none"
                placeholder="Mô tả vấn đề hoặc yêu cầu của bạn"
              ></textarea>
              <p v-if="errors.message" class="text-sm text-red-500 mt-1">
                {{ errors.message }}
              </p>
            </div>

            <div
              class="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <button
                :disabled="submitting"
                type="submit"
                class="w-full sm:w-auto px-6 py-2.5 bg-glow-primary-600 text-white rounded-lg font-medium hover:bg-glow-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ submitting ? "Đang gửi..." : "Gửi liên hệ" }}
              </button>
              <a
                :href="getMapLink(selectedStore)"
                target="_blank"
                class="text-sm text-glow-primary-600 hover:underline flex items-center gap-1"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <span>Xem trên Google Maps</span>
              </a>
            </div>
          </form>

          <div
            class="bg-gradient-to-br from-glow-primary-50 to-blue-50 p-6 rounded-xl shadow-sm border border-glow-primary-200"
          >
            <h4 class="font-semibold text-lg mb-4 text-gray-900">
              Tại sao nên liên hệ chúng tôi?
            </h4>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Phản hồi nhanh trong 24h</span>
              </li>
              <li class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700"
                  >Tư vấn miễn phí, phù hợp nhu cầu</span
                >
              </li>
              <li class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700"
                  >Giải pháp minh bạch, không bán chéo</span
                >
              </li>
              <li class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Hỗ trợ hậu mãi tận tâm</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading && stores.length === 0"
      class="bg-white rounded-xl shadow-sm border p-12 text-center"
    >
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
        Chưa có thông tin cửa hàng
      </h3>
      <p class="text-gray-500">Thông tin liên hệ sẽ được cập nhật sớm.</p>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="bg-glow-primary-600 text-white py-10">
    <div
      class="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4"
    >
      <div>
        <h3 class="text-xl font-semibold">Cần tư vấn chuyên sâu?</h3>
        <p class="opacity-90">
          Đặt lịch để nhận tư vấn 1:1 từ chuyên gia của chúng tôi.
        </p>
      </div>
      <div class="flex gap-3">
        <NuxtLink
          to="/contact"
          class="px-6 py-2 bg-white text-glow-primary-600 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >Liên hệ ngay</NuxtLink
        >
        <NuxtLink
          to="/shop"
          class="px-6 py-2 border border-white/30 rounded-md hover:bg-white/10 transition-colors"
          >Xem sản phẩm</NuxtLink
        >
      </div>
    </div>
  </section>
</template>

<style scoped>
.bg-glow-primary-600 {
  background-color: #0b6fa3;
}
.bg-glow-primary-700 {
  background-color: #095580;
}
.text-glow-primary-600 {
  color: #0b6fa3;
}
.bg-glow-primary-50 {
  background-color: #eff6fb;
}
.bg-glow-primary-100 {
  background-color: #dbeafe;
}
.border-glow-primary-200 {
  border-color: #bfdbfe;
}
.border-glow-primary-600 {
  border-color: #0b6fa3;
}
.ring-glow-primary-100 {
  --tw-ring-color: #dbeafe;
}

@media (max-width: 640px) {
  .h-64 {
    height: 260px;
  }
}
</style>
