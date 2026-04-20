<template>
  <div
    v-if="status !== 'loading'"
    class="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
  >
    <span
      :class="[
        'px-4 py-1.5 rounded-full text-white text-sm font-semibold backdrop-blur-sm flex items-center gap-2',
        status === 'tracking' ? 'bg-green-500/75' :
        status === 'ready'    ? 'bg-blue-500/75'  : 'bg-black/60',
      ]"
    >
      <span
        :class="[
          'w-2 h-2 rounded-full',
          status === 'tracking' ? 'bg-green-200 animate-pulse' : 'bg-white/50',
        ]"
      />
      {{ statusText }}
    </span>

    <span
      v-if="confidence > 0"
      class="px-3 py-1.5 rounded-full bg-black/50 text-white/80 text-xs backdrop-blur-sm"
    >
      {{ Math.round(confidence * 100) }}%
    </span>

    <span class="px-3 py-1.5 rounded-full bg-black/50 text-white/60 text-xs backdrop-blur-sm">
      {{ fps }} fps
    </span>
  </div>
</template>

<script setup>
defineProps({
  status:     { type: String,  required: true },
  statusText: { type: String,  required: true },
  confidence: { type: Number,  default: 0 },
  fps:        { type: Number,  default: 0 },
})
</script>
