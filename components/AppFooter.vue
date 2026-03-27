<script setup lang="ts">
import { Facebook, Instagram, Twitter, Mail } from 'lucide-vue-next';
</script>

<template>
  <footer class="bg-gray-50 pt-16 pb-8 border-t border-gray-100">
    <div class="container mx-auto px-4 md:px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <!-- Brand -->
        <div class="space-y-4">
          <h3 class="text-2xl font-serif font-bold text-gray-900">GlowUp.</h3>
          <p class="text-gray-500 text-sm leading-relaxed">
            Khám phá vẻ rạng rỡ đích thực của bạn với bộ sưu tập mỹ phẩm cao cấp có nguồn gốc đạo đức của chúng tôi.
          </p>
          <div class="flex gap-4 text-gray-400">
            <a href="#" class="hover:text-glow-primary-600 transition-colors"><Instagram class="w-5 h-5" /></a>
            <a href="#" class="hover:text-glow-primary-600 transition-colors"><Facebook class="w-5 h-5" /></a>
            <a href="#" class="hover:text-glow-primary-600 transition-colors"><Twitter class="w-5 h-5" /></a>
          </div>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-bold text-gray-900 mb-6 font-serif">Cửa Hàng</h4>
          <ul class="space-y-3 text-sm text-gray-500">
            <li><a href="#" class="hover:text-glow-primary-600 transition-colors">Hàng Mới Về</a></li>
            <li><a href="#" class="hover:text-glow-primary-600 transition-colors">Bán Chạy Nhất</a></li>
            <li><a href="#" class="hover:text-glow-primary-600 transition-colors">Chăm Sóc Da</a></li>
            <li><a href="#" class="hover:text-glow-primary-600 transition-colors">Trang Điểm</a></li>
          </ul>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-bold text-gray-900 mb-6 font-serif">Hỗ Trợ</h4>
          <ul class="space-y-3 text-sm text-gray-500">
            <li><a href="#" class="hover:text-glow-primary-600 transition-colors">Liên Hệ</a></li>
            <li><a href="#" class="hover:text-glow-primary-600 transition-colors">Vận Chuyển & Đổi Trả</a></li>
            <li><a href="#" class="hover:text-glow-primary-600 transition-colors">Câu Hỏi Thường Gặp</a></li>
            <li><a href="#" class="hover:text-glow-primary-600 transition-colors">Chính Sách Bảo Mật</a></li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div>
          <h4 class="font-bold text-gray-900 mb-6 font-serif">Đăng Ký Nhận Tin</h4>
          <p class="text-gray-500 text-sm mb-4">Đăng ký để nhận cập nhật, quyền truy cập vào các ưu đãi độc quyền và nhiều hơn nữa.</p>
          <form class="flex flex-col gap-3">
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                placeholder="Nhập email của bạn" 
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-glow-primary-400 focus:ring-1 focus:ring-glow-primary-400 transition-all text-sm"
              >
            </div>
            <button class="w-full bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-glow-primary-600 transition-colors text-sm">
              Đăng Ký
            </button>
          </form>
        </div>
      </div>

      <div class="pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
        <p>&copy; {{ new Date().getFullYear() }} GlowUp Cosmetics.</p>
      </div>
    </div>
  </footer>
</template>
