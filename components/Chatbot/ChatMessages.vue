<template>
  <div ref="container" class="flex-1 overflow-y-auto px-6 py-6 space-y-5 no-scrollbar">

    <!-- Welcome -->
    <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full gap-4 text-center">
      <div class="w-16 h-16 rounded-2xl bg-glow-primary-100 flex items-center justify-center">
        <Sparkles class="w-8 h-8 text-glow-primary-600" />
      </div>
      <div>
        <p class="text-lg font-semibold text-gray-900">Xin chào!</p>
        <p class="text-sm text-gray-500 mt-1">Mình có thể giúp bạn tìm trang phục phù hợp</p>
      </div>
      <div class="flex flex-wrap gap-2 justify-center mt-2">
        <button
          v-for="hint in quickHints"
          :key="hint"
          class="px-4 py-2 text-xs bg-white border border-gray-200 rounded-full hover:border-glow-primary-300 hover:text-glow-primary-600 transition-colors"
          @click="$emit('quick-send', hint)"
        >
          {{ hint }}
        </button>
      </div>
    </div>

    <!-- Messages -->
    <template v-else>
      <div v-for="(msg, i) in messages" :key="i" class="space-y-3">
        <div class="flex gap-3 items-end" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
          <div
            class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
            :class="msg.role === 'user' ? 'bg-gray-100' : 'bg-glow-primary-100'"
          >
            <User v-if="msg.role === 'user'" class="w-3.5 h-3.5 text-gray-500" />
            <Sparkles v-else class="w-3.5 h-3.5 text-glow-primary-600" />
          </div>
          <div
            class="max-w-[70%] px-4 py-3 text-sm leading-relaxed rounded-2xl"
            :class="msg.role === 'user'
              ? 'bg-glow-primary-600 text-white rounded-br-sm'
              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'"
          >
            {{ msg.content }}
          </div>
        </div>
        <div v-if="msg.role === 'assistant' && msg.products?.length" class="pl-10">
          <ProductCards :products="msg.products" />
        </div>
      </div>
    </template>

    <!-- Typing -->
    <div v-if="loading" class="flex gap-3 items-end">
      <div class="w-7 h-7 rounded-full bg-glow-primary-100 flex items-center justify-center">
        <Sparkles class="w-3.5 h-3.5 text-glow-primary-600" />
      </div>
      <div class="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
        <div class="flex gap-1">
          <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
          <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
          <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { Sparkles, User } from 'lucide-vue-next';
import ProductCards from './ProductCards.vue';
import type { ChatMessage } from '@/types';

defineProps<{
  messages: ChatMessage[];
  loading: boolean;
}>();

defineEmits<{
  'quick-send': [hint: string];
}>();

const quickHints = ['Túi xách nữ đi làm', 'Áo len phong cách Hàn', 'Quần baggy unisex', 'Tìm theo ảnh'];

const container = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (container.value) container.value.scrollTop = container.value.scrollHeight;
};

defineExpose({ scrollToBottom });

watch(() => container.value, scrollToBottom);
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>