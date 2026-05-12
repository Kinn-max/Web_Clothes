<script setup lang="ts">
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { User, Mail, Phone, Save } from 'lucide-vue-next'

const nuxtApp  = useNuxtApp()
const db       = nuxtApp.$db as Firestore
const authStore = useAuthStore()
const queryClient = useQueryClient()

// ── Load profile từ Firestore ──────────────────────────────
const { data: profileData, isLoading } = useQuery({
  queryKey: ['profile', authStore.userId],
  queryFn:  async () => {
    const snap = await getDoc(doc(db, 'users', authStore.userId!))
    return snap.exists() ? snap.data() : null
  },
  enabled: computed(() => !!authStore.userId),
})

// ── Form state ─────────────────────────────────────────────
const profileForm = ref({ full_name: '', email: '', phone: '' })

// Sync data vào form khi load xong
watch(profileData, (data) => {
  if (data) {
    profileForm.value = {
      full_name: data.full_name ?? '',
      email:     data.email    ?? authStore.email ?? '',
      phone:     data.phone    ?? '',
    }
  }
}, { immediate: true })

// ── Validation ─────────────────────────────────────────────
const phoneError      = ref('')
const isSubmitting    = ref(false)
const toast = inject<(msg: string, type: 'success' | 'error') => void>('showToast')!

const validatePhone = () => {
  const p = profileForm.value.phone.trim()
  if (!p) { phoneError.value = ''; return true }
  if (!/^[0-9]{10,11}$/.test(p)) {
    phoneError.value = 'SĐT không hợp lệ (10–11 số)'
    return false
  }
  phoneError.value = ''
  return true
}

// ── Submit ─────────────────────────────────────────────────
const handleSubmit = async () => {
  if (!validatePhone()) return
  const userId = authStore.userId
  if (!userId) return

  isSubmitting.value = true
  try {
    await updateDoc(doc(db, 'users', userId), {
      full_name:  profileForm.value.full_name.trim(),
      phone:      profileForm.value.phone.trim() || '',
      updated_at: Date.now(),
    })

    // Làm mới cache profile
    queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    toast('Cập nhật thông tin thành công!', 'success')
  } catch (err: any) {
    toast(err.message || 'Lỗi cập nhật hồ sơ', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const getInitials = (name: string) =>
  name ? name.charAt(0).toUpperCase() : 'U'
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

    <!-- Avatar header -->
    <div class="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center gap-4">
      <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center
                  text-white text-2xl font-bold border-2 border-white/30">
        {{ getInitials(profileForm.full_name) }}
      </div>
      <div class="text-white min-w-0">
        <h2 class="text-lg font-bold truncate">{{ profileForm.full_name || 'User' }}</h2>
        <p class="text-blue-100 text-sm truncate">{{ profileForm.email }}</p>
      </div>
    </div>

    <!-- Form -->
    <div class="p-6">

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-4">

        <!-- Email — readonly -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <Mail class="w-4 h-4 text-gray-400" />
            Email
          </label>
          <input :value="profileForm.email" disabled
            class="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl
                   text-gray-400 cursor-not-allowed" />
        </div>

        <!-- Họ tên -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <User class="w-4 h-4 text-gray-400" />
            Họ và tên <span class="text-red-500">*</span>
          </label>
          <input v-model="profileForm.full_name" type="text" required
            class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl
                   focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>

        <!-- SĐT -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <Phone class="w-4 h-4 text-gray-400" />
            Số điện thoại
          </label>
          <input v-model="profileForm.phone" type="tel" @input="validatePhone"
            class="w-full px-3 py-2.5 text-sm border rounded-xl
                   focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            :class="phoneError ? 'border-red-400' : 'border-gray-300'" />
          <p v-if="phoneError" class="text-red-500 text-xs mt-1">{{ phoneError }}</p>
        </div>

        <!-- Submit -->
        <button type="submit" :disabled="isSubmitting || !!phoneError"
          class="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm
                 font-medium text-white bg-blue-600 hover:bg-blue-700
                 disabled:opacity-50 transition-colors">
          <span v-if="isSubmitting"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <Save v-else class="w-4 h-4" />
          {{ isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
      </form>
    </div>
  </div>
</template>