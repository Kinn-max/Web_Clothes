import { ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { ChatMessage, ChatProduct, RawChatProduct } from '@/types';
import { useRequireAuth } from './useRequireAuth';

const mapProduct = (raw: RawChatProduct): ChatProduct => {
  let images: string[] = [];
  try { images = JSON.parse(raw.images || '[]'); } catch {}
  return { id: raw.id, name: raw.name, price: raw.price, brand: raw.brand, score: raw.score, images };
};

// Module-level state — shared across all usages
const messages = ref<ChatMessage[]>([]);
const sessionId = ref<number | null>(null);

export const useChatbot = () => {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { requireNeonId, neonId } = useRequireAuth();

  const initSession = async () => {
    if (sessionId.value) return;
    const res = await http.post<{ id: number }>('/api/chatbot/sessions', {
      user_id: requireNeonId(),
    });
    sessionId.value = res.id;
  };

  const useSendMessage = () =>
    useMutation({
      mutationFn: async (message: string) => {
        await initSession();
        messages.value.push({ role: 'user', content: message });
        return http.post<{
          message: string;
          suggested_products?: RawChatProduct[];
          session_id: number;
        }>('/api/chatbot/chat', {
          session_id: sessionId.value,
          user_id: requireNeonId(),
          message,
        });
      },
      onSuccess: (data) => {
        const products = data.suggested_products?.map(mapProduct) ?? [];
        messages.value.push({ role: 'assistant', content: data.message, products });
        queryClient.invalidateQueries({ queryKey: ['chat-sessions', neonId] });
      },
      onError: () => {
        messages.value.push({ role: 'assistant', content: '❌ Có lỗi xảy ra, vui lòng thử lại.' });
      },
    });

  const useSendImage = () =>
    useMutation({
      mutationFn: async (file: File) => {
        await initSession();
        messages.value.push({ role: 'user', content: '🖼️ Tìm sản phẩm tương tự ảnh này...' });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('top_k', '5');
        return http.upload<{
          message: string;
          suggested_products?: RawChatProduct[];
        }>('/api/chatbot/search/image-upload', formData);
      },
      onSuccess: (data) => {
        const products = data.suggested_products?.map(mapProduct) ?? [];
        messages.value.push({
          role: 'assistant',
          content: products.length
            ? `Tìm thấy ${products.length} sản phẩm tương tự:`
            : 'Không tìm thấy sản phẩm tương tự.',
          products,
        });
      },
      onError: () => {
        messages.value.push({ role: 'assistant', content: '❌ Không tìm được sản phẩm từ ảnh.' });
      },
    });

  const resetSession = () => {
    messages.value = [];
    sessionId.value = null;
  };

  return { messages, sessionId, resetSession, useSendMessage, useSendImage };
};