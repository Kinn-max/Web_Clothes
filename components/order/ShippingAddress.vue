<script setup lang="ts">
import { MapPin, Edit2, Save } from "lucide-vue-next";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/composables/useAuth";

interface ContactInfo {
  fullName: string;
  phone: string;
  address: string;
}

const props = defineProps<{
  contactInfo: ContactInfo;
  hasContactInfo: boolean;
}>();

const emit = defineEmits<{
  editContactInfo: [];
  "update:contactInfo": [contactInfo: ContactInfo];
  "update:hasContactInfo": [val: boolean];
}>();

const nuxtApp = useNuxtApp();
const db = nuxtApp.$db as import("firebase/firestore").Firestore;
const { user } = useAuth();
const saving = ref(false);

const isValid = computed(() =>
  props.contactInfo.fullName.trim() &&
  props.contactInfo.phone.trim() &&
  props.contactInfo.address.trim()
);

const handleSave = async () => {
  if (!isValid.value || !user.value?.userId) return;
  saving.value = true;
  try {
    const profileRef = doc(db, "users", user.value.userId);
    await setDoc(profileRef, { contactInfo: props.contactInfo }, { merge: true });
    emit("update:hasContactInfo", true);
  } catch (err) {
    console.error("[ShippingAddress] handleSave:", err);
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <MapPin class="w-5 h-5 text-glow-primary-600" />
        <h2 class="text-lg font-bold text-gray-900">Địa chỉ giao hàng</h2>
      </div>
      <button
        v-if="hasContactInfo"
        @click="emit('editContactInfo')"
        class="flex items-center gap-2 text-sm text-glow-primary-600 hover:text-glow-primary-700 font-medium transition-colors"
      >
        <Edit2 class="w-4 h-4" />
        Thay đổi
      </button>
    </div>

    <!-- Hiển thị thông tin đã lưu -->
    <div v-if="hasContactInfo" class="space-y-2">
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <p class="font-bold text-gray-900">{{ contactInfo.fullName }}</p>
          <p class="text-gray-600 text-sm">{{ contactInfo.phone }}</p>
        </div>
      </div>
      <p class="text-gray-700 leading-relaxed">{{ contactInfo.address }}</p>
    </div>

    <!-- Form nhập thông tin -->
    <div v-else class="space-y-4">
      <p class="text-gray-500 text-sm mb-4">
        Vui lòng nhập thông tin giao hàng bên dưới.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
          <input
            type="text"
            :value="contactInfo.fullName"
            @input="$emit('update:contactInfo', { ...contactInfo, fullName: ($event.target as HTMLInputElement).value })"
            placeholder="Nguyễn Văn A"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-glow-primary-200 focus:border-glow-primary-400 outline-none transition-all"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
          <input
            type="tel"
            :value="contactInfo.phone"
            @input="$emit('update:contactInfo', { ...contactInfo, phone: ($event.target as HTMLInputElement).value })"
            placeholder="0123456789"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-glow-primary-200 focus:border-glow-primary-400 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Địa chỉ đầy đủ</label>
        <textarea
          :value="contactInfo.address"
          @input="$emit('update:contactInfo', { ...contactInfo, address: ($event.target as HTMLTextAreaElement).value })"
          placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố&#10;Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
          rows="3"
          class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-glow-primary-200 focus:border-glow-primary-400 outline-none transition-all resize-none"
        ></textarea>
      </div>

      <!-- Nút lưu địa chỉ vào Firestore -->
      <button
        @click="handleSave"
        :disabled="!isValid || saving"
        class="flex items-center gap-2 px-5 py-2.5 bg-glow-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-glow-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Save class="w-4 h-4" />
        {{ saving ? "Đang lưu..." : "Lưu địa chỉ" }}
      </button>
    </div>
  </div>
</template>