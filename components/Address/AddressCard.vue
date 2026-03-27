<script setup lang="ts">
import type { Address }  from "../../@type/address";

const props = defineProps<{ address: Address }>();

const emit = defineEmits<{
  edit: [id: string];
  delete: [id: string];
  setDefault: [id: string];
}>();

const showMenu = ref(false);

const toggleMenu = () => { showMenu.value = !showMenu.value; };
const closeMenu = () => { showMenu.value = false; };

const handleEdit = () => { emit("edit", props.address.id); closeMenu(); };
const handleDelete = () => {
  if (confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
    emit("delete", props.address.id);
  }
  closeMenu();
};
const handleSetDefault = () => { emit("setDefault", props.address.id); closeMenu(); };

const typeIcon: Record<string, string> = {
  "Nhà riêng": "🏠",
  "Văn phòng": "🏢",
  "Khác": "📍",
};
const typeClass: Record<string, string> = {
  "Nhà riêng": "bg-green-100 text-green-700",
  "Văn phòng": "bg-purple-100 text-purple-700",
  "Khác": "bg-gray-100 text-gray-700",
};

// Click-outside directive
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.__click__ = (e: Event) => {
      if (!(el === e.target || el.contains(e.target))) binding.value();
    };
    document.addEventListener("click", el.__click__);
  },
  unmounted(el: any) {
    document.removeEventListener("click", el.__click__);
  },
};
</script>

<template>
  <div
    class="relative border rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    :class="address.is_default
      ? 'border-blue-400 bg-blue-50'
      : 'border-gray-200 bg-white'"
  >
    <!-- Header: type badge + default badge + menu -->
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-center gap-2 flex-wrap">
        <span
          class="px-2 py-0.5 text-xs rounded-md font-medium"
          :class="typeClass[address.address_type] ?? 'bg-gray-100 text-gray-700'"
        >
          {{ typeIcon[address.address_type] }} {{ address.address_type }}
        </span>
        <span
          v-if="address.is_default"
          class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-md font-medium"
        >
          ★ Mặc định
        </span>
      </div>

      <!-- Dropdown menu -->
      <div class="relative">
        <button
          @click.stop="toggleMenu"
          class="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </button>

        <div
          v-if="showMenu"
          v-click-outside="closeMenu"
          class="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden"
        >
          <button @click="handleEdit" class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Chỉnh sửa
          </button>

          <button
            v-if="!address.is_default"
            @click="handleSetDefault"
            class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            Đặt làm mặc định
          </button>

          <button
            @click="handleDelete"
            class="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Xóa địa chỉ
          </button>
        </div>
      </div>
    </div>

    <!-- Contact info -->
    <div class="space-y-1.5 text-sm">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <span class="font-semibold text-gray-900">{{ address.contact_name }}</span>
      </div>

      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
        <span class="text-gray-600">{{ address.phone }}</span>
      </div>

      <div class="flex items-start gap-2">
        <svg class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="text-gray-600 leading-snug">{{ address.detail_address }}</span>
      </div>

      <div v-if="address.latitude && address.longitude" class="flex items-center gap-2 text-xs text-gray-400 pt-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>
        {{ address.latitude.toFixed(5) }}, {{ address.longitude.toFixed(5) }}
      </div>
    </div>
  </div>
</template>