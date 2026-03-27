import { ref } from 'vue';

/* ================= TYPES ================= */

interface RawProduct {
  id: string;
  name: string;
  price: number;
  images: string; // JSON string từ backend
  brand: string;
  score?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  brand: string;
  score?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  products?: Product[];
}

/* ================= HELPERS ================= */

const mapProduct = (raw: RawProduct): Product => {
  let images: string[] = [];

  try {
    images = JSON.parse(raw.images || '[]');
  } catch {
    images = [];
  }

  return {
    id: raw.id,
    name: raw.name,
    price: raw.price,
    brand: raw.brand,
    score: raw.score,
    images,
  };
};

/* ================= COMPOSABLE ================= */

export const useChatbot = () => {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const sendMessage = async (message: string) => {
    loading.value = true;
    error.value = null;

    // user message
    messages.value.push({
      role: 'user',
      content: message,
    });

    try {
      const response = await $fetch<{
        success: boolean;
        data: {
          message: string;
          suggestedProducts?: RawProduct[];
        };
      }>('http://localhost:8081/api/chatbot/chat', {
        method: 'POST',
        body: {
          message,
          conversationHistory: messages.value,
        },
      });

      if (!response.success) {
        throw new Error('Chatbot error');
      }

      const products =
        response.data.suggestedProducts?.map(mapProduct) ?? [];

      // assistant message
      messages.value.push({
        role: 'assistant',
        content: response.data.message,
        products,
      });
    } catch (err) {
      console.error(err);
      error.value = 'Không gửi được tin nhắn';
    } finally {
      loading.value = false;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
};
