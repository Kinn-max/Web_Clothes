<script setup lang="ts">
import { CheckCircle2, AlertTriangle, AlertOctagon, Lightbulb } from 'lucide-vue-next'

interface FitMeasure {
  diff_cm: number
  status: 'tight' | 'good' | 'loose'
}

interface FitResult {
  overall_fit: 'tight' | 'good' | 'loose'
  chest_fit: FitMeasure
  waist_fit: FitMeasure
  hip_fit: FitMeasure
  recommendation: string
  size_suggestion: string | null
}

const props = defineProps<{
  result: FitResult
}>()

const emit = defineEmits<{
  'try-size': [size: string]
}>()

const STATUS_LABEL: Record<FitMeasure['status'], string> = {
  tight: 'Chật',
  good: 'Vừa vặn',
  loose: 'Rộng',
}

const STATUS_COLORS: Record<FitMeasure['status'], { text: string; bg: string; border: string; bar: string }> = {
  tight: {
    text: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    bar: 'bg-gradient-to-r from-red-400 to-red-500',
  },
  good: {
    text: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    bar: 'bg-gradient-to-r from-green-400 to-emerald-500',
  },
  loose: {
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    bar: 'bg-gradient-to-r from-amber-400 to-orange-500',
  },
}

const overallStyle = computed(() => STATUS_COLORS[props.result.overall_fit])

const overallIcon = computed(() => {
  if (props.result.overall_fit === 'good') return CheckCircle2
  if (props.result.overall_fit === 'tight') return AlertOctagon
  return AlertTriangle
})

// Map diff_cm vào % cho thanh visual (giả định ±15cm là biên độ tối đa)
function diffToPercent(diff: number) {
  const clamped = Math.max(-15, Math.min(15, diff))
  return ((clamped + 15) / 30) * 100
}

const measureRows = computed(() => [
  { label: 'Ngực', fit: props.result.chest_fit },
  { label: 'Eo',   fit: props.result.waist_fit },
  { label: 'Hông', fit: props.result.hip_fit },
])

function formatDiff(diff: number) {
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff.toFixed(1)} cm`
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <!-- Overall header -->
    <div :class="['p-4 border-b', overallStyle.bg, overallStyle.border]">
      <div class="flex items-center gap-3">
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center bg-white/80', overallStyle.text]">
          <component :is="overallIcon" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Đánh giá tổng thể</p>
          <p :class="['font-bold text-base', overallStyle.text]">
            {{ STATUS_LABEL[result.overall_fit] }}
          </p>
        </div>
      </div>
    </div>

    <!-- Per-measurement rows -->
    <div class="p-4 space-y-3">
      <div v-for="row in measureRows" :key="row.label" class="space-y-1.5">
        <div class="flex items-center justify-between text-sm">
          <span class="font-semibold text-gray-700">{{ row.label }}</span>
          <span :class="['text-xs font-bold tabular-nums px-2 py-0.5 rounded-full',
            STATUS_COLORS[row.fit.status].bg, STATUS_COLORS[row.fit.status].text]">
            {{ formatDiff(row.fit.diff_cm) }} · {{ STATUS_LABEL[row.fit.status] }}
          </span>
        </div>
        <div class="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <!-- center marker -->
          <div class="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300/70" />
          <!-- bar fill (left or right of center based on sign) -->
          <div
            :class="['absolute top-0 bottom-0 rounded-full', STATUS_COLORS[row.fit.status].bar]"
            :style="{
              left: row.fit.diff_cm < 0 ? diffToPercent(row.fit.diff_cm) + '%' : '50%',
              right: row.fit.diff_cm < 0 ? '50%' : (100 - diffToPercent(row.fit.diff_cm)) + '%',
            }" />
        </div>
      </div>
    </div>

    <!-- Recommendation footer -->
    <div class="p-4 bg-gradient-to-br from-violet-50 to-pink-50 border-t border-violet-100 space-y-3">
      <div class="flex items-start gap-2">
        <Lightbulb class="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
        <p class="text-xs text-gray-700 leading-relaxed">{{ result.recommendation }}</p>
      </div>

      <button
        v-if="result.size_suggestion"
        type="button"
        @click="emit('try-size', result.size_suggestion!)"
        class="w-full h-10 rounded-xl text-xs font-bold tracking-wide bg-white border-2 border-violet-200 text-violet-700 hover:border-violet-400 hover:bg-violet-50 transition-colors flex items-center justify-center gap-2">
        Thử size {{ result.size_suggestion }} thay thế →
      </button>
    </div>
  </div>
</template>
