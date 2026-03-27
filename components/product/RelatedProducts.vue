<script setup lang="ts">
const props = defineProps<{
  products: any[];
  imageBaseUrl: string;
}>();

const getImageUrl = (product: any) => {
  // Nếu product có images array
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (firstImage.startsWith("http")) {
      return firstImage;
    }
    return `${props.imageBaseUrl}/${firstImage}`;
  }
  
  // Nếu có image field (string)
  if (product.image) {
    if (product.image.startsWith("http")) {
      return product.image;
    }
    return `${props.imageBaseUrl}/${product.image}`;
  }
  
  // Fallback
  return "https://placehold.co/600x600?text=No+Image";
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const getBrandName = (product: any) => {
  // Có thể có brand object hoặc brand string
  return product.brand?.name || product.brand || "Chưa có thương hiệu";
};
</script>

<template>
  <div class="mt-20">
    <h2 class="font-serif text-3xl text-gray-900 text-center mb-10">Sản Phẩm Tương Tự</h2>
    
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <NuxtLink
        v-for="item in products"
        :key="item.id"
        :to="`/shop/products/${item.id}`"
        class="group block"
      >
        <!-- Product Image -->
        <div class="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 mb-4 relative shadow-sm group-hover:shadow-xl transition-all duration-500 border border-gray-100">
          <img 
            :src="getImageUrl(item)" 
            :alt="item.name"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
          
          <!-- Hover Overlay -->
          <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div class="w-full py-2.5 bg-white text-gray-900 rounded-xl font-bold text-sm text-center shadow-lg">
              Xem chi tiết
            </div>
          </div>

          <!-- Sale Badge (if has discount) -->
          <div 
            v-if="item.discount_percentage && item.discount_percentage > 0"
            class="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
          >
            -{{ item.discount_percentage }}%
          </div>

          <!-- Stock Badge -->
          <div 
            v-if="item.stock !== undefined && item.stock <= 5 && item.stock > 0"
            class="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
          >
            Còn {{ item.stock }}
          </div>
          
          <div 
            v-else-if="item.stock === 0"
            class="absolute top-3 left-3 bg-gray-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"
          >
            Hết hàng
          </div>
        </div>

        <!-- Product Info -->
        <div>
          <!-- Brand -->
          <div class="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">
            {{ getBrandName(item) }}
          </div>
          
          <!-- Name -->
          <div class="font-semibold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-glow-primary-600 transition-colors">
            {{ item.name }}
          </div>
          
          <!-- Price -->
          <div class="flex items-center gap-2">
            <div class="font-bold text-glow-primary-600 text-lg">
              {{ formatPrice(item.price) }}
            </div>
            
            <!-- Original Price (if has discount) -->
            <div 
              v-if="item.original_price && item.original_price > item.price"
              class="text-sm text-gray-400 line-through"
            >
              {{ formatPrice(item.original_price) }}
            </div>
          </div>

          <!-- Rating (if available) -->
          <div v-if="item.rating" class="flex items-center gap-1 mt-2">
            <div class="flex">
              <span 
                v-for="star in 5" 
                :key="star"
                class="text-yellow-400 text-sm"
              >
                {{ star <= Math.round(item.rating) ? '★' : '☆' }}
              </span>
            </div>
            <span class="text-xs text-gray-500">
              ({{ item.rating }})
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-if="products.length === 0" class="text-center py-12">
      <p class="text-gray-500">Không có sản phẩm liên quan</p>
    </div>
  </div>
</template>