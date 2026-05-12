<script setup lang="ts">
import { useAbout } from '@/composables/useAbout'
import type { Counter } from '@/types/about'

definePageMeta({ title: 'Giới thiệu - GlowUp' })

const { useGetAboutContent } = useAbout()
const { data: about, isLoading } = useGetAboutContent()

// Counters với display riêng cho animation
const counters = ref<(Counter & { display: number })[]>([])

watch(about, (data) => {
  if (!data?.counters) return
  counters.value = data.counters.map(c => ({ ...c, display: 0 }))
}, { immediate: true })

function animateCount(item: Counter & { display: number }, duration = 1200) {
  const end = item.value
  const startTime = performance.now()
  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1)
    item.display = Math.floor(progress * end)
    if (progress < 1) requestAnimationFrame(step)
    else item.display = end
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  const el = document.querySelector('#achievements')
  if (!el) return
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        counters.value.forEach(c => animateCount(c))
        obs.disconnect()
      }
    })
  }, { threshold: 0.3 })
  obs.observe(el)
})
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
    <div class="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
  </div>

  <template v-else-if="about">
    <!-- HERO — từ Firestore -->
    <section class="relative w-full">
      <div
        class="h-[320px] md:h-[420px] bg-center bg-cover flex items-center"
        :style="`background-image: linear-gradient(rgba(6,11,18,0.25), rgba(6,11,18,0.25)), url('${about.hero.image}');`"
      >
        <div class="w-full">
          <div class="container mx-auto px-4 py-20 text-center text-white">
            <h1 class="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight">
              {{ about.hero.title }}
            </h1>
            <p class="max-w-3xl mx-auto text-sm md:text-lg opacity-90">
              {{ about.hero.subtitle }}
            </p>
            <div class="mt-6 flex items-center justify-center gap-4">
              <NuxtLink to="/contact" class="px-6 py-2 bg-white text-glow-primary-600 rounded-md font-semibold shadow">
                Nhận tư vấn miễn phí
              </NuxtLink>
              <NuxtLink to="/shop" class="px-6 py-2 border border-white/40 rounded-md">
                Khám phá sản phẩm
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-4 py-12">
      <!-- WHO WE ARE — tĩnh, không cần Firestore -->
      <div class="relative py-8">
        <div class="absolute -left-8 top-1/2 transform -translate-y-1/2 w-32 h-32 bg-glow-primary-100 rounded-full opacity-30 blur-2xl hidden lg:block" />
        <div class="absolute -right-8 top-1/3 w-40 h-40 bg-glow-primary-100 rounded-full opacity-20 blur-3xl hidden lg:block" />
        <div class="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 class="text-2xl font-semibold mb-4 text-glow-primary-600">Chúng tôi là ai</h2>
            <p class="text-gray-700 leading-relaxed mb-4">
              GlowUp hoạt động trong lĩnh vực bán lẻ mỹ phẩm và chăm sóc da trực tuyến. Với hơn 8 năm kinh nghiệm,
              chúng tôi phục vụ hàng nghìn khách hàng trong nước và mở rộng hợp tác với nhiều thương hiệu uy tín.
            </p>
            <ul class="grid gap-3 sm:grid-cols-2 mt-6 text-gray-600">
              <li class="flex items-start gap-3 p-2 rounded-lg hover:bg-glow-primary-50 transition-colors">
                <span class="mt-1 text-glow-primary-600 font-bold">✓</span>
                <span>Chính hãng, kiểm định nguồn gốc</span>
              </li>
              <li class="flex items-start gap-3 p-2 rounded-lg hover:bg-glow-primary-50 transition-colors">
                <span class="mt-1 text-glow-primary-600 font-bold">✓</span>
                <span>Tư vấn chuyên sâu, hỗ trợ đổi trả</span>
              </li>
              <li class="flex items-start gap-3 p-2 rounded-lg hover:bg-glow-primary-50 transition-colors">
                <span class="mt-1 text-glow-primary-600 font-bold">✓</span>
                <span>Giao hàng nhanh, đóng gói an toàn</span>
              </li>
              <li class="flex items-start gap-3 p-2 rounded-lg hover:bg-glow-primary-50 transition-colors">
                <span class="mt-1 text-glow-primary-600 font-bold">✓</span>
                <span>Cam kết trải nghiệm khách hàng 5⭐</span>
              </li>
            </ul>
          </div>
          <div class="relative">
            <div class="absolute -inset-4 bg-gradient-to-r from-glow-primary-100 to-transparent rounded-xl opacity-50 blur-lg hidden md:block" />
            <div class="relative rounded-xl overflow-hidden shadow-lg border border-glow-primary-100">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80"
                alt="team"
                class="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- TIMELINE — từ Firestore -->
      <div class="mt-12">
        <h2 class="text-2xl font-semibold mb-6">Câu chuyện hình thành</h2>
        <div class="relative">
          <div class="border-l border-gray-200 absolute h-full left-4 md:left-1/2 transform md:-translate-x-1/2" />
          <ol class="space-y-8 md:w-3/4 md:mx-auto">
            <li
              v-for="(item, i) in about.timeline"
              :key="item.year"
              class="flex items-start md:items-center gap-4"
              :class="i % 2 === 1 ? 'md:flex-row-reverse' : ''"
            >
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-full bg-glow-primary-600 text-white flex items-center justify-center text-xs font-bold">
                  {{ item.year }}
                </div>
              </div>
              <div class="bg-white border rounded-lg p-4 shadow-sm w-full">
                <h3 class="font-semibold">{{ item.title }}</h3>
                <p class="text-gray-600 mt-2">{{ item.content }}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <!-- VISION / MISSION / VALUES — tĩnh -->
      <div class="mt-12 grid md:grid-cols-3 gap-6">
        <div class="p-6 bg-white rounded-xl shadow-sm text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-md bg-glow-primary-50 mb-4">
            <svg class="w-6 h-6 text-glow-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" />
            </svg>
          </div>
          <h4 class="font-semibold">Tầm nhìn</h4>
          <p class="text-gray-600 mt-2">Trở thành thương hiệu tiên phong trong chăm sóc sắc đẹp an toàn và bền vững tại khu vực.</p>
        </div>
        <div class="p-6 bg-white rounded-xl shadow-sm text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-md bg-glow-primary-50 mb-4">
            <svg class="w-6 h-6 text-glow-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 class="font-semibold">Sứ mệnh</h4>
          <p class="text-gray-600 mt-2">Mang đến sản phẩm chất lượng, minh bạch nguồn gốc và dịch vụ tận tâm cho mọi khách hàng.</p>
        </div>
        <div class="p-6 bg-white rounded-xl shadow-sm text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-md bg-glow-primary-50 mb-4">
            <svg class="w-6 h-6 text-glow-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h4 class="font-semibold">Giá trị</h4>
          <p class="text-gray-600 mt-2">Minh bạch, Tin cậy, Chất lượng và Trải nghiệm khách hàng là trọng tâm của chúng tôi.</p>
        </div>
      </div>

      <!-- WHY CHOOSE US — tĩnh -->
      <div class="mt-12">
        <h2 class="text-2xl font-semibold mb-6">Lợi thế của chúng tôi</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="p-4 bg-white border rounded-lg">
            <h5 class="font-semibold">Sản phẩm chính hãng</h5>
            <p class="text-gray-600 mt-2">Kiểm duyệt nghiêm ngặt, đảm bảo nguồn gốc và chất lượng.</p>
          </div>
          <div class="p-4 bg-white border rounded-lg">
            <h5 class="font-semibold">Tư vấn chuyên sâu</h5>
            <p class="text-gray-600 mt-2">Đội ngũ chuyên môn hỗ trợ lựa chọn sản phẩm phù hợp.</p>
          </div>
          <div class="p-4 bg-white border rounded-lg">
            <h5 class="font-semibold">Giao hàng nhanh</h5>
            <p class="text-gray-600 mt-2">Đóng gói an toàn và giao nhận nhanh chóng.</p>
          </div>
        </div>
      </div>

      <!-- ACHIEVEMENTS / COUNTERS — từ Firestore + animated -->
      <div id="achievements" class="mt-12 bg-glow-primary-50 rounded-xl p-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div v-for="c in counters" :key="c.id" class="p-4">
            <div class="text-3xl font-bold text-glow-primary-600">{{ c.display }}</div>
            <div class="text-sm text-gray-700 mt-1">{{ c.label }}</div>
          </div>
        </div>
      </div>

      <!-- TEAM — từ Firestore -->
      <div class="mt-12">
        <h2 class="text-2xl font-semibold mb-6">Đội ngũ</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="member in about.team"
            :key="member.name"
            class="bg-white border rounded-xl p-4 text-center shadow-sm"
          >
            <img
              :src="member.avatar"
              :alt="member.name"
              class="w-28 h-28 rounded-full object-cover mx-auto mb-3"
              loading="lazy"
            />
            <div class="font-semibold">{{ member.name }}</div>
            <div class="text-sm text-gray-500">{{ member.role }}</div>
          </div>
        </div>
      </div>

      <!-- WORK PROCESS — tĩnh -->
      <div class="mt-12">
        <h2 class="text-2xl font-semibold mb-6">Quy trình làm việc</h2>
        <div class="grid md:grid-cols-5 gap-4">
          <div v-for="(step, i) in [
            { label: 'Tư vấn',    desc: 'Lắng nghe nhu cầu khách hàng.' },
            { label: 'Kiểm duyệt', desc: 'Chọn sản phẩm phù hợp.' },
            { label: 'Đặt hàng',  desc: 'Xử lý đơn và đóng gói.' },
            { label: 'Giao hàng', desc: 'Giao nhanh, an toàn.' },
            { label: 'Hậu mãi',   desc: 'Hỗ trợ sau mua hàng.' },
          ]" :key="i" class="p-4 bg-white border rounded-lg text-center">
            <div class="font-bold text-glow-primary-600 mb-2">{{ i + 1 }}</div>
            <div class="font-semibold">{{ step.label }}</div>
            <p class="text-sm text-gray-600 mt-2">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <!-- PARTNERS — tĩnh -->
      <div class="mt-12">
        <h2 class="text-2xl font-semibold mb-6">Khách hàng & Đối tác</h2>
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
          <img v-for="url in [
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=60',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=60',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=60',
            'https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=600&q=60',
            'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=60',
            'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=60',
          ]" :key="url" :src="url" class="opacity-70 grayscale" alt="partner" loading="lazy" />
        </div>
      </div>

      <!-- COMMITMENTS — tĩnh -->
      <div class="mt-12 bg-white border rounded-xl p-6">
        <h2 class="text-2xl font-semibold mb-4">Cam kết với khách hàng</h2>
        <ul class="grid sm:grid-cols-2 gap-3 text-gray-700">
          <li>✔️ Sản phẩm chính hãng, nguồn gốc rõ ràng</li>
          <li>✔️ Đổi trả linh hoạt trong 7 ngày</li>
          <li>✔️ Hỗ trợ tư vấn miễn phí</li>
          <li>✔️ Bảo mật thông tin khách hàng</li>
        </ul>
      </div>

      <!-- FINAL CTA — tĩnh -->
      <div class="mt-12 bg-glow-primary-600 text-white rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-semibold">Sẵn sàng nâng tầm vẻ đẹp của bạn?</h3>
          <p class="opacity-90">Nhận tư vấn miễn phí từ chuyên gia của chúng tôi ngay hôm nay.</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/contact" class="px-6 py-2 bg-white text-glow-primary-600 rounded-md font-semibold">Liên hệ ngay</NuxtLink>
          <NuxtLink to="/shop" class="px-6 py-2 border border-white/30 rounded-md">Xem sản phẩm</NuxtLink>
        </div>
      </div>
    </section>
  </template>
</template>

<style scoped>
.bg-glow-primary-50  { background-color: #f0f9ff; }
.bg-glow-primary-100 { background-color: #e0f2fe; }
.bg-glow-primary-600 { background-color: #0b6fa3; }
.text-glow-primary-600 { color: #0b6fa3; }

@media (max-width: 640px) {
  .h-\[320px\] { height: 260px; }
}
</style>