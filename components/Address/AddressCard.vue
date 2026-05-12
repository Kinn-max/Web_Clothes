<script setup lang="ts">
import type { Address } from '@/types/address'
import {
  User, Phone, MapPin, Home, Building2,
  Star, Pencil, Trash2, MoreVertical, Navigation
} from 'lucide-vue-next'
import type { Component } from 'vue'

const props = defineProps<{ address: Address }>()

const emit = defineEmits<{
  edit: [id: number]       
  delete: [id: number]     
  setDefault: [id: number] 
}>()

const showMenu = ref(false)
const toggleMenu = () => { showMenu.value = !showMenu.value }
const closeMenu = () => { showMenu.value = false }

const handleEdit = () => { emit('edit', props.address.id); closeMenu() }
const handleDelete = () => {
  if (confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
    emit('delete', props.address.id)
  }
  closeMenu()
}
const handleSetDefault = () => { emit('setDefault', props.address.id); closeMenu() }

const typeIcon: Record<string, Component> = {
  'Nhà riêng': Home,
  'Cơ quan':   Building2, 
  'Khác':      MapPin,
}

const typeClass: Record<string, string> = {
  'Nhà riêng': 'bg-green-100 text-green-700',
  'Cơ quan':   'bg-purple-100 text-purple-700', 
  'Khác':      'bg-gray-100 text-gray-700',
}

// Click-outside directive — giữ nguyên
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.__click__ = (e: Event) => {
      if (!(el === e.target || el.contains(e.target))) binding.value()
    }
    document.addEventListener('click', el.__click__)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.__click__)
  },
}
</script>

<template>
  <div
    class="relative border rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    :class="address.is_default ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'"
  >
    <!-- Header: type badge + default badge + menu -->
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-center gap-2 flex-wrap">

        <span
          class="px-2 py-0.5 text-xs rounded-md font-medium flex items-center gap-1"
          :class="typeClass[address.address_type] ?? 'bg-gray-100 text-gray-700'"
        >
          <component :is="typeIcon[address.address_type] ?? MapPin" class="w-3 h-3" />
          {{ address.address_type }}
        </span>

        <!-- Default badge -->
        <span v-if="address.is_default"
          class="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-md font-medium flex items-center gap-1">
          <Star class="w-3 h-3" />
          Mặc định
        </span>
      </div>

      <!-- Dropdown menu -->
      <div class="relative">
        <button @click.stop="toggleMenu"
          class="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical class="w-5 h-5 text-gray-500" />
        </button>

        <div v-if="showMenu" v-click-outside="closeMenu"
          class="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">

          <button @click="handleEdit"
            class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
            <Pencil class="w-4 h-4" />
            Chỉnh sửa
          </button>

          <button v-if="!address.is_default" @click="handleSetDefault"
            class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
            <Star class="w-4 h-4" />
            Đặt làm mặc định
          </button>

          <button @click="handleDelete"
            class="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
            <Trash2 class="w-4 h-4" />
            Xóa địa chỉ
          </button>
        </div>
      </div>
    </div>

    <!-- Contact info -->
    <div class="space-y-1.5 text-sm">

      <div class="flex items-center gap-2">
        <User class="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span class="font-semibold text-gray-900">{{ address.full_name }}</span>
      </div>

      <div class="flex items-center gap-2">
        <Phone class="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span class="text-gray-600">{{ address.phone }}</span>
      </div>

      <div class="flex items-start gap-2">
        <MapPin class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <span class="text-gray-600 leading-snug">{{ address.address }}</span>
      </div>

      <div v-if="address.city || address.district || address.ward"
        class="flex items-center gap-2 text-xs text-gray-400 pl-6">
        {{ [address.ward, address.district, address.city].filter(Boolean).join(', ') }}
      </div>

      <div v-if="address.latitude && address.longitude"
        class="flex items-center gap-2 text-xs text-gray-400 pt-1">
        <Navigation class="w-3.5 h-3.5 flex-shrink-0" />
        {{ address.latitude.toFixed(5) }}, {{ address.longitude.toFixed(5) }}
      </div>
    </div>
  </div>
</template>