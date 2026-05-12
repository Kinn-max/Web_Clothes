<script setup lang="ts">
import { useStore } from "@/composables/useStore";
import type { Store } from "@/types/store";

definePageMeta({ title: "Liên hệ - GlowUp" });

const form = ref({
  name: "", phone: "", email: "", subject: "", message: "",
});
const errors    = ref({} as Record<string, string>);
const submitting = ref(false);

// ✅ Fix: dùng useGetAllStores() thay vì getAllStores + loading
const { useGetAllStores } = useStore();
const { data: storesData, isLoading } = useGetAllStores()

const stores = computed<Store[]>(() => storesData.value ?? [])

// Auto-select store đầu tiên khi data về
const selectedStore = ref<Store | null>(null)
watch(stores, (data) => {
  if (data.length > 0 && !selectedStore.value) {
    selectedStore.value = data[0]
  }
}, { immediate: true })

function validate() {
  errors.value = {};
  if (!form.value.name)    errors.value.name    = "Vui lòng nhập họ và tên.";
  if (!form.value.phone)   errors.value.phone   = "Vui lòng nhập số điện thoại.";
  if (!form.value.email)   errors.value.email   = "Vui lòng nhập email.";
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
    await $fetch("/api/contact", { method: "POST", body: form.value }).catch(() => null);
    alert("Cảm ơn! Chúng tôi đã nhận được yêu cầu.");
    form.value = { name: "", phone: "", email: "", subject: "", message: "" };
  } catch (err) {
    alert("Gửi thất bại, vui lòng thử lại sau.");
  } finally {
    submitting.value = false;
  }
}

const getMapUrl = (store: Store) => {
  if (store.latitude && store.longitude)
    return `https://www.google.com/maps?q=${store.latitude},${store.longitude}&z=16&output=embed`;
  return `https://www.google.com/maps?q=${encodeURIComponent(store.address_detail ?? '')}&output=embed`;
};

const getMapLink = (store: Store) => {
  if (store.latitude && store.longitude)
    return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(store.address_detail ?? '')}`;
};
</script>

<template>
  <section class="relative w-full">
    <div
      class="h-64 md:h-80 bg-center bg-cover flex items-center"
      style="background-image: linear-gradient(rgba(6,11,18,0.15),rgba(6,11,18,0.15)), url('https://images.unsplash.com/photo-1521790945508-bf2a36314e85?auto=format&fit=crop&w=1600&q=80');"
    >
      <div class="container mx-auto px-4 text-white">
        <h1 class="text-3xl md:text-4xl font-serif font-bold">Liên hệ với chúng tôi</h1>
        <p class="mt-2 max-w-2xl">Chúng tôi cam kết phản hồi nhanh chóng và hỗ trợ tận tâm.</p>
      </div>
    </div>
  </section>

  <section class="container mx-auto px-4 py-10">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p class="mt-4 text-gray-600 font-medium">Đang tải thông tin...</p>
      </div>
    </div>

    <!-- Store selector nếu có nhiều cửa hàng -->
    <div v-else-if="stores.length > 1" class="mb-6">
      <label class="block text-sm font-semibold text-gray-700 mb-2">Chọn cửa hàng</label>
      <select
        v-model="selectedStore"
        class="w-full max-w-md border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 outline-none"
      >
        <option v-for="store in stores" :key="store.id" :value="store">
          {{ store.name }}
        </option>
      </select>
    </div>

    <!-- Contact content -->
    <div v-if="selectedStore && !isLoading" class="grid lg:grid-cols-3 gap-8">
      <!-- Info cards -->
      <div class="lg:col-span-1 space-y-4">
        <div class="p-6 bg-white rounded-xl shadow-sm border">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold mb-2">{{ selectedStore.name }}</h3>
              <p class="text-gray-600 text-sm">{{ selectedStore.address_detail }}</p>
            </div>
          </div>
        </div>

        <div v-if="selectedStore.phone" class="p-6 bg-white rounded-xl shadow-sm border">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-sm text-gray-700 mb-1">Hotline</h4>
              <a :href="`tel:${selectedStore.phone}`" class="text-blue-600 font-medium hover:underline">
                {{ selectedStore.phone }}
              </a>
            </div>
          </div>
        </div>

        <div v-if="selectedStore.email" class="p-6 bg-white rounded-xl shadow-sm border">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-sm text-gray-700 mb-1">Email</h4>
              <a :href="`mailto:${selectedStore.email}`" class="text-blue-600 font-medium hover:underline break-all">
                {{ selectedStore.email }}
              </a>
            </div>
          </div>
        </div>

        <div class="p-6 bg-white rounded-xl shadow-sm border">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-sm text-gray-700 mb-1">Thời gian làm việc</h4>
              <p class="text-gray-600 text-sm">Thứ 2 – Thứ 7 | 8:00 – 17:30</p>
              <p class="text-gray-500 text-xs mt-1">Chủ nhật: Nghỉ</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Map + Form -->
      <div class="lg:col-span-2 space-y-6">
        <div class="w-full rounded-xl overflow-hidden shadow-md border-2 border-gray-200">
          <iframe
            class="w-full h-64 md:h-96"
            loading="lazy"
            :src="getMapUrl(selectedStore)"
            :title="`${selectedStore.name} location`"
          />
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Form -->
          <form @submit.prevent="submitForm" class="bg-white p-6 rounded-xl shadow-sm border space-y-3">
            <h3 class="font-semibold text-lg">Gửi tin nhắn cho chúng tôi</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Họ và tên <span class="text-red-500">*</span>
                </label>
                <input v-model="form.name" placeholder="Nguyễn Văn A"
                  class="mt-1 w-full border-2 border-gray-300 rounded-lg p-2.5 focus:border-blue-600 outline-none" />
                <p v-if="errors.name" class="text-sm text-red-500 mt-1">{{ errors.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Số điện thoại <span class="text-red-500">*</span>
                </label>
                <input v-model="form.phone" placeholder="0901234567"
                  class="mt-1 w-full border-2 border-gray-300 rounded-lg p-2.5 focus:border-blue-600 outline-none" />
                <p v-if="errors.phone" class="text-sm text-red-500 mt-1">{{ errors.phone }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                Email <span class="text-red-500">*</span>
              </label>
              <input v-model="form.email" type="email" placeholder="name@domain.com"
                class="mt-1 w-full border-2 border-gray-300 rounded-lg p-2.5 focus:border-blue-600 outline-none" />
              <p v-if="errors.email" class="text-sm text-red-500 mt-1">{{ errors.email }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                Tiêu đề <span class="text-red-500">*</span>
              </label>
              <input v-model="form.subject" placeholder="Bạn cần hỗ trợ về..."
                class="mt-1 w-full border-2 border-gray-300 rounded-lg p-2.5 focus:border-blue-600 outline-none" />
              <p v-if="errors.subject" class="text-sm text-red-500 mt-1">{{ errors.subject }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">
                Nội dung <span class="text-red-500">*</span>
              </label>
              <textarea v-model="form.message" rows="5" placeholder="Mô tả vấn đề hoặc yêu cầu của bạn"
                class="mt-1 w-full border-2 border-gray-300 rounded-lg p-2.5 focus:border-blue-600 outline-none resize-none" />
              <p v-if="errors.message" class="text-sm text-red-500 mt-1">{{ errors.message }}</p>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <button
                :disabled="submitting" type="submit"
                class="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {{ submitting ? "Đang gửi..." : "Gửi liên hệ" }}
              </button>
              <a :href="getMapLink(selectedStore)" target="_blank"
                class="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Xem trên Google Maps
              </a>
            </div>
          </form>

          <!-- Why choose us -->
          <div class="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-200">
            <h4 class="font-semibold text-lg mb-4 text-gray-900">Tại sao nên liên hệ chúng tôi?</h4>
            <ul class="space-y-3">
              <li v-for="reason in [
                'Phản hồi nhanh trong 24h',
                'Tư vấn miễn phí, phù hợp nhu cầu',
                'Giải pháp minh bạch, không bán chéo',
                'Hỗ trợ hậu mãi tận tâm',
              ]" :key="reason" class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-700">{{ reason }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!isLoading && stores.length === 0"
      class="bg-white rounded-xl shadow-sm border p-12 text-center">
      <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Chưa có thông tin cửa hàng</h3>
      <p class="text-gray-500">Thông tin liên hệ sẽ được cập nhật sớm.</p>
    </div>
  </section>

  <!-- CTA -->
  <section class="bg-blue-600 text-white py-10">
    <div class="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 class="text-xl font-semibold">Cần tư vấn chuyên sâu?</h3>
        <p class="opacity-90">Đặt lịch để nhận tư vấn 1:1 từ chuyên gia của chúng tôi.</p>
      </div>
      <div class="flex gap-3">
        <NuxtLink to="/contact" class="px-6 py-2 bg-white text-blue-600 rounded-md font-semibold hover:bg-gray-100 transition-colors">
          Liên hệ ngay
        </NuxtLink>
        <NuxtLink to="/shop" class="px-6 py-2 border border-white/30 rounded-md hover:bg-white/10 transition-colors">
          Xem sản phẩm
        </NuxtLink>
      </div>
    </div>
  </section>
</template>