<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <ChatSidebar
      :sessions="sessions"
      :active-id="currentSessionId"
      @new-chat="startNewChat"
      @select="loadSession"
      @delete="handleDelete"
    />

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-14 flex items-center px-6 bg-white border-b border-gray-100 gap-3">
        <div class="w-8 h-8 rounded-full bg-glow-primary-100 flex items-center justify-center">
          <Sparkles class="w-4 h-4 text-glow-primary-600" />
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-900">GlowUp Helper</p>
          <p class="text-[10px] text-gray-400 uppercase tracking-widest">Trợ lý tư vấn thời trang</p>
        </div>
      </header>

      <ChatMessages
        ref="chatMessages"
        :messages="messages"
        :loading="isPending || isLoadingSession"
        @quick-send="handleQuickSend"
      />

      <ChatInput
        :loading="isPending"
        @send="handleSend"
        @image="handleImage"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { Sparkles } from 'lucide-vue-next';
import ChatSidebar from '@/components/Chatbot/ChatSidebar.vue';
import ChatMessages from '@/components/Chatbot/ChatMessages.vue';
import ChatInput from '@/components/Chatbot/ChatInput.vue';
import { useChatbot } from '@/composables/useChatbot';
import { useChatHistory } from '@/composables/useChatHistory';

const { messages, sessionId, resetSession, useSendMessage, useSendImage } = useChatbot();
const { useGetSessions, useGetSession, useDeleteSession } = useChatHistory();

const currentSessionId = ref<number | null>(null);
const chatMessages = ref<InstanceType<typeof ChatMessages> | null>(null);
const isLoadingSession = ref(false);

const { data: sessions } = useGetSessions();
const { data: sessionDetail, isFetching } = useGetSession(currentSessionId);
const { mutate: deleteSession } = useDeleteSession();
const { mutate: sendMsg, isPending } = useSendMessage();
const { mutate: sendImg } = useSendImage();

// Chỉ load messages từ history khi isLoadingSession = true
// và fetch xong (isFetching = false)
watch(isFetching, (fetching) => {
  if (fetching || !isLoadingSession.value) return;
  if (!sessionDetail.value || sessionDetail.value.id !== currentSessionId.value) return;
  messages.value = sessionDetail.value.messages ?? [];
  isLoadingSession.value = false;
  nextTick(() => chatMessages.value?.scrollToBottom());
});

const startNewChat = () => {
  resetSession();
  currentSessionId.value = null;
  isLoadingSession.value = false;
};

const loadSession = (id: number) => {
  if (id === currentSessionId.value) return;
  resetSession();
  isLoadingSession.value = true;
  currentSessionId.value = id;
  sessionId.value = id;
};

const handleDelete = (id: number) => {
  deleteSession(id);
  if (currentSessionId.value === id) startNewChat();
};

const handleSend = (message: string) => {
  sendMsg(message, {
    onSuccess: () => {
      currentSessionId.value = sessionId.value;
      nextTick(() => chatMessages.value?.scrollToBottom());
    },
  });
};

const handleImage = (file: File) => {
  sendImg(file, {
    onSuccess: () => nextTick(() => chatMessages.value?.scrollToBottom()),
  });
};

const handleQuickSend = (hint: string) => handleSend(hint);
</script>