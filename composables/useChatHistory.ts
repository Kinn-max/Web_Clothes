import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import type { ChatMessage, ChatProduct, SessionSummary, SessionDetail } from '@/types';
import { useRequireAuth } from './useRequireAuth';

export const useChatHistory = () => {
  const http = useHttp();
  const queryClient = useQueryClient();
  const { requireNeonId, neonId } = useRequireAuth();

  // ─── GET danh sách sessions ───────────────────────────────
  const useGetSessions = () =>
    useQuery({
      queryKey: ['chat-sessions', neonId],
      queryFn: () =>
        http.get<SessionSummary[]>(`/api/chatbot/sessions?user_id=${requireNeonId()}`),
      enabled: computed(() => !!neonId.value),
    });

  // ─── GET messages của 1 session ───────────────────────────
  const useGetSession = (sessionId: Ref<number | null>) =>
  useQuery({
    queryKey: ['chat-session', sessionId],
    queryFn: async () => {
      const res = await http.get<SessionDetail>(
        `/api/chatbot/sessions/${sessionId.value}`
      );
      const messages: ChatMessage[] = (res.messages ?? []).map((m) => {
        let products: ChatProduct[] = [];
        if (m.suggested_products) {  // ← đổi products_json → suggested_products
          try {
            const parsed = JSON.parse(m.suggested_products);
            products = parsed.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              brand: p.brand,
              score: p.score,
              images: typeof p.images === 'string'
                ? JSON.parse(p.images)  // ← parse lần 2 vì images là JSON string lồng nhau
                : p.images ?? [],
            }));
          } catch {}
        }
        return { role: m.role, content: m.content, products };
      });
      return { ...res, messages };
    },
    enabled: computed(() => !!sessionId.value),
  });

  // ─── PATCH đổi title ──────────────────────────────────────
  const useUpdateTitle = () =>
    useMutation({
      mutationFn: ({ sessionId, title }: { sessionId: number; title: string }) =>
        http.patch(`/api/chatbot/sessions/${sessionId}/title?title=${encodeURIComponent(title)}`, {}),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chat-sessions', neonId] });
      },
    });

  // ─── DELETE session ───────────────────────────────────────
  const useDeleteSession = () =>
    useMutation({
      mutationFn: (sessionId: number) =>
        http.del(`/api/chatbot/sessions/${sessionId}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chat-sessions', neonId] });
      },
    });

  return { useGetSessions, useGetSession, useUpdateTitle, useDeleteSession };
};