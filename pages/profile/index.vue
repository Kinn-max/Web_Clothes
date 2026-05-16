<script setup lang="ts">
import ProfileForm from '@/components/profile/ProfileForm.vue'
import AddressBook from '@/components/profile/AddressBook.vue'

const authStore = useAuthStore()

onMounted(() => {
  if (!authStore.isAuthenticated) navigateTo('/auth/login')
})

// Toast — provide xuống ProfileForm và AddressBook
const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

const showToast = (message: string, type: 'success' | 'error') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

provide('showToast', showToast)
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Thiết lập tài khoản</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-4">
          <ProfileForm />
        </div>
        <div class="lg:col-span-8">
          <AddressBook />
        </div>
      </div>

      <!-- Toast -->
      <Transition name="toast">
        <div v-if="toast.show"
          class="fixed bottom-6 right-6 px-5 py-3.5 rounded-xl shadow-xl z-50 flex items-center gap-3"
          :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
          <span class="text-lg">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
          <p class="text-sm font-medium">{{ toast.message }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>