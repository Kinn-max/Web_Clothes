<script setup lang="ts">
import { Save } from 'lucide-vue-next'
import AboutHeroTab     from '@/components/admin/about/AboutHeroTab.vue'
import AboutCountersTab from '@/components/admin/about/AboutCountersTab.vue'
import AboutTeamTab     from '@/components/admin/about/AboutTeamTab.vue'
import AboutTimelineTab from '@/components/admin/about/AboutTimelineTab.vue'
import type { AboutContent } from '@/types/about'
import { useAbout } from '@/composables/useAbout'

definePageMeta({ layout: 'admin' })

const authStore = useAuthStore()
const { showNotification } = useNotification()
const { useGetAboutContent, useUpdateAboutContent } = useAbout()

onMounted(() => {
  if (authStore.role !== 'ADMIN') navigateTo('/403')
})

const { data: content, isLoading } = useGetAboutContent()
const { mutate: updateContent, isPending: isSaving } = useUpdateAboutContent()

const activeTab = ref<'hero' | 'counters' | 'team' | 'timeline'>('hero')

// Form state — deep copy từ Firestore data
const form = ref<AboutContent>({
  hero:      { title: '', subtitle: '', image: '' },
  counters:  [],
  team:      [],
  timeline:  [],
})

watch(content, (data) => {
  if (!data) return
  form.value = {
    hero:     { ...data.hero },
    counters: data.counters.map(c => ({ ...c })),
    team:     data.team.map(t => ({ ...t })),
    timeline: data.timeline.map(t => ({ ...t })),
  }
}, { immediate: true })

// ── Actions ────────────────────────────────────────────────
const handleSave = () => {
  updateContent(form.value, {
    onSuccess: () => showNotification('Thành công', 'Đã lưu nội dung trang About', 'success'),
    onError:   () => showNotification('Lỗi', 'Không thể lưu nội dung', 'error'),
  })
}

const initDefault = () => {
  form.value = {
    hero: {
      title:    'GlowUp — Nâng tầm vẻ đẹp, tăng cường sự tự tin',
      subtitle: 'Chúng tôi cung cấp giải pháp chăm sóc da và mỹ phẩm chính hãng, tối ưu cho mọi loại da và phong cách sống.',
      image:    'https://images.unsplash.com/photo-1503342452485-86f7b0ff9f45?auto=format&fit=crop&w=1600&q=80',
    },
    counters: [
      { id: 'years',    label: 'Năm kinh nghiệm', value: 8    },
      { id: 'clients',  label: 'Khách hàng',       value: 1200 },
      { id: 'projects', label: 'Dự án',            value: 340  },
      { id: 'partners', label: 'Đối tác',          value: 85   },
    ],
    team: [
      { name: 'TÍ',  role: 'Founder & CEO',   avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
      { name: 'TÈO', role: 'Head of Product', avatar: 'https://images.unsplash.com/photo-1524503033411-c9566986fc8f?auto=format&fit=crop&w=400&q=80' },
    ],
    timeline: [
      { year: '2018', title: 'Thành lập',         content: 'GlowUp được thành lập với sứ mệnh mỹ phẩm an toàn và minh bạch.'    },
      { year: '2020', title: 'Mở rộng sản phẩm',  content: 'Hợp tác với nhiều thương hiệu nội địa và quốc tế.'                  },
      { year: '2023', title: 'Đạt mốc 1.000+ KH', content: 'Nhận được sự tin tưởng của cộng đồng và phát triển mạnh mẽ.'        },
    ],
  }
  updateContent(form.value, {
    onSuccess: () => showNotification('Thành công', 'Đã khởi tạo nội dung mặc định', 'success'),
    onError:   () => showNotification('Lỗi', 'Không thể khởi tạo', 'error'),
  })
}

const tabs = [
  { key: 'hero',     label: 'Hero'     },
  { key: 'counters', label: 'Số liệu'  },
  { key: 'team',     label: 'Đội ngũ'  },
  { key: 'timeline', label: 'Timeline' },
] as const
</script>

<template>
  <div class="max-w-4xl mx-auto">

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Nội dung trang About</h1>
        <p class="text-sm text-gray-500 mt-1">Chỉnh sửa thông tin hiển thị trên trang Giới thiệu</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Chỉ hiện khi chưa có data -->
        <button
          v-if="!content && !isLoading"
          @click="initDefault"
          :disabled="isSaving"
          class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          Khởi tạo mặc định
        </button>
        <button
          @click="handleSave"
          :disabled="isSaving || isLoading"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Save class="w-4 h-4" />
          {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
    </div>

    <template v-else>
      <!-- Tab navigation -->
      <div class="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        <button
          v-for="tab in tabs" :key="tab.key"
          @click="activeTab = tab.key"
          class="flex-1 py-2 text-sm font-medium rounded-lg transition"
          :class="activeTab === tab.key
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab content -->
      <AboutHeroTab
        v-if="activeTab === 'hero'"
        v-model="form.hero"
      />
      <AboutCountersTab
        v-if="activeTab === 'counters'"
        v-model="form.counters"
      />
      <AboutTeamTab
        v-if="activeTab === 'team'"
        v-model="form.team"
      />
      <AboutTimelineTab
        v-if="activeTab === 'timeline'"
        v-model="form.timeline"
      />

      <!-- Save bottom -->
      <div class="mt-6 flex justify-end">
        <button
          @click="handleSave"
          :disabled="isSaving"
          class="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Save class="w-4 h-4" />
          {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
      </div>
    </template>
  </div>
</template>