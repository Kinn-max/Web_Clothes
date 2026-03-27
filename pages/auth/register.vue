<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuth } from "@/composables/useAuth";

type FormState = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

const form = ref<FormState>({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
});

const showPwd = ref(false);
const showPwd2 = ref(false);
const isSubmitting = ref(false);
const serverError = ref("");
const serverSuccess = ref("");

const { signup, loginWithGoogle } = useAuth();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const pwdStrength = computed(() => {
  const p = form.value.password;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
});

const errors = computed(() => {
  const e: Partial<Record<keyof FormState, string>> = {};

  if (!form.value.fullName.trim()) e.fullName = "Vui lòng nhập họ tên.";
  else if (form.value.fullName.trim().length < 2)
    e.fullName = "Họ tên quá ngắn.";

  if (!form.value.email.trim()) e.email = "Vui lòng nhập email.";
  else if (!emailRegex.test(form.value.email)) e.email = "Email không hợp lệ.";

  if (!form.value.password) e.password = "Vui lòng nhập mật khẩu.";
  else if (form.value.password.length < 8) e.password = "Tối thiểu 8 ký tự.";
  else if (pwdStrength.value < 3) e.password = "Mật khẩu còn yếu.";

  if (!form.value.confirmPassword)
    e.confirmPassword = "Vui lòng nhập lại mật khẩu.";
  else if (form.value.confirmPassword !== form.value.password)
    e.confirmPassword = "Mật khẩu không khớp.";

  if (!form.value.acceptTerms) e.acceptTerms = "Bạn cần đồng ý điều khoản.";
  return e;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

async function onSubmit() {
  if (!isValid.value) return;

  try {
    isSubmitting.value = true;
    serverError.value = "";
    serverSuccess.value = "";
    // console.log(form.value.email + form.value.fullName + form.value.password)
   const res = await signup({
      full_name: form.value.fullName,
      email: form.value.email,
      password: form.value.password,
    });
    serverSuccess.value = "Đăng ký thành công! Đang chuyển hướng...";

    setTimeout(() => {
      navigateTo("/auth/login");
    }, 1500);
  }catch (error: any) {
    console.log("ERROR:", error); 
    serverError.value = error.message || "Đăng ký thất bại";
  } finally {
    isSubmitting.value = false;
  }
}

async function onGoogle() {
  try {
    isSubmitting.value = true;
    serverError.value = "";

    await new Promise((r) => setTimeout(r, 500));
  } catch (error: any) {
    serverError.value = "Đăng ký Google thất bại.";
  } finally {
    isSubmitting.value = false;
  }
}
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h1>Tạo tài khoản</h1>
        <p>Đăng ký để trải nghiệm mua sắm mỹ phẩm 💄</p>
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
        <!-- Full Name -->
        <div class="field">
          <label for="fullName" class="label-with-icon">
            <svg
              class="label-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Họ và tên
          </label>
          <div class="input-wrapper">
            <input
              id="fullName"
              v-model.trim="form.fullName"
              type="text"
              autocomplete="name"
              placeholder="Nguyễn Văn A"
              :class="{ 'is-error': !!errors.fullName }"
              :disabled="isSubmitting"
            />
            <svg
              v-if="form.fullName && !errors.fullName"
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
            <small v-if="errors.fullName" class="msg">{{
              errors.fullName
            }}</small>
          </Transition>
        </div>

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
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 6l9 6 9-6" />
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

        <!-- Password -->
        <div class="field">
          <label for="password" class="label-with-icon">
            <svg
              class="label-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Mật khẩu
          </label>

          <div class="password">
            <input
              :type="showPwd ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              autocomplete="new-password"
              placeholder="Tối thiểu 8 ký tự"
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

          <!-- Strength Bar -->
          <Transition name="fade">
            <div class="strength" v-if="form.password">
              <div class="bar">
                <div
                  class="fill"
                  :class="{
                    strong: pwdStrength >= 4,
                    medium: pwdStrength >= 3 && pwdStrength < 4,
                    weak: pwdStrength < 3,
                  }"
                  :style="{ width: pwdStrength * 20 + '%' }"
                />
              </div>
              <div class="legend">
                <span :class="{ active: pwdStrength < 3 }">Yếu</span>
                <span :class="{ active: pwdStrength >= 3 && pwdStrength < 4 }"
                  >Trung bình</span
                >
                <span :class="{ active: pwdStrength >= 4 }">Mạnh</span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Confirm Password -->
        <div class="field">
          <label for="confirmPassword" class="label-with-icon">
            <svg
              class="label-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Nhập lại mật khẩu
          </label>

          <div class="password">
            <input
              :type="showPwd2 ? 'text' : 'password'"
              id="confirmPassword"
              v-model="form.confirmPassword"
              autocomplete="new-password"
              placeholder="Nhập lại mật khẩu"
              :class="{ 'is-error': !!errors.confirmPassword }"
              :disabled="isSubmitting"
            />
            <button
              type="button"
              class="toggle"
              @click="showPwd2 = !showPwd2"
              :aria-label="
                showPwd2 ? 'Ẩn nhập lại mật khẩu' : 'Hiện nhập lại mật khẩu'
              "
              :disabled="isSubmitting"
            >
              <svg
                v-if="!showPwd2"
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
            <small v-if="errors.confirmPassword" class="msg">{{
              errors.confirmPassword
            }}</small>
          </Transition>
        </div>

        <!-- Terms Checkbox -->
        <div class="field-checkbox">
          <label class="checkbox-label">
            <input
              id="terms"
              type="checkbox"
              v-model="form.acceptTerms"
              :disabled="isSubmitting"
            />
            <span class="checkbox-text">
              Tôi đồng ý với
              <NuxtLink to="/terms" class="link">Điều khoản</NuxtLink> &
              <NuxtLink to="/privacy" class="link">Chính sách bảo mật</NuxtLink>
            </span>
          </label>
          <Transition name="error">
            <small v-if="errors.acceptTerms" class="msg">{{
              errors.acceptTerms
            }}</small>
          </Transition>
        </div>

        <!-- Submit Button -->
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
          <span>{{
            isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"
          }}</span>
        </button>

        <div class="or"><span>hoặc</span></div>

       <button
          type="button"
          class="oauth-btn"
          @click="onGoogle" 
          :disabled="isSubmitting"
>
          <img
            class="oauth-icon"
            src="/images/google.png"
            alt=""
            decoding="async"
          />
          <span>Đăng ký với Google</span>
        </button>

        <p class="muted center">
          Đã có tài khoản?
          <NuxtLink to="/auth/login" class="link">Đăng nhập ngay</NuxtLink>
        </p>
      </form>
    </div>

    <!-- Decorative Background -->
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
    rgba(236, 72, 153, 0.1),
    rgba(139, 92, 246, 0.1)
  );
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 350px;
  height: 350px;
  top: -150px;
  right: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 250px;
  height: 250px;
  bottom: -80px;
  left: -80px;
  animation-delay: -7s;
}

.circle-3 {
  width: 180px;
  height: 180px;
  top: 50%;
  left: 5%;
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
  max-width: 480px;
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
  box-shadow: 0 8px 24px rgba(236, 72, 153, 0.3);
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
  gap: 18px;
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
}

.label-icon {
  width: 18px;
  height: 18px;
  color: var(--primary);
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

/* Password Strength */
.strength {
  margin-top: 8px;
}

.bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}

.fill {
  height: 100%;
  width: 0%;
  transition: width 0.3s ease;
  border-radius: 99px;
}

.fill.weak {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.fill.medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.fill.strong {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.legend {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-2);
  margin-top: 6px;
}

.legend span {
  opacity: 0.5;
  transition: all 0.2s;
}

.legend span.active {
  opacity: 1;
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Checkbox Field */
.field-checkbox {
  display: grid;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: var(--primary);
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-label input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-text {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.5;
}

.checkbox-text .link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.checkbox-text .link:hover {
  text-decoration: underline;
}

/* Auth Button */
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
  box-shadow: 0 8px 20px rgba(236, 72, 153, 0.3);
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
  box-shadow: 0 12px 28px rgba(236, 72, 153, 0.4);
}

.auth-btn:active:not(:disabled) {
  transform: translateY(0);
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

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

/* OR Divider */
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

/* OAuth Button */
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
  background: #1a1d24;
  color: #e5e7eb;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.oauth-btn:hover:not(:disabled) {
  border-color: var(--primary);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
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

/* Footer */
.muted {
  color: var(--text-2);
  font-size: 14px;
  margin: 8px 0 0;
}

.center {
  text-align: center;
}

.link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.link:hover {
  color: var(--primary-2);
  text-decoration: underline;
}

/* Responsive */
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

  .form {
    gap: 16px;
  }
}
</style>
