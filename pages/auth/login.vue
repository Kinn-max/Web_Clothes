<template>
  <AuthCard title="Đăng nhập" subtitle="Chào mừng bạn trở lại!!!">
    <AuthAlert :message="serverError" type="error" />
    <AuthAlert :message="serverSuccess" type="success" />

    <form @submit.prevent="onSubmit" novalidate class="flex flex-col gap-5">
      <AuthEmailField v-model="form.email" :error="errors.email" :disabled="isSubmitting" />

      <AuthPasswordField v-model="form.password" :error="errors.password" :disabled="isSubmitting">
        <template #forgot>
          <NuxtLink to="/auth/forgot" class="text-xs font-semibold text-purple-500 hover:text-purple-700 transition-colors">
            Quên mật khẩu?
          </NuxtLink>
        </template>
      </AuthPasswordField>

      <label class="flex items-center gap-2.5 text-sm text-gray-500 cursor-pointer select-none">
        <input
          type="checkbox"
          v-model="form.rememberMe"
          :disabled="isSubmitting"
          class="w-4 h-4 accent-purple-500 cursor-pointer"
        />
        Ghi nhớ đăng nhập
      </label>

      <AuthSubmitBtn
        text="Đăng nhập"
        loading-text="Đang đăng nhập..."
        :loading="isSubmitting"
        :disabled="!isValid"
      />

      <div class="flex items-center gap-4 text-xs text-gray-400">
        <span class="flex-1 border-b border-gray-100" />
        hoặc
        <span class="flex-1 border-b border-gray-100" />
      </div>

      <button
        type="button"
        :disabled="isSubmitting"
        class="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-100 rounded-2xl text-sm font-semibold text-gray-700 bg-white hover:border-purple-300 hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        <img src="/images/google.png" alt="Google" class="w-5 h-5 object-contain" />
        Đăng nhập với Google
      </button>

      <p class="text-center text-sm text-gray-400">
        Chưa có tài khoản?
        <NuxtLink to="/auth/register" class="font-semibold text-purple-500 hover:text-purple-700 transition-colors">
          Tạo tài khoản
        </NuxtLink>
      </p>
    </form>
  </AuthCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';

definePageMeta({ layout: false });

const form = ref({ email: '', password: '', rememberMe: false });
const isSubmitting = ref(false);
const serverError = ref('');
const serverSuccess = ref('');

const { login, user } = useAuth();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const errors = computed(() => {
  const e: Record<string, string> = {};
  if (!form.value.email.trim()) e.email = 'Vui lòng nhập email.';
  else if (!emailRegex.test(form.value.email)) e.email = 'Email không hợp lệ.';
  if (!form.value.password) e.password = 'Vui lòng nhập mật khẩu.';
  else if (form.value.password.length < 6) e.password = 'Mật khẩu quá ngắn.';
  return e;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

function navigateByRole(role?: string) {
  navigateTo(role?.toLowerCase() === 'admin' ? '/admin/dashboard' : '/');
}

async function onSubmit() {
  if (!isValid.value) return;
  try {
    isSubmitting.value = true;
    serverError.value = '';
    serverSuccess.value = '';

    await login({ email: form.value.email, password: form.value.password });
    serverSuccess.value = 'Đăng nhập thành công! Đang chuyển hướng...';

    if (user.value) {
      navigateByRole(user.value.role);
      return;
    }

    const stopWatch = watch(user, (newUser) => {
      if (!newUser) return;
      stopWatch();
      navigateByRole(newUser.role);
    });
  } catch (error: any) {
    serverError.value = error.message || 'Đăng nhập thất bại';
  } finally {
    isSubmitting.value = false;
  }
}
</script>