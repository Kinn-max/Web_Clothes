<script setup lang="ts">
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  X 
} from "lucide-vue-next";
import { useNotification } from "~/composables/useNotification";

const { notificationState, hideNotification } = useNotification();

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: "text-green-500 bg-green-50",
  error: "text-red-500 bg-red-50",
  warning: "text-amber-500 bg-amber-50",
  info: "text-blue-500 bg-blue-50",
};

const btnColors = {
  success: "bg-green-600 hover:bg-green-700",
  error: "bg-red-600 hover:bg-red-700",
  warning: "bg-amber-600 hover:bg-amber-700",
  info: "bg-blue-600 hover:bg-blue-700",
};
</script>

<template>
  <Transition name="fade">
    <div 
      v-if="notificationState.isVisible" 
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      @click.self="hideNotification"
    >
      <Transition name="scale">
        <div 
          v-if="notificationState.isVisible"
          class="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
        >
          <div class="p-6 text-center">
            <div 
              :class="[
                'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4',
                colors[notificationState.type]
              ]"
            >
              <component :is="icons[notificationState.type]" class="w-8 h-8" />
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              {{ notificationState.title }}
            </h3>
            
            <p class="text-gray-600 mb-8">
              {{ notificationState.message }}
            </p>
            
            <button 
              @click="hideNotification"
              :class="[
                'w-full py-3 text-white font-bold rounded-xl transition-all transform active:scale-95 shadow-lg',
                btnColors[notificationState.type]
              ]"
            >
              Đóng
            </button>
          </div>
          
          <button 
            @click="hideNotification"
            class="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>
