<script setup lang="ts">
import * as icons from 'lucide-vue-next';

interface Props {
  name: string;
  size?: number;
  color?: string;
}

const props = defineProps<Props>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const icon = computed(() => (icons as any)[props.name]);
</script>

<template>
  <component :is="icon" :size="size" :color="color" />
</template>
