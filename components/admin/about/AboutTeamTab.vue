<!-- components/admin/about/AboutTeamTab.vue -->
<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import type { TeamMember } from '@/types/about'

const props = defineProps<{ modelValue: TeamMember[] }>()
const emit  = defineEmits<{ 'update:modelValue': [value: TeamMember[]] }>()

const add = () => {
  emit('update:modelValue', [
    ...props.modelValue,
    { name: '', role: '', avatar: '' },
  ])
}

const remove = (i: number) => {
  const updated = [...props.modelValue]
  updated.splice(i, 1)
  emit('update:modelValue', updated)
}

const update = (i: number, field: keyof TeamMember, value: string) => {
  const updated = props.modelValue.map((m, idx) =>
    idx === i ? { ...m, [field]: value } : m
  )
  emit('update:modelValue', updated)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(member, i) in modelValue"
      :key="i"
      class="bg-white rounded-xl border border-gray-200 p-4"
    >
      <div class="flex items-start gap-3">

        <!-- Avatar preview -->
        <div class="flex-shrink-0">
          <img
            v-if="member.avatar"
            :src="member.avatar"
            alt="avatar"
            class="w-14 h-14 rounded-full object-cover border border-gray-200"
          />
          <div
            v-else
            class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold"
          >
            {{ member.name?.charAt(0) || '?' }}
          </div>
        </div>

        <!-- Fields -->
        <div class="flex-1 space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Tên</label>
              <input
                :value="member.name"
                @input="update(i, 'name', ($event.target as HTMLInputElement).value)"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Chức vụ</label>
              <input
                :value="member.role"
                @input="update(i, 'role', ($event.target as HTMLInputElement).value)"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="CEO"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">URL ảnh đại diện</label>
            <input
              :value="member.avatar"
              @input="update(i, 'avatar', ($event.target as HTMLInputElement).value)"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://..."
            />
          </div>
        </div>

        <button
          @click="remove(i)"
          class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <button
      @click="add"
      class="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition"
    >
      <Plus class="w-4 h-4" />
      Thêm thành viên
    </button>
  </div>
</template>