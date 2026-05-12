<script setup lang="ts">
const route = useRoute()
const { showNotification } = useNotification()
const {
  bodyProfile, avatar, session,
  faceGlbUrl, mergedGlbUrl, fitAssessment,
  loadingProfile, loadingAvatar, loadingTryon, loadingFace, loadingFit,
  error,
  saveBodyProfile, generateAvatar, startTryon,
  mergeFaceBody, getFitAssessment, reset,
} = usePhotoTryon()

// ── Step state ────────────────────────────────────────────────────────────
// 1 = nhập số đo | 1.5 = selfie | 2 = xem avatar | 3 = chọn garment + tryon
type Step = 1 | 1.5 | 2 | 3
const step = ref<Step>(1)

// Phase index cho step indicator (1=measure, 2=avatar, 3=tryon)
const phaseIndex = computed(() => {
  if (step.value === 1) return 1
  if (step.value === 1.5 || step.value === 2) return 2
  return 3
})

// ── Form ──────────────────────────────────────────────────────────────────
const form = ref({
  gender: 'female' as 'male' | 'female',
  height_cm: 165,
  weight_kg: 55,
  chest_cm: 88,
  waist_cm: 68,
  hip_cm: 94,
})

// ── Garment (có thể nhận từ query param khi navigate từ shop) ────────────
const garmentId = ref<number | null>(
  route.query.garment_id ? Number(route.query.garment_id) : null
)
const productName = ref<string>(route.query.product_name as string ?? '')
const productId   = ref<string>(route.query.product_id as string ?? '')

// Avatar GLB URL để truyền vào viewer — ưu tiên merged > body only
const avatarGlbUrl = computed(() =>
  mergedGlbUrl.value || avatar.value?.glb_url || ''
)
const garmentGlbUrl = computed(() => session.value?.drape_glb_url ?? '')

// Đang merge face vào body (sau khi avatar ready)
const merging = ref(false)

const measurements = computed(() =>
  avatar.value?.measurements ?? null
)

// ── Loading tổng ─────────────────────────────────────────────────────────
const isLoading = computed(() =>
  loadingProfile.value || loadingAvatar.value || loadingTryon.value ||
  loadingFace.value || loadingFit.value || merging.value
)

// ── Step 1: Submit body profile → chuyển sang selfie ─────────────────────
async function handleSaveProfile() {
  try {
    await saveBodyProfile(form.value)
    showNotification('Đã lưu', 'Tiếp theo: chụp ảnh selfie (tùy chọn)', 'success')
    step.value = 1.5
  } catch (e: any) {
    showNotification('Lỗi', error.value ?? e?.message, 'error')
  }
}

// ── Step 1.5: Selfie ready → generate avatar (face đã được lưu trong composable) ─
async function handleFaceReady(_payload: { faceGlbUrl: string }) {
  showNotification('Thành công', 'Đã xử lý khuôn mặt, đang tạo avatar…', 'success')
  await proceedToAvatar()
}

async function handleSkipSelfie() {
  await proceedToAvatar()
}

async function proceedToAvatar() {
  if (!bodyProfile.value?.id) return
  try {
    await generateAvatar(bodyProfile.value.id)
    step.value = 2
  } catch (e: any) {
    showNotification('Lỗi', error.value ?? e?.message, 'error')
  }
}

// Khi avatar chuyển sang ready và đã có faceGlbUrl → tự động merge
watch(
  () => [avatar.value?.status, avatar.value?.id, faceGlbUrl.value],
  async ([status, avatarId, face]) => {
    if (
      status === 'ready' &&
      typeof avatarId === 'number' &&
      typeof face === 'string' && face &&
      !mergedGlbUrl.value &&
      !merging.value
    ) {
      try {
        merging.value = true
        await mergeFaceBody(avatarId, face)
        showNotification('Hoàn tất', 'Đã ghép khuôn mặt vào avatar', 'success')
      } catch (e: any) {
        showNotification('Lỗi', error.value ?? e?.message ?? 'Không gộp được khuôn mặt', 'error')
      } finally {
        merging.value = false
      }
    }
  }
)

// ── Step 3: Try-on + fit assessment song song ────────────────────────────
async function handleTryon() {
  if (!avatar.value?.id || !garmentId.value) return
  const tryonPromise = startTryon(avatar.value.id, garmentId.value)
  const fitPromise = bodyProfile.value?.id
    ? getFitAssessment(bodyProfile.value.id, garmentId.value).catch(() => null)
    : Promise.resolve(null)
  try {
    await tryonPromise
    await fitPromise
    showNotification('Thành công', 'Đã mặc thử trang phục!', 'success')
  } catch (e: any) {
    showNotification('Lỗi', error.value ?? e?.message, 'error')
  }
}

function handleViewerReady() {
  if (garmentId.value && step.value === 2) step.value = 3
}

function handleTrySize(size: string) {
  showNotification('Gợi ý size', `Hãy chọn size ${size} từ trang sản phẩm`, 'info')
}

const avatarStatusText = computed(() => {
  if (!avatar.value) return ''
  if (avatar.value.status === 'processing') return 'Đang xử lý avatar…'
  if (avatar.value.status === 'failed') return 'Tạo avatar thất bại'
  return 'Avatar sẵn sàng'
})

const measureFields = [
  { key: 'height_cm', label: 'Chiều cao', unit: 'cm', min: 140, max: 220 },
  { key: 'weight_kg', label: 'Cân nặng',  unit: 'kg', min: 35,  max: 150, step: 0.5 },
  { key: 'chest_cm',  label: 'Ngực',      unit: 'cm', min: 70,  max: 130 },
  { key: 'waist_cm',  label: 'Eo',        unit: 'cm', min: 55,  max: 120 },
  { key: 'hip_cm',    label: 'Hông',      unit: 'cm', min: 70,  max: 140 },
]

const measureKeys = [
  { key: 'height', label: 'Cao' },
  { key: 'chest',  label: 'Ngực' },
  { key: 'waist',  label: 'Eo' },
  { key: 'hip',    label: 'Hông' },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50">
    <BaseNotification />

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div class="container mx-auto px-4 h-16 flex items-center gap-4 max-w-6xl">
        <NuxtLink
          :to="productId ? `/shop/products/${productId}` : '/shop'"
          class="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-gray-200 text-gray-600 hover:border-violet-400 hover:text-violet-600 transition-colors flex-shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </NuxtLink>
        <div class="flex-1 min-w-0">
          <h1 class="font-bold text-gray-900 text-lg leading-none">Phòng thử 3D</h1>
          <p v-if="productName" class="text-xs text-gray-500 truncate mt-0.5">{{ productName }}</p>
        </div>

        <!-- Step indicator -->
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <template v-for="n in 3" :key="n">
            <div :class="[
              'w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all',
              phaseIndex === n
                ? 'bg-violet-600 text-white'
                : phaseIndex > n
                  ? 'bg-violet-100 text-violet-600'
                  : 'bg-gray-100 text-gray-400'
            ]">{{ n }}</div>
            <div v-if="n < 3" class="w-4 h-px" :class="phaseIndex > n ? 'bg-violet-300' : 'bg-gray-200'" />
          </template>
        </div>

        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 rounded-full flex-shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
          <span class="text-xs font-semibold text-violet-700">SMPL-X 3D</span>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6 max-w-6xl">

      <!-- ── STEP 1: Nhập số đo ─────────────────────────────────────────── -->
      <div v-if="step === 1" class="max-w-lg mx-auto">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <h2 class="font-bold text-gray-900 text-lg">Nhập số đo cơ thể</h2>
            <p class="text-sm text-gray-500 mt-1">Hệ thống sẽ tạo avatar 3D chính xác từ số đo của bạn</p>
          </div>

          <!-- Gender -->
          <div>
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Giới tính</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="g in ['female', 'male']" :key="g"
                @click="form.gender = g as any"
                :class="[
                  'py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                  form.gender === g
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                ]">
                {{ g === 'female' ? '👩 Nữ' : '👨 Nam' }}
              </button>
            </div>
          </div>

          <!-- Measurements grid -->
          <div class="grid grid-cols-2 gap-4">
            <div v-for="field in measureFields" :key="field.key">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                {{ field.label }} <span class="normal-case font-normal text-gray-400">(cm / kg)</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="(form as any)[field.key]"
                  type="number"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step ?? 1"
                  class="w-full h-11 px-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-violet-400 outline-none text-gray-900 font-medium transition-colors"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                  {{ field.unit }}
                </span>
              </div>
            </div>
          </div>

          <button
            @click="handleSaveProfile"
            :disabled="isLoading"
            :class="[
              'w-full h-12 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2',
              !isLoading
                ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.01]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]">
            <span v-if="!isLoading">Tạo Avatar 3D →</span>
            <span v-else class="flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              Đang xử lý…
            </span>
          </button>
        </div>
      </div>

      <!-- ── STEP 1.5: Selfie (optional) ──────────────────────────────── -->
      <div v-if="step === 1.5" class="max-w-lg mx-auto space-y-4">
        <SelfieUpload
          :loading="loadingFace || loadingAvatar"
          @face-ready="handleFaceReady"
          @skip="handleSkipSelfie"
          @error="(msg: string) => showNotification('Lỗi', msg, 'error')" />

        <button
          type="button"
          @click="step = 1"
          class="w-full h-10 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors">
          ← Quay lại số đo
        </button>
      </div>

      <!-- ── STEP 2 + 3: Viewer + Garment ──────────────────────────────── -->
      <div v-if="step === 2 || step === 3" class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Left: Viewer -->
        <div class="lg:col-span-8">
          <!-- Avatar processing state -->
          <div v-if="avatar?.status === 'processing'"
            class="mb-3 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
            <span class="w-3 h-3 rounded-full bg-amber-400 animate-pulse flex-shrink-0"/>
            Đang tạo avatar 3D — thường mất 30–60 giây…
          </div>

          <!-- Merging face state -->
          <div v-if="merging"
            class="mb-3 flex items-center gap-2 text-sm text-violet-600 bg-violet-50 border border-violet-100 rounded-xl px-4 py-2.5">
            <span class="w-3 h-3 rounded-full bg-violet-400 animate-pulse flex-shrink-0"/>
            Đang ghép khuôn mặt vào avatar…
          </div>

          <!-- 3D Viewer component -->
          <AvatarViewer3D
            :avatar-url="avatarGlbUrl"
            :garment-url="garmentGlbUrl"
            :height="520"
            :auto-rotate="true"
            @ready="handleViewerReady"
            @error="(e:Error) => showNotification('Lỗi viewer', e.message, 'error')"
          />

          <!-- Measurements bar -->
          <div v-if="measurements"
            class="mt-3 grid grid-cols-4 gap-2">
            <div v-for="m in measureKeys" :key="m.key"
              class="bg-white rounded-xl border border-gray-100 px-3 py-2.5 text-center">
              <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{{ m.label }}</p>
              <p class="text-base font-bold text-gray-900 mt-0.5">
                {{ (measurements as any)[m.key]?.toFixed(1) }}
                <span class="text-xs font-normal text-gray-400">cm</span>
              </p>
            </div>
          </div>

          <!-- Fit assessment (sau khi try-on hoàn tất) -->
          <FitAssessmentCard
            v-if="fitAssessment && step === 3"
            :result="fitAssessment"
            class="mt-4"
            @try-size="handleTrySize" />
        </div>

        <!-- Right: Controls -->
        <div class="lg:col-span-4 space-y-4">

          <!-- Avatar status card -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-gray-900">Avatar của bạn</h3>
              <span :class="[
                'text-xs font-semibold px-2.5 py-1 rounded-full',
                avatar?.status === 'ready'
                  ? 'bg-green-100 text-green-700'
                  : avatar?.status === 'processing'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
              ]">{{ avatarStatusText }}</span>
            </div>

            <!-- Face status chip -->
            <div v-if="faceGlbUrl"
              class="flex items-center gap-2 px-3 py-2 bg-violet-50 rounded-xl border border-violet-100 text-xs">
              <span class="text-violet-500">😊</span>
              <span class="text-violet-700 font-semibold">
                {{ mergedGlbUrl ? 'Khuôn mặt đã ghép' : 'Đã có khuôn mặt — chờ avatar' }}
              </span>
            </div>

            <button
              @click="step = 1; reset()"
              class="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors">
              ← Cập nhật số đo
            </button>
          </div>

          <!-- Garment selector (khi step = 3) -->
          <div v-if="step === 3" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <h3 class="font-bold text-gray-900">Thử trang phục</h3>

            <div v-if="productName"
              class="flex items-center gap-2 p-3 bg-violet-50 rounded-xl border border-violet-100">
              <div class="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs text-violet-500 font-semibold">Sản phẩm đã chọn</p>
                <p class="text-sm font-bold text-gray-900 truncate">{{ productName }}</p>
              </div>
            </div>

            <p v-else class="text-sm text-gray-500">
              Chọn sản phẩm từ
              <NuxtLink to="/shop" class="text-violet-600 font-semibold hover:underline">cửa hàng</NuxtLink>
              để thử đồ
            </p>

            <button
              v-if="garmentId && avatar?.status === 'ready'"
              @click="handleTryon"
              :disabled="loadingTryon"
              :class="[
                'w-full h-12 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2',
                !loadingTryon
                  ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.01]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              ]">
              <span v-if="!loadingTryon">
                <svg class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Mặc thử 3D
              </span>
              <span v-else class="flex items-center gap-2">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Đang xử lý…
              </span>
            </button>
          </div>

          <!-- Tip card -->
          <div class="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl border border-violet-100 p-4">
            <p class="text-xs font-bold text-violet-700 mb-2">💡 Mẹo sử dụng</p>
            <ul class="text-xs text-gray-600 space-y-1.5 list-none">
              <li>• Kéo để xoay avatar 360°</li>
              <li>• Scroll để zoom in/out</li>
              <li>• Nút 🔄 để tự động xoay</li>
              <li>• Toggle layer để ẩn/hiện trang phục</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>