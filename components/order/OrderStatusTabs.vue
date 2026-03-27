<script setup lang="ts">
defineProps<{
  activeStatus: string;
  statusTabs: Array<{ label: string; value: string }>;
}>();

defineEmits<{
  (e: 'update:activeStatus', value: string): void;
}>();
</script>

<template>
  <div class="flex items-center gap-2 mb-8 bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
    <button
      v-for="tab in statusTabs"
      :key="tab.value"
      @click="$emit('update:activeStatus', tab.value)"
      :class="[
        'px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
        activeStatus === tab.value 
          ? 'bg-glow-primary-600 text-white shadow-md' 
          : 'text-gray-500 hover:bg-gray-50'
      ]"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
