<template>
  <div class="p-4 bg-white border-t border-gray-100">
    <form
      @submit.prevent="handleSend"
      class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-glow-primary-300 transition-colors"
    >
      <label class="cursor-pointer text-gray-400 hover:text-glow-primary-500 transition-colors">
        <ImageIcon class="w-5 h-5" />
        <input type="file" accept="image/*" class="hidden" @change="handleImage" />
      </label>

      <input
        v-model="input"
        type="text"
        placeholder="Hỏi tư vấn thời trang hoặc upload ảnh..."
        class="flex-1 bg-transparent text-sm border-none outline-none py-1.5 placeholder:text-gray-400"
        :disabled="loading"
      />

      <button
        type="submit"
        :disabled="loading || !input.trim()"
        class="w-8 h-8 rounded-xl bg-glow-primary-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-glow-primary-700 transition-colors"
      >
        <Send class="w-3.5 h-3.5" />
      </button>
    </form>
    <p class="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-wider">
      AI có thể đưa ra thông tin không chính xác
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Send, Image as ImageIcon } from 'lucide-vue-next';

defineProps<{ loading: boolean }>();

const emit = defineEmits<{
  'send': [message: string];
  'image': [file: File];
}>();

const input = ref('');

const handleSend = () => {
  if (!input.value.trim()) return;
  emit('send', input.value);
  input.value = '';
};

const handleImage = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) emit('image', file);
};

defineExpose({ setInput: (v: string) => { input.value = v; } });
</script>