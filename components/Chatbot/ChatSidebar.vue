<template>
  <aside class="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
    <div class="p-4 border-b border-gray-100">
      <button
        @click="$emit('new-chat')"
        class="w-full flex items-center gap-2 px-3 py-2.5 bg-glow-primary-600 text-white rounded-xl text-sm font-medium hover:bg-glow-primary-700 transition-colors"
      >
        <Plus class="w-4 h-4" />
        Chat mới
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
      <template v-for="(group, label) in groupedSessions" :key="label">
        <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 pt-3 pb-1">
          {{ label }}
        </p>
        <div
          v-for="session in group"
          :key="session.id"
          class="group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors"
          :class="activeId === session.id
            ? 'bg-glow-primary-50 text-glow-primary-700'
            : 'hover:bg-gray-50 text-gray-700'"
          @click="$emit('select', session.id)"
        >
          <MessageSquare class="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
          <span class="text-xs flex-1 truncate">{{ session.title || 'Cuộc trò chuyện mới' }}</span>
          <button
            class="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-500"
            @click.stop="$emit('delete', session.id)"
          >
            <Trash2 class="w-3 h-3" />
          </button>
        </div>
      </template>

      <div v-if="!sessions?.length" class="text-center text-xs text-gray-400 py-8">
        Chưa có cuộc trò chuyện nào
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Plus, MessageSquare, Trash2 } from 'lucide-vue-next';
import type { SessionSummary } from '@/types';
const props = defineProps<{
  sessions: SessionSummary[] | undefined;
  activeId: number | null;
}>();

defineEmits<{
  'new-chat': [];
  'select': [id: number];
  'delete': [id: number];
}>();

const groupedSessions = computed(() => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups: Record<string, SessionSummary[]> = {};

  for (const s of props.sessions ?? []) {
    const d = new Date(s.updated_at).toDateString();
    const label = d === today ? 'Hôm nay' : d === yesterday ? 'Hôm qua' : 'Trước đó';
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  }
  return groups;
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>