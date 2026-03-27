<script setup lang="ts">
import { Heart, ShoppingBag, Minus, Plus, Truck, ShieldCheck, CheckCircle2, Star } from "lucide-vue-next";

const props = defineProps<{
  product: any;
  quantity: number;
  addingToCart: boolean;
  reviewsCount: number;
}>();

const emit = defineEmits<{
  "update:quantity": [value: number];
  addToCart: [];
  toggleWishlist: [];
}>();

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const increaseQty = () => {
  if (props.product && props.quantity < props.product.quantity) {
    emit("update:quantity", props.quantity + 1);
  }
};

const decreaseQty = () => {
  if (props.quantity > 1) {
    emit("update:quantity", props.quantity - 1);
  }
};

const handleQuantityInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = parseInt(input.value) || 1;
  
  // Validate: minimum is 1
  if (value < 1) {
    value = 1;
  }
  
  // Validate: maximum is available stock
  if (props.product && value > props.product.quantity) {
    value = props.product.quantity;
  }
  
  emit("update:quantity", value);
};

const handleQuantityBlur = (event: Event) => {
  const input = event.target as HTMLInputElement;
  // If empty or invalid, reset to 1
  if (!input.value || parseInt(input.value) < 1) {
    emit("update:quantity", 1);
  }
};
</script>

<template>
  <div>
    <div class="text-xs font-black uppercase tracking-widest text-blue-600 italic mb-2">
      {{ product.brand || "No Brand" }}
    </div>
    <h1 class="font-serif text-4xl lg:text-5xl text-gray-900 mb-4 leading-tight tracking-tight">
      {{ product.name }}
    </h1>

    <div class="flex items-center gap-3 mb-6 text-sm">
      <div class="flex text-yellow-400">
        <Star v-for="n in 5" :key="n" class="w-4 h-4 fill-current" />
      </div>
      <span class="text-gray-600">({{ reviewsCount }} đánh giá)</span>
      <span class="w-1 h-1 rounded-full bg-gray-300"></span>
      <span class="text-gray-600">Đã bán 1.2k</span>
    </div>

    <div class="bg-gradient-to-br from-glow-primary-50 via-white to-glow-primary-50/50 p-5 rounded-2xl mb-6 border border-glow-primary-100 shadow-sm">
      <div class="text-2xl font-bold text-glow-primary-600">
        {{ formatPrice(product.price) }}
      </div>
    </div>

    <p class="text-gray-600 leading-relaxed mb-8 text-base">
      {{ product.description }}
    </p>

    <!-- Actions -->
    <div class="flex items-center gap-3 mb-8">
      <div class="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
        <button 
          @click="decreaseQty"
          :disabled="quantity <= 1"
          class="w-11 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus class="w-4 h-4 text-gray-700" />
        </button>
        <input 
          type="number"
          :value="quantity" 
          @input="handleQuantityInput"
          @blur="handleQuantityBlur"
          min="1"
          :max="product.quantity"
          class="w-14 h-12 text-center font-bold text-gray-900 border-x-2 border-gray-200 outline-none bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button 
          @click="increaseQty"
          class="w-11 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Plus class="w-4 h-4 text-gray-700" />
        </button>
      </div>

      <button 
        @click="emit('addToCart')"
        :disabled="addingToCart"
        class="flex-1 h-12 bg-gray-900 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg hover:bg-glow-primary-600 hover:shadow-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <ShoppingBag class="w-5 h-5" v-if="!addingToCart" />
        <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" v-else></div>
        <span>{{ addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ' }}</span>
      </button>

      <button 
        @click="emit('toggleWishlist')"
        class="w-12 h-12 border-2 border-gray-200 rounded-xl flex items-center justify-center hover:border-glow-primary-500 hover:text-glow-primary-600 hover:bg-glow-primary-50 transition-all duration-300 active:scale-95 group"
      >
        <Heart class="w-5 h-5 group-hover:fill-current" />
      </button>
    </div>

    <!-- Policies -->
    <div class="space-y-3 pt-6 border-t border-gray-100">
      <div class="flex items-center gap-3 text-sm text-gray-700">
        <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Truck class="w-5 h-5 text-blue-600" />
        </div>
        <span>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</span>
      </div>
      <div class="flex items-center gap-3 text-sm text-gray-700">
        <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
          <ShieldCheck class="w-5 h-5 text-green-600" />
        </div>
        <span>Cam kết chính hãng 100%</span>
      </div>
      <div class="flex items-center gap-3 text-sm text-gray-700">
        <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 class="w-5 h-5 text-purple-600" />
        </div>
        <span>Đổi trả miễn phí trong 7 ngày</span>
      </div>
    </div>
  </div>
</template>
