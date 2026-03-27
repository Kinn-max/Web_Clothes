<script setup lang="ts">
import { X, AlertCircle } from "lucide-vue-next";

interface Props {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info" | "success";
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: "Xác nhận",
  cancelText: "Hủy",
  type: "danger",
  loading: false,
});

const emit = defineEmits(["confirm", "cancel", "close"]);

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed inset-0 z-[100] overflow-y-auto">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        @click="handleCancel"
      ></div>

      <!-- Modal Content -->
      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div 
            v-if="show"
            class="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          >
            <!-- Close Button -->
            <button 
              @click="handleCancel"
              class="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X class="w-5 h-5" />
            </button>

            <div class="bg-white px-6 pb-6 pt-10 sm:p-8 sm:pt-10">
              <div class="sm:flex sm:items-start">
                <!-- Icon -->
                <div 
                  :class="[
                    'mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl sm:mx-0 sm:h-12 sm:w-12',
                    type === 'danger' ? 'bg-red-50 text-red-600' : 
                    type === 'success' ? 'bg-green-50 text-green-600' : 
                    'bg-blue-50 text-blue-600'
                  ]"
                >
                  <AlertCircle class="h-8 w-8 sm:h-6 sm:w-6" />
                </div>

                <div class="mt-4 text-center sm:ml-6 sm:mt-0 sm:text-left">
                  <h3 class="text-xl font-bold leading-6 text-gray-900">
                    {{ title }}
                  </h3>
                  <div class="mt-3">
                    <p class="text-sm text-gray-500 leading-relaxed">
                      {{ message }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="bg-gray-50 px-6 py-6 sm:flex sm:flex-row-reverse sm:px-8 gap-3">
              <button
                type="button"
                :disabled="loading"
                :class="[
                  'inline-flex w-full justify-center rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-95 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed',
                  type === 'danger' ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-200 shadow-lg' : 
                  type === 'success' ? 'bg-green-600 hover:bg-green-700 hover:shadow-green-200 shadow-lg' : 
                  'bg-glow-primary-600 hover:bg-glow-primary-700 hover:shadow-glow-primary-200 shadow-lg'
                ]"
                @click="handleConfirm"
              >
                <div v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                {{ confirmText }}
              </button>
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all active:scale-95 sm:mt-0 sm:w-auto"
                @click="handleCancel"
              >
                {{ cancelText }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>
