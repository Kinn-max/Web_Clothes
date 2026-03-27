<script setup lang="ts">
import { Trash2, Minus, Plus } from "lucide-vue-next";

const props = defineProps<{
  item: {
    product_id: string;
    name: string;
    brand: string;
    price: number;
    quantity: number;
    images: string[];
  };
  imageBaseUrl: string;
  selected: boolean;
}>();

const emit = defineEmits<{
  updateQuantity: [productId: string, quantity: number];
  removeItem: [productId: string];
  toggleSelect: [productId: string];
}>();

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

// Hỗ trợ cả URL đầy đủ (Cloudinary) lẫn tên file thông thường
const getImageUrl = (img: string) => {
  if (!img) return "https://placehold.co/100x100?text=No+Image";
  return img.startsWith("http") ? img : `${props.imageBaseUrl}/${img}`;
};

const handleInputChange = (e: Event) => {
  const val = parseInt((e.target as HTMLInputElement).value);
  if (!isNaN(val) && val >= 1) {
    emit("updateQuantity", props.item.product_id, val);
  }
};

const handleBlur = (e: Event) => {
  const val = parseInt((e.target as HTMLInputElement).value);
  if (isNaN(val) || val < 1) {
    emit("updateQuantity", props.item.product_id, 1);
  }
};
</script>

<template>
  <div
    class="flex items-center gap-4 p-4 bg-white rounded-xl border transition-all duration-200"
    :class="selected ? 'border-glow-primary-400 shadow-md' : 'border-gray-100 shadow-sm hover:shadow-md'"
  >
    <!-- Checkbox -->
    <input
      type="checkbox"
      :checked="selected"
      @change="emit('toggleSelect', item.product_id)"
      class="w-5 h-5 rounded border-gray-300 text-glow-primary-600 focus:ring-glow-primary-500 cursor-pointer flex-shrink-0"
    />

    <!-- Ảnh sản phẩm -->
    <div class="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
      <img
        :src="getImageUrl(item.images?.[0])"
        :alt="item.name"
        class="w-full h-full object-cover"
        loading="lazy"
      />
    </div>

    <!-- Thông tin sản phẩm -->
    <div class="flex-grow min-w-0">
      <p class="text-xs font-bold text-glow-primary-500 uppercase tracking-wider mb-1">
        {{ item.brand }}
      </p>
      <h3 class="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-2">
        {{ item.name }}
      </h3>
      <p class="text-base font-bold text-glow-primary-600">
        {{ formatPrice(item.price) }}
      </p>
    </div>

    <!-- Điều chỉnh số lượng + xóa -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- Quantity control -->
      <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
        <button
          @click="emit('updateQuantity', item.product_id, item.quantity - 1)"
          :disabled="item.quantity <= 1"
          class="w-8 h-8 flex items-center justify-center border-r border-gray-200 transition-colors"
          :class="item.quantity <= 1
            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
            : 'hover:bg-gray-50 text-gray-700'"
        >
          <Minus class="w-3.5 h-3.5" />
        </button>

        <input
          type="number"
          :value="item.quantity"
          min="1"
          @change="handleInputChange"
          @blur="handleBlur"
          class="w-10 h-8 text-center text-sm font-bold bg-transparent border-none focus:outline-none focus:ring-0
                 [appearance:textfield]
                 [&::-webkit-outer-spin-button]:appearance-none
                 [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          @click="emit('updateQuantity', item.product_id, item.quantity + 1)"
          class="w-8 h-8 flex items-center justify-center border-l border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
        >
          <Plus class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Tổng tiền item -->
      <div class="hidden sm:block w-24 text-right">
        <p class="text-sm font-bold text-gray-900">
          {{ formatPrice(item.price * item.quantity) }}
        </p>
        <p class="text-xs text-gray-400">tổng</p>
      </div>

      <!-- Nút xóa -->
      <button
        @click="emit('removeItem', item.product_id)"
        class="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
        title="Xóa sản phẩm"
      >
        <Trash2 class="w-4.5 h-4.5" />
      </button>
    </div>
  </div>
</template>