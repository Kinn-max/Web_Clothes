<script setup lang="ts">
import { ref, computed } from "vue";
import { ArrowLeft } from "lucide-vue-next";
import { useCart } from "@/composables/useCart";
import CartItem from "@/components/cart/CartItem.vue";
import CartSummary from "@/components/cart/CartSummary.vue";
import EmptyCart from "@/components/cart/EmptyCart.vue";

const { showNotification } = useNotification();
const { isAuthenticated } = useAuth();
const { cart, loading, fetchCart, removeItem, clearCart, updateQuantity, removeMultiItems } =
  useCart();

const IMAGE_BASE_URL = "";

const selectedItems = ref<Set<string>>(new Set());



onMounted(() => {
  if (!isAuthenticated.value) {
    navigateTo("/auth/login");
    return;
  }
  fetchCart();
});



const selectedCartItems = computed(() => {
  if (!cart.value) return [];
  return cart.value.items.filter((item) =>
    selectedItems.value.has(String(item.product_id))
  );
});

const selectedTotalQuantity = computed(() =>
  selectedCartItems.value.reduce((sum, item) => sum + item.quantity, 0)
);

const selectedTotalPrice = computed(() =>
  selectedCartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

const allSelected = computed(() => {
  if (!cart.value || cart.value.items.length === 0) return false;
  return cart.value.items.every((item) =>
    selectedItems.value.has(String(item.product_id))
  );
});



const toggleSelectAll = () => {
  if (!cart.value) return;
  selectedItems.value = allSelected.value
    ? new Set()
    : new Set(cart.value.items.map((item) => String(item.product_id)));
};

const toggleSelectItem = (productId: string) => {
  const next = new Set(selectedItems.value);
  next.has(productId) ? next.delete(productId) : next.add(productId);
  selectedItems.value = next;
};

const handleRemoveItem = async (productId: string) => {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
  try {
    await removeItem(productId);
    const next = new Set(selectedItems.value);
    next.delete(productId);
    selectedItems.value = next;
    showNotification("Thành công", "Đã xóa sản phẩm khỏi giỏ hàng.", "success");
  } catch {
    showNotification("Lỗi", "Không thể xóa sản phẩm. Vui lòng thử lại.", "error");
  }
};

const handleRemoveSelected = async () => {
  if (selectedItems.value.size === 0) return;
  if (!confirm(`Xóa ${selectedItems.value.size} sản phẩm đã chọn?`)) return;
  try {
    await removeMultiItems(Array.from(selectedItems.value));
    selectedItems.value = new Set();
    showNotification("Thành công", "Đã xóa các sản phẩm đã chọn.", "success");
  } catch {
    showNotification("Lỗi", "Không thể xóa. Vui lòng thử lại.", "error");
  }
};

const handleClearCart = async () => {
  if (!confirm("Xóa toàn bộ giỏ hàng?")) return;
  try {
    await clearCart();
    selectedItems.value = new Set();
    showNotification("Thành công", "Đã làm trống giỏ hàng.", "success");
  } catch {
    showNotification("Lỗi", "Không thể xóa. Vui lòng thử lại.", "error");
  }
};

const handleUpdateQuantity = async (productId: string, newQty: number) => {
  if (newQty < 1) return;
  try {
    await updateQuantity(productId, newQty);
  } catch {
    showNotification("Lỗi", "Không thể cập nhật số lượng.", "error");
  }
};

const handleCheckout = () => {
  if (selectedItems.value.size === 0) {
    showNotification("Thông báo", "Vui lòng chọn sản phẩm để thanh toán.", "warning");
    return;
  }
  navigateTo({
    path: "/order",
    query: { items: Array.from(selectedItems.value).join(",") },
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="container mx-auto px-4 max-w-5xl">

      <!-- Header -->
      <div class="flex items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/shop"
            class="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-glow-primary-600 hover:border-glow-primary-300 transition-all"
          >
            <ArrowLeft class="w-5 h-5" />
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-serif font-bold text-gray-900">Giỏ hàng</h1>
            <p v-if="cart && cart.items.length > 0" class="text-sm text-gray-500">
              {{ cart.items.length }} sản phẩm
            </p>
          </div>
        </div>

        <!-- Actions khi có sản phẩm -->
        <div v-if="cart && cart.items.length > 0" class="flex items-center gap-3">
          <button
            v-if="selectedItems.size > 0"
            @click="handleRemoveSelected"
            class="text-xs font-medium text-red-400 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            Xóa đã chọn ({{ selectedItems.size }})
          </button>
          <button
            @click="handleClearCart"
            class="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-gray-200 border-t-glow-primary-600 rounded-full animate-spin" />
      </div>

      <!-- Empty Cart -->
      <EmptyCart v-else-if="!cart || cart.items.length === 0" />

      <!-- Cart Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Danh sách sản phẩm -->
        <div class="lg:col-span-2 space-y-3">

          <!-- Chọn tất cả -->
          <div class="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <label class="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 rounded border-gray-300 text-glow-primary-600 focus:ring-glow-primary-500 cursor-pointer"
              />
              <span class="text-sm font-semibold text-gray-700">
                Chọn tất cả
                <span class="text-gray-400 font-normal">({{ cart.items.length }} sản phẩm)</span>
              </span>
            </label>
          </div>

          <!-- Cart items -->
          <CartItem
            v-for="item in cart.items"
            :key="String(item.product_id)"
            :item="item"
            :imageBaseUrl="IMAGE_BASE_URL"
            :selected="selectedItems.has(String(item.product_id))"
            @updateQuantity="handleUpdateQuantity"
            @removeItem="handleRemoveItem"
            @toggleSelect="toggleSelectItem"
          />
        </div>

        <!-- Tóm tắt đơn hàng -->
        <div class="lg:col-span-1">
          <CartSummary
            :totalQuantity="selectedTotalQuantity"
            :totalPrice="selectedTotalPrice"
            :selectedCount="selectedItems.size"
            :hasSelection="selectedItems.size > 0"
            @checkout="handleCheckout"
          />
        </div>
      </div>

    </div>
  </div>
</template>