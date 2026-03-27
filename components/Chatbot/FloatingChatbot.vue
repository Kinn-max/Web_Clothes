<template>
  <!-- Floating Button -->
  <button
    v-if="!open"
    @click="open = true"
    class="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-glow-primary-600 text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group overflow-hidden"
  >
    <div class="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
    <MessageCircle class="w-7 h-7 relative z-10" />
  </button>

  <!-- Chat Window -->
  <div
    v-if="open"
    class="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-100 transition-all animate-in slide-in-from-bottom-4 fade-in duration-300"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-glow-primary-600 to-glow-primary-400 text-white shadow-sm overflow-hidden relative">
      <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <div class="flex items-center gap-3 relative z-10">
        <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
          <Bot class="w-6 h-6" />
        </div>
        <div>
          <h3 class="font-serif font-bold text-lg leading-tight">GlowUp Helper</h3>
          <p class="text-[10px] text-white/80 font-medium uppercase tracking-widest">Always online</p>
        </div>
      </div>

      <button
        @click="open = false"
        class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors relative z-10"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Messages -->
    <div
      ref="messageContainer"
      class="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[#FFFCFC] scroll-smooth no-scrollbar"
    >
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="space-y-3"
      >
        <!-- Bubble row -->
        <div
          class="flex items-end gap-3"
          :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
        >
          <!-- Avatar -->
          <div
            class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs shadow-sm border border-gray-100"
            :class="msg.role === 'user' ? 'bg-gray-100' : 'bg-glow-secondary-100 text-glow-secondary-600'"
          >
            <User v-if="msg.role === 'user'" class="w-4 h-4" />
            <Bot v-else class="w-4 h-4" />
          </div>

          <!-- Bubble -->
          <div
            class="max-w-[80%] px-4 py-3 text-sm leading-relaxed shadow-sm transition-all"
            :class="msg.role === 'user'
              ? 'bg-glow-primary-600 text-white rounded-2xl rounded-br-none'
              : 'bg-white text-gray-800 rounded-2xl rounded-bl-none border border-gray-50 font-medium'"
          >
            {{ msg.content }}
          </div>
        </div>

        <!-- Product cards -->
        <div v-if="msg.role === 'assistant' && msg.products?.length" class="pl-11">
           <ProductCards :products="msg.products" />
        </div>
      </div>

      <!-- Typing -->
      <div v-if="loading" class="flex items-end gap-3 animate-pulse">
        <div class="w-8 h-8 rounded-full bg-glow-secondary-100 text-glow-secondary-600 flex items-center justify-center">
          <Bot class="w-4 h-4" />
        </div>
        <div class="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none">
          <div class="flex gap-1">
            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 bg-white border-t border-gray-50 flex flex-col gap-2">
      <form
        @submit.prevent="handleSend"
        class="flex items-center gap-2 p-1.5 pl-4 bg-gray-50 rounded-2xl border border-gray-100 focus-within:border-glow-primary-300 transition-colors shadow-inner"
      >
        <input
          v-model="input"
          type="text"
          placeholder="Hỏi tư vấn làm đẹp..."
          class="flex-1 bg-transparent border-none py-2 text-sm focus:outline-none placeholder:text-gray-400 font-medium"
        />
        <button
          type="submit"
          :disabled="loading || !input.trim()"
          class="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center disabled:bg-gray-200 transition-all hover:bg-glow-primary-600 shadow-sm"
        >
          <Send class="w-4 h-4" />
        </button>
      </form>
      <p class="text-[9px] text-center text-gray-400 font-medium uppercase tracking-tighter">AI may generate incorrect information</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useChatbot } from '@/composables/useChatbot';
import ProductCards from '@/components/Chatbot/ProductCards.vue';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User 
} from 'lucide-vue-next';

const open = ref(false);
const input = ref('');
const messageContainer = ref<HTMLElement | null>(null);

const { messages, loading, sendMessage } = useChatbot();

const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

const handleSend = async () => {
  if (!input.value.trim() || loading.value) return;

  const userMessage = input.value;
  input.value = '';

  try {
    await sendMessage(userMessage);
  } catch {
    messages.value.push({
      role: 'assistant',
      content: '❌ Có lỗi xảy ra, vui lòng thử lại.',
    });
  } finally {
    scrollToBottom();
  }
};

watch(
  () => messages.value.length,
  () => {
    setTimeout(scrollToBottom, 100);
  }
);

watch(open, (newVal) => {
  if (newVal) {
    setTimeout(scrollToBottom, 50);
  }
});
</script>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
