<script setup lang="ts">
import type { Address, AddressFormData } from '@/types/address'
import AddressCard from '@/components/Address/AddressCard.vue'
import AddressForm from '@/components/Address/AddressForm.vue'
import { Plus } from 'lucide-vue-next'

const {
  useGetAllAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} = useAddress()

const { data: addresses, isLoading } = useGetAllAddresses()
const { mutate: createAddress }      = useCreateAddress()
const { mutate: updateAddress }      = useUpdateAddress()
const { mutate: deleteAddress }      = useDeleteAddress()
const { mutate: setDefaultAddress }  = useSetDefaultAddress()

// inject toast từ parent (profile/index.vue)
const toast = inject<(msg: string, type: 'success' | 'error') => void>('showToast')!

// ── Form state ─────────────────────────────────────────────
const showAddressForm    = ref(false)
const editingAddressData = ref<Address | null>(null)

const openCreate = () => {
  editingAddressData.value = null
  showAddressForm.value    = true
}

const handleEdit = (id: number) => {
  const found = addresses.value?.find((a) => a.id === id)
  if (found) {
    editingAddressData.value = found
    showAddressForm.value    = true
  }
}

const handleClose = () => {
  showAddressForm.value    = false
  editingAddressData.value = null
}

// ── Mutations ──────────────────────────────────────────────
const handleSubmit = (data: AddressFormData) => {
  if (editingAddressData.value) {
    updateAddress(
      { addressId: editingAddressData.value.id, data },
      {
        onSuccess: () => { toast('Cập nhật địa chỉ thành công', 'success'); handleClose() },
        onError: (err: any) => toast(err.message || 'Lỗi cập nhật địa chỉ', 'error'),
      }
    )
  } else {
    createAddress(data, {
      onSuccess: () => { toast('Thêm địa chỉ mới thành công', 'success'); handleClose() },
      onError: (err: any) => toast(err.message || 'Lỗi thêm địa chỉ', 'error'),
    })
  }
}

const handleDelete = (id: number) =>
  deleteAddress(id, {
    onSuccess: () => toast('Đã xóa địa chỉ', 'success'),
    onError: (err: any) => toast(err.message || 'Lỗi xóa địa chỉ', 'error'),
  })

const handleSetDefault = (id: number) =>
  setDefaultAddress(id, {
    onSuccess: () => toast('Đã đặt làm địa chỉ mặc định', 'success'),
    onError: (err: any) => toast(err.message || 'Lỗi đặt mặc định', 'error'),
  })
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">

    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-gray-900">Sổ địa chỉ</h3>
      <button @click="openCreate"
        class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 border border-blue-200
               rounded-xl text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium">
        <Plus class="w-4 h-4" />
        Thêm địa chỉ
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <div class="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
    </div>

    <!-- Empty -->
    <div v-else-if="!addresses?.length"
      class="flex flex-col items-center justify-center py-16 bg-gray-50
             rounded-xl border-2 border-dashed border-gray-200">
      <h4 class="text-base font-semibold text-gray-700 mb-1">Chưa có địa chỉ nào</h4>
      <p class="text-sm text-gray-400 mb-5">Thêm địa chỉ để nhận hàng dễ dàng hơn.</p>
      <button @click="openCreate"
        class="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl
               hover:bg-blue-700 transition-colors">
        Thêm địa chỉ ngay
      </button>
    </div>

    <!-- List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AddressCard
        v-for="address in addresses"
        :key="address.id"
        :address="address"
        @edit="handleEdit"
        @delete="handleDelete"
        @set-default="handleSetDefault"
      />
    </div>

    <!-- Form Modal -->
    <AddressForm
      :is-open="showAddressForm"
      :editing-address="editingAddressData"
      @close="handleClose"
      @submit="handleSubmit"
    />
  </div>
</template>