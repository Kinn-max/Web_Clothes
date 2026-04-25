<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuth } from "@/composables/useAuth";
definePageMeta({ layout: false }) 
type FormState = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const form = ref<FormState>({
  email: "",
  password: "",
  rememberMe: false,
});

const showPwd = ref(false);
const isSubmitting = ref(false);
const serverError = ref("");
const serverSuccess = ref("");

const { login, user } = useAuth();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const errors = computed(() => {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!form.value.email.trim()) e.email = "Vui lòng nhập email.";
  else if (!emailRegex.test(form.value.email)) e.email = "Email không hợp lệ.";
  if (!form.value.password) e.password = "Vui lòng nhập mật khẩu.";
  else if (form.value.password.length < 6) e.password = "Mật khẩu quá ngắn.";
  return e;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

async function onSubmit() {
  if (!isValid.value) return;

  try {
    isSubmitting.value = true;
    serverError.value = "";
    serverSuccess.value = "";

    await login({
      email: form.value.email,
      password: form.value.password,
    });

    serverSuccess.value = "Đăng nhập thành công! Đang chuyển hướng...";

    const stopWatch = watch(
      user,
      (currentUser) => {
        if (!currentUser) return;

        if (currentUser.role?.toLowerCase() === "admin") {
          navigateTo("/admin/dashboard");
        } else {
          navigateTo("/");
        }

        stopWatch();
      },
      { immediate: true }
    );

  } catch (error: any) {
    console.log(error);
    serverError.value = error.message || "Đăng nhập thất bại";
  } finally {
    isSubmitting.value = false;
  }
}

// async function onGoogle() {
//   try {
//     isSubmitting.value = true;
//     serverError.value = "";
//     // TODO: Implement Google OAuth
//     await new Promise((r) => setTimeout(r, 500));
//   } catch (error: any) {
//     serverError.value = "Đăng nhập Google thất bại.";
//   } finally {
//     isSubmitting.value = false;
//   }
// }
</script>

<template>
  <div class="auth">
    <div class="card">
      <header class="head">
        <div class="logo-circle">
          <svg
            class="logo-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1>Đăng nhập</h1>
        <p>Chào mừng bạn trở lại 👋</p>
      </header>

      <!-- Alerts -->
      <Transition name="alert">
        <div v-if="serverError" class="alert error">
          <svg
            class="alert-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {{ serverError }}
        </div>
      </Transition>

      <Transition name="alert">
        <div v-if="serverSuccess" class="alert success">
          <svg
            class="alert-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {{ serverSuccess }}
        </div>
      </Transition>

      <form @submit.prevent="onSubmit" novalidate class="form">
        <!-- Email -->
        <div class="field">
          <label for="email" class="label-with-icon">
            <svg
              class="label-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="4" width="18" height="16" rx="2"></rect>
              <path d="M3 6l9 6 9-6"></path>
            </svg>
            Email
          </label>
          <div class="input-wrapper">
            <input
              id="email"
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              :class="{ 'is-error': !!errors.email }"
              :disabled="isSubmitting"
            />
            <svg
              v-if="form.email && !errors.email"
              class="input-check"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <Transition name="error">
            <small v-if="errors.email" class="msg">{{ errors.email }}</small>
          </Transition>
        </div>

        <!-- Mật khẩu -->
        <div class="field">
          <div class="label-row">
            <label for="password" class="label-with-icon">
              <svg
                class="label-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Mật khẩu
            </label>
            <NuxtLink to="/auth/forgot" class="link">Quên mật khẩu?</NuxtLink>
          </div>

          <div class="password">
            <input
              :type="showPwd ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              autocomplete="current-password"
              placeholder="Nhập mật khẩu"
              :class="{ 'is-error': !!errors.password }"
              :disabled="isSubmitting"
            />
            <button
              type="button"
              class="toggle"
              @click="showPwd = !showPwd"
              :aria-label="showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              :disabled="isSubmitting"
            >
              <svg
                v-if="!showPwd"
                class="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                class="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94"
                />
                <path
                  d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                />
                <path d="M14.12 15.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>

          <Transition name="error">
            <small v-if="errors.password" class="msg">{{
              errors.password
            }}</small>
          </Transition>
        </div>

        <label class="remember">
          <input
            type="checkbox"
            v-model="form.rememberMe"
            :disabled="isSubmitting"
          />
          <span>Ghi nhớ đăng nhập</span>
        </label>

        <button
          type="submit"
          class="auth-btn"
          :disabled="!isValid || isSubmitting"
        >
          <svg v-if="isSubmitting" class="spinner" viewBox="0 0 24 24">
            <circle
              class="spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            />
          </svg>
          <span>{{ isSubmitting ? "Đang đăng nhập..." : "Đăng nhập" }}</span>
        </button>

        <div class="or"><span>hoặc</span></div>

        <button
          type="button"
          class="oauth-btn"
          @click=""
          :disabled="isSubmitting"
        >
          <img
            class="oauth-icon"
            src="/images/google.png"
            alt=""
            decoding="async"
          />
          <span>Đăng nhập với Google</span>
        </button>

        <p class="muted center">
          Chưa có tài khoản?
          <NuxtLink to="/auth/register" class="link">Tạo tài khoản</NuxtLink>
        </p>
      </form>
    </div>

    <!-- Decorative Background Elements -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --bg: #f6f7f8;
  --card: #fff;
  --text: #0f172a;
  --text-2: #64748b;
  --border: #e5e7eb;
  --border-hover: #cfd6e1;
  --primary: #4f46e5;
  --primary-2: #4338ca;
  --focus: rgba(79, 70, 229, 0.18);
  --error: #dc2626;
  --success: #059669;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b0d11;
    --card: #111418;
    --text: #e5e7eb;
    --text-2: #94a3b8;
    --border: #1f2937;
    --border-hover: #2b3444;
    --focus: rgba(99, 102, 241, 0.25);
  }
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
}

.auth {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}

/* Background Decoration */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.1),
    rgba(139, 92, 246, 0.1)
  );
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation-delay: -7s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 10%;
  animation-delay: -14s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.card {
  width: 100%;
  max-width: 460px;
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 36px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.head {
  text-align: center;
  margin-bottom: 28px;
}

.logo-circle {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #ec4899, #a855f7);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.logo-icon {
  width: 36px;
  height: 36px;
  color: white;
}

.head h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #ec4899, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.head p {
  margin: 0;
  color: var(--text-2);
  font-size: 15px;
}

/* Alert Styles */
.alert {
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 14px;
  margin: 0 0 20px;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.alert.error {
  color: var(--error);
  background: #fee2e2;
  border-color: #fecaca;
}

.alert.success {
  color: var(--success);
  background: #d1fae5;
  border-color: #a7f3d0;
}

/* Alert Transitions */
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.alert-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.form {
  display: grid;
  gap: 20px;
}

.field {
  display: grid;
  gap: 10px;
}

.label-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.label-icon {
  width: 18px;
  height: 18px;
  color: var(--primary);
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
  transition: color 0.2s;
}

.link:hover {
  color: var(--primary-2);
  text-decoration: underline;
}

.input-wrapper {
  position: relative;
}

.field input[type="text"],
.field input[type="email"],
.field input[type="password"] {
  width: 100%;
  padding: 13px 40px 13px 16px;
  border: 2px solid var(--border);
  border-radius: 14px;
  background: transparent;
  color: inherit;
  outline: none;
  font-size: 15px;
  transition: all 0.2s ease;
}

.field input:hover:not(:disabled) {
  border-color: var(--border-hover);
}

.field input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px var(--focus);
  background: var(--card);
}

.field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-check {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--success);
  pointer-events: none;
}

.is-error {
  border-color: var(--error) !important;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
}

.msg {
  color: var(--error);
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.msg::before {
  content: "⚠";
}

/* Error Transition */
.error-enter-active,
.error-leave-active {
  transition: all 0.2s ease;
}

.error-enter-from,
.error-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.password {
  position: relative;
}

.toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 10px;
  transition: all 0.2s;
}

.toggle .icon {
  width: 20px;
  height: 20px;
  display: block;
}

.toggle:hover:not(:disabled) {
  color: var(--text);
  background: rgba(0, 0, 0, 0.05);
}

.toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remember {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text-2);
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.remember input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
  cursor: pointer;
}

.remember input:disabled {
  cursor: not-allowed;
}

.auth-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 50px;
  padding: 14px 20px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #ec4899, #a855f7);
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
  position: relative;
  overflow: hidden;
}

.auth-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0)
  );
  opacity: 0;
  transition: opacity 0.2s;
}

.auth-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.auth-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(79, 70, 229, 0.4);
}

.auth-btn:active:not(:disabled) {
  transform: translateY(0);
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

/* Spinner Animation */
.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.spinner-circle {
  stroke-dasharray: 60;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.or {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-2);
  font-size: 13px;
  margin: 4px 0;
}

.or::before,
.or::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--border);
}

.oauth-btn {
  width: 100%;
  min-height: 50px;
  padding: 12px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 14px;
  border: 2px solid var(--border);
  background: #fff;
  color: #111;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.oauth-btn:hover:not(:disabled) {
  border-color: var(--primary);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.oauth-btn:active:not(:disabled) {
  transform: translateY(0);
}

.oauth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.oauth-icon {
  width: 22px;
  height: 22px;
  display: block;
  object-fit: contain;
  border-radius: 4px;
}

@media (prefers-color-scheme: dark) {
  .oauth-btn {
    background: #1a1d24;
    color: #e5e7eb;
  }
}

.muted {
  color: var(--text-2);
  font-size: 14px;
  margin: 8px 0 0;
}

.center {
  text-align: center;
}

@media (max-width: 520px) {
  .card {
    padding: 28px 24px;
    border-radius: 20px;
  }

  .head h1 {
    font-size: 24px;
  }

  .logo-circle {
    width: 64px;
    height: 64px;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
  }
}
</style>
