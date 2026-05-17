<script setup lang="ts">
import { MapPin, Edit2, Plus, Check, ExternalLink } from "lucide-vue-next";
import type { ContactInfo } from "@/types/contact";

const props = defineProps<{
  contactInfo: ContactInfo;
  hasContactInfo: boolean;
}>();

const emit = defineEmits<{
  editContactInfo: [];
  "update:contactInfo": [contactInfo: ContactInfo];
  "update:hasContactInfo": [val: boolean];
}>();

const { useGetAllAddresses } = useAddress()
const { data: addresses, isLoading: loadingAddresses } = useGetAllAddresses()

const showForm = ref(false)
const selectedAddressId = ref<number | null>(null)
const selectAddress = (addr: any) => {
  selectedAddressId.value = addr.id
  emit('update:contactInfo', {
    fullName: addr.full_name,
    phone: addr.phone,
    address: [addr.address, addr.ward, addr.district, addr.city]
      .filter(Boolean).join(', '),
  })
  emit('update:hasContactInfo', true)
  showForm.value = false
}

watch(addresses, (list) => {
  if (!list?.length) return
  const defaultAddr = list.find(a => a.is_default) ?? list[0]
  if (defaultAddr) selectAddress(defaultAddr)
}, { immediate: true })



const isValid = computed(() =>
  props.contactInfo.fullName?.trim() &&
  props.contactInfo.phone?.trim() &&
  props.contactInfo.address?.trim()
)
</script>

<template>
  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <MapPin class="w-5 h-5 text-glow-primary-600" />
        <h2 class="text-lg font-bold text-gray-900">Địa chỉ giao hàng</h2>
      </div>
      <button
        v-if="hasContactInfo && !showForm"
        @click="emit('editContactInfo')"
        class="flex items-center gap-2 text-sm text-glow-primary-600 hover:text-glow-primary-700 font-medium transition-colors"
      >
        <Edit2 class="w-4 h-4" />
        Thay đổi
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loadingAddresses" class="flex items-center gap-2 text-gray-400 text-sm py-2">
      <div class="w-4 h-4 border-2 border-gray-200 border-t-glow-primary-600 rounded-full animate-spin" />
      Đang tải địa chỉ...
    </div>

    <!-- Hiển thị địa chỉ đã chọn -->
    <div v-else-if="hasContactInfo && !showForm" class="space-y-1">
      <p class="font-bold text-gray-900">{{ contactInfo.fullName }}</p>
      <p class="text-gray-600 text-sm">{{ contactInfo.phone }}</p>
      <p class="text-gray-700 leading-relaxed text-sm">{{ contactInfo.address }}</p>
    </div>

    <!-- Danh sách địa chỉ từ Neon -->
    <div v-else-if="!showForm" class="space-y-3">

      <!-- Có địa chỉ đã lưu -->
      <template v-if="addresses?.length">
        <p class="text-sm text-gray-500 mb-2">Chọn địa chỉ đã lưu:</p>
        <div
          v-for="addr in addresses"
          :key="addr.id"
          @click="selectAddress(addr)"
          :class="[
            'flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all',
            selectedAddressId === addr.id
              ? 'border-glow-primary-500 bg-glow-primary-50'
              : 'border-gray-200 hover:border-glow-primary-300'
          ]"
        >
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="font-semibold text-gray-900 text-sm">{{ addr.full_name }}</p>
              <span
                v-if="addr.is_default"
                class="text-xs px-2 py-0.5 bg-glow-primary-100 text-glow-primary-700 rounded-full font-medium"
              >
                Mặc định
              </span>
            </div>
            <p class="text-gray-500 text-xs mt-0.5">{{ addr.phone }}</p>
            <p class="text-gray-700 text-sm mt-1">
              {{ [addr.address, addr.ward, addr.district, addr.city].filter(Boolean).join(', ') }}
            </p>
          </div>
          <Check
            v-if="selectedAddressId === addr.id"
            class="w-5 h-5 text-glow-primary-600 flex-shrink-0 mt-0.5"
          />
        </div>
      </template>

      <!-- Chưa có địa chỉ -->
      <div v-else class="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <MapPin class="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500 mb-3">Bạn chưa có địa chỉ nào được lưu.</p>
        <NuxtLink
to="/profile"
          class="inline-flex items-center gap-2 px-4 py-2 bg-glow-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-glow-primary-700 transition-all"
        >
          <Plus class="w-4 h-4" />
          Thêm địa chỉ mới
        </NuxtLink>
      </div>

      <!-- Actions dưới danh sách -->
      <div class="flex items-center justify-between pt-1">
        <button
          @click="showForm = true"
          class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Plus class="w-4 h-4" />
          Nhập địa chỉ khác
        </button>

        <NuxtLink
to="/profile"
          class="flex items-center gap-1.5 text-sm text-glow-primary-600 hover:text-glow-primary-700 font-medium transition-colors"
        >
          <ExternalLink class="w-4 h-4" />
          Quản lý địa chỉ
        </NuxtLink>
      </div>
    </div>

    <!-- Form nhập thủ công -->
    <div v-if="showForm" class="space-y-4 mt-2">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-gray-700">Nhập địa chỉ mới</p>
        <button
          v-if="addresses?.length"
          @click="showForm = false"
          class="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ← Dùng địa chỉ đã lưu
        </button>
      </div>

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
          placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
          rows="3"
          class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-glow-primary-200 focus:border-glow-primary-400 outline-none transition-all resize-none"
        />
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="() => { emit('update:hasContactInfo', true); showForm = false }"
          :disabled="!isValid"
          class="flex items-center gap-2 px-5 py-2.5 bg-glow-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-glow-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Check class="w-4 h-4" />
          Dùng địa chỉ này
        </button>

        <!-- Nút tạo địa chỉ mới và lưu vào hệ thống -->
        <NuxtLink
to="/profile"
          class="flex items-center gap-2 px-5 py-2.5 border border-glow-primary-300 text-glow-primary-600 text-sm font-semibold rounded-xl hover:bg-glow-primary-50 transition-all"
        >
          <Plus class="w-4 h-4" />
          Lưu địa chỉ mới
        </NuxtLink>
      </div>
    </div>
  </div>
</template>