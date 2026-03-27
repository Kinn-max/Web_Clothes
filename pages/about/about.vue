<script setup lang="ts">
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
definePageMeta({ title: 'Giới thiệu - GlowUp' })

// Counters data and animation
const counters = ref([
  { id: 'years', label: 'Năm kinh nghiệm', value: 8, display: 0 },
  { id: 'clients', label: 'Khách hàng', value: 1200, display: 0 },
  { id: 'projects', label: 'Dự án', value: 340, display: 0 },
  { id: 'partners', label: 'Đối tác', value: 85, display: 0 }
])

function animateCount(item, duration = 1200) {
  const start = 0
  const end = item.value
  const startTime = performance.now()

  function step(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    item.display = Math.floor(progress * (end - start) + start)
    if (progress < 1) requestAnimationFrame(step)
    else item.display = end
  }

  requestAnimationFrame(step)
}

onMounted(() => {
  // Use IntersectionObserver to start counters when visible
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
  <!-- HERO -->
  <section class="relative w-full">
    <div
      class="h-[320px] md:h-[420px] bg-center bg-cover flex items-center"
      style="background-image: linear-gradient(rgba(6,11,18,0.25), rgba(6,11,18,0.25)), url('https://images.unsplash.com/photo-1503342452485-86f7b0ff9f45?auto=format&fit=crop&w=1600&q=80');"
      aria-hidden="true"
    >
      <div class="w-full">
        <div class="container mx-auto px-4 py-20 text-center text-white">
          <h1 class="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight">GlowUp — Nâng tầm vẻ đẹp, tăng cường sự tự tin</h1>
          <p class="max-w-3xl mx-auto text-sm md:text-lg opacity-90">Chúng tôi cung cấp giải pháp chăm sóc da và mỹ phẩm chính hãng, tối ưu cho mọi loại da và phong cách sống — tận tâm, minh bạch và chuyên nghiệp.</p>
          <div class="mt-6 flex items-center justify-center gap-4">
            <NuxtLink to="/contact" class="px-6 py-2 bg-white text-glow-primary-600 rounded-md font-semibold shadow">Nhận tư vấn miễn phí</NuxtLink>
            <NuxtLink to="/shop" class="px-6 py-2 border border-white/40 rounded-md">Khám phá sản phẩm</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="container mx-auto px-4 py-12">
    <!-- WHO WE ARE (2-col) -->
    <div class="relative py-8">
      <!-- Decorative left element -->
      <div class="absolute -left-8 top-1/2 transform -translate-y-1/2 w-32 h-32 bg-glow-primary-100 rounded-full opacity-30 blur-2xl hidden lg:block"></div>
      
      <!-- Decorative right element -->
      <div class="absolute -right-8 top-1/3 w-40 h-40 bg-glow-primary-100 rounded-full opacity-20 blur-3xl hidden lg:block"></div>

      <div class="relative grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-glow-primary-600">Chúng tôi là ai</h2>
          <p class="text-gray-700 leading-relaxed mb-4">GlowUp hoạt động trong lĩnh vực bán lẻ mỹ phẩm và chăm sóc da trực tuyến. Với hơn 8 năm kinh nghiệm, chúng tôi phục vụ hàng nghìn khách hàng trong nước và mở rộng hợp tác với nhiều thương hiệu uy tín. Đội ngũ đa ngành của chúng tôi tập trung vào nghiên cứu sản phẩm, kiểm duyệt nguồn gốc và tư vấn phù hợp cho từng làn da.</p>
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
          <div class="absolute -inset-4 bg-gradient-to-r from-glow-primary-100 to-transparent rounded-xl opacity-50 blur-lg hidden md:block"></div>
          <div class="relative rounded-xl overflow-hidden shadow-lg border border-glow-primary-100">
            <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80" alt="team" class="w-full h-64 object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
          </div>
        </div>
      </div>
    </div>

    <!-- STORY TIMELINE -->
    <div class="mt-12">
      <h2 class="text-2xl font-semibold mb-6">Câu chuyện hình thành</h2>
      <div class="relative">
        <div class="border-l border-gray-200 absolute h-full left-4 md:left-1/2 transform md:-translate-x-1/2"></div>
        <ol class="space-y-8 md:w-3/4 md:mx-auto">
          <li class="flex md:justify-start items-start md:items-center gap-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-glow-primary-600 text-white flex items-center justify-center">2018</div>
            </div>
            <div class="bg-white border rounded-lg p-4 shadow-sm w-full">
              <h3 class="font-semibold">Thành lập</h3>
              <p class="text-gray-600 mt-2">GlowUp được thành lập, đặt nền tảng cho sứ mệnh cung cấp mỹ phẩm an toàn và minh bạch.</p>
            </div>
          </li>

          <li class="flex md:flex-row-reverse items-start md:items-center gap-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-glow-primary-600 text-white flex items-center justify-center">2020</div>
            </div>
            <div class="bg-white border rounded-lg p-4 shadow-sm w-full">
              <h3 class="font-semibold">Mở rộng sản phẩm</h3>
              <p class="text-gray-600 mt-2">Mở rộng danh mục sản phẩm, hợp tác với nhiều thương hiệu nội địa và quốc tế.</p>
            </div>
          </li>

          <li class="flex items-start md:items-center gap-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-glow-primary-600 text-white flex items-center justify-center">2023</div>
            </div>
            <div class="bg-white border rounded-lg p-4 shadow-sm w-full">
              <h3 class="font-semibold">Đạt mốc 1.000+ khách hàng</h3>
              <p class="text-gray-600 mt-2">Nhận được sự tin tưởng của cộng đồng và phát triển kênh tư vấn khách hàng chuyên nghiệp.</p>
            </div>
          </li>
        </ol>
      </div>
    </div>

    <!-- VISION / MISSION / VALUES -->
    <div class="mt-12 grid md:grid-cols-3 gap-6">
      <div class="p-6 bg-white rounded-xl shadow-sm text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-md bg-glow-primary-50 mb-4">
          <svg class="w-6 h-6 text-glow-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z"></path></svg>
        </div>
        <h4 class="font-semibold">Tầm nhìn</h4>
        <p class="text-gray-600 mt-2">Trở thành thương hiệu tiên phong trong chăm sóc sắc đẹp an toàn và bền vững tại khu vực.</p>
      </div>

      <div class="p-6 bg-white rounded-xl shadow-sm text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-md bg-glow-primary-50 mb-4">
          <svg class="w-6 h-6 text-glow-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h4 class="font-semibold">Sứ mệnh</h4>
        <p class="text-gray-600 mt-2">Mang đến sản phẩm chất lượng, minh bạch nguồn gốc và dịch vụ tận tâm cho mọi khách hàng.</p>
      </div>

      <div class="p-6 bg-white rounded-xl shadow-sm text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-md bg-glow-primary-50 mb-4">
          <svg class="w-6 h-6 text-glow-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"></path></svg>
        </div>
        <h4 class="font-semibold">Giá trị</h4>
        <p class="text-gray-600 mt-2">Minh bạch, Tin cậy, Chất lượng và Trải nghiệm khách hàng là trọng tâm của chúng tôi.</p>
      </div>
    </div>

    <!-- WHY CHOOSE US -->
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

    <!-- ACHIEVEMENTS / COUNTERS -->
    <div id="achievements" class="mt-12 bg-glow-primary-50 rounded-xl p-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div v-for="c in counters" :key="c.id" class="p-4">
          <div class="text-3xl font-bold text-glow-primary-600">{{ c.display }}</div>
          <div class="text-sm text-gray-700 mt-1">{{ c.label }}</div>
        </div>
      </div>
    </div>

    <!-- TEAM -->
    <div class="mt-12">
      <h2 class="text-2xl font-semibold mb-6">Đội ngũ</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white border rounded-xl p-4 text-center shadow-sm">
          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80" alt="TÍ" class="w-28 h-28 rounded-full object-cover mx-auto mb-3" loading="lazy" />
          <div class="font-semibold">TÍ</div>
          <div class="text-sm text-gray-500">Founder & CEO</div>
        </div>

        <div class="bg-white border rounded-xl p-4 text-center shadow-sm">
             <img src="https://images.unsplash.com/photo-1524503033411-c9566986fc8f?auto=format&fit=crop&w=400&q=80" alt="TÈO" class="w-28 h-28 rounded-full object-cover mx-auto mb-3" loading="lazy" />
          <div class="font-semibold">TÈO</div>
          <div class="text-sm text-gray-500">Head of Product</div>
        </div>

        <div class="bg-white border rounded-xl p-4 text-center shadow-sm">
          <img src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80" alt="T" class="w-28 h-28 rounded-full object-cover mx-auto mb-3" loading="lazy" />
          <div class="font-semibold">TÉO</div>
          <div class="text-sm text-gray-500">Customer Care</div>
        </div>

        <div class="bg-white border rounded-xl p-4 text-center shadow-sm">
          <img src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80" alt="Pham Huong" class="w-28 h-28 rounded-full object-cover mx-auto mb-3" loading="lazy" />
          <div class="font-semibold">TEO</div>
          <div class="text-sm text-gray-500">Marketing</div>
        </div>
      </div>
    </div>

    <!-- WORK PROCESS -->
    <div class="mt-12">
      <h2 class="text-2xl font-semibold mb-6">Quy trình làm việc</h2>
      <div class="grid md:grid-cols-5 gap-4">
        <div class="p-4 bg-white border rounded-lg text-center">
          <div class="font-bold text-glow-primary-600 mb-2">1</div>
          <div class="font-semibold">Tư vấn</div>
          <p class="text-sm text-gray-600 mt-2">Lắng nghe nhu cầu khách hàng.</p>
        </div>
        <div class="p-4 bg-white border rounded-lg text-center">
          <div class="font-bold text-glow-primary-600 mb-2">2</div>
          <div class="font-semibold">Kiểm duyệt</div>
          <p class="text-sm text-gray-600 mt-2">Chọn sản phẩm phù hợp.</p>
        </div>
        <div class="p-4 bg-white border rounded-lg text-center">
          <div class="font-bold text-glow-primary-600 mb-2">3</div>
          <div class="font-semibold">Đặt hàng</div>
          <p class="text-sm text-gray-600 mt-2">Xử lý đơn và đóng gói.</p>
        </div>
        <div class="p-4 bg-white border rounded-lg text-center">
          <div class="font-bold text-glow-primary-600 mb-2">4</div>
          <div class="font-semibold">Giao hàng</div>
          <p class="text-sm text-gray-600 mt-2">Giao nhanh, an toàn.</p>
        </div>
        <div class="p-4 bg-white border rounded-lg text-center">
          <div class="font-bold text-glow-primary-600 mb-2">5</div>
          <div class="font-semibold">Hậu mãi</div>
          <p class="text-sm text-gray-600 mt-2">Hỗ trợ sau mua hàng.</p>
        </div>
      </div>
    </div>

    <!-- CLIENTS / PARTNERS -->
    <div class="mt-12">
      <h2 class="text-2xl font-semibold mb-6">Khách hàng & Đối tác</h2>
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
        <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=60" class="opacity-70 grayscale" alt="partner" loading="lazy" />
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=60" class="opacity-70 grayscale" alt="partner" loading="lazy" />
        <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=60" class="opacity-70 grayscale" alt="partner" loading="lazy" />
        <img src="https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=600&q=60" class="opacity-70 grayscale" alt="partner" loading="lazy" />
        <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=60" class="opacity-70 grayscale" alt="partner" loading="lazy" />
        <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=60" class="opacity-70 grayscale" alt="partner" loading="lazy" />
      </div>
    </div>

    <!-- COMMITMENTS -->
    <div class="mt-12 bg-white border rounded-xl p-6">
      <h2 class="text-2xl font-semibold mb-4">Cam kết với khách hàng</h2>
      <ul class="grid sm:grid-cols-2 gap-3 text-gray-700">
        <li>✔️ Sản phẩm chính hãng, nguồn gốc rõ ràng</li>
        <li>✔️ Đổi trả linh hoạt trong 7 ngày</li>
        <li>✔️ Hỗ trợ tư vấn miễn phí</li>
        <li>✔️ Bảo mật thông tin khách hàng</li>
      </ul>
    </div>

    <!-- FINAL CTA -->
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

<style scoped>
.bg-glow-primary-50 { background-color: #f0f9ff; }
.bg-glow-primary-600 { background-color: #0b6fa3; }
.text-glow-primary-600 { color: #0b6fa3; }

/* Accessibility focus */
.container :is(a, button) :focus { outline: 2px solid rgba(59,130,246,0.5); }

@media (max-width: 640px) {
  .h-[320px] { height: 260px }
}
</style>
