<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ArrowLeft } from "lucide-vue-next";
import { useRoute } from "vue-router";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useCart } from "@/composables/useCart";
import ShippingAddress from "@/components/order/ShippingAddress.vue";
import PaymentMethod from "@/components/order/PaymentMethod.vue";
import OrderSummary from "@/components/order/OrderSummary.vue";
import VoucherSelector from "@/components/order/VoucherSelector.vue";
import type { Voucher } from "@/types/voucher";
import type { ContactInfo } from "@/types/contact";
import { usePayment } from "@/composables/usePayment";

const { useCreatePayment } = usePayment()
const { mutateAsync: createPayment } = useCreatePayment()

const route = useRoute();
const { showNotification } = useNotification();
const { user } = useAuth();
const { cart, removeMultiItems } = useCart();

const nuxtApp = useNuxtApp();
const db = nuxtApp.$db as import("firebase/firestore").Firestore;

const IMAGE_BASE_URL = "http://localhost:8081/uploads/products";

const selectedPaymentMethod = ref("COD");
const contactInfo = ref<ContactInfo>({ fullName: "", phone: "", address: "" });
const hasContactInfo = ref(false);
const selectedVoucher = ref<Voucher | null>(null);
const loading = ref(false);

const selectedItemIds = computed<string[]>(() => {
  const param = route.query.items as string;
  if (!param) return [];
  return param.split(",");
});

const selectedItems = computed(() => {
  if (!cart.value?.items) return [];
  return cart.value.items.filter((item) =>
    selectedItemIds.value.includes(String(item.product_id))
  );
});

const subtotal = computed(() =>
  selectedItems.value.reduce((s, i) => s + i.price * i.quantity, 0)
);

const shippingFee = computed(() => (subtotal.value >= 500000 ? 0 : 30000));

const discount = computed(() => {
  const v = selectedVoucher.value;
  if (!v) return 0;
  if (v.discount_type === "percent") {
    const d = (subtotal.value * v.discount_value) / 100;
    return v.max_discount ? Math.min(d, v.max_discount) : d;
  }
  return v.discount_value;
});

const total = computed(() => subtotal.value + shippingFee.value - discount.value);

const isContactInfoValid = computed(() =>
  contactInfo.value.fullName &&
  contactInfo.value.phone &&
  contactInfo.value.address
);

onMounted(() => {
  if (selectedItemIds.value.length === 0) {
    showNotification("Thông báo", "Vui lòng chọn sản phẩm từ giỏ hàng.", "warning");
    navigateTo("/cart");
  }
});

const handleEditContactInfo = () => (hasContactInfo.value = false);

const handlePlaceOrder = async () => {
  if (!isContactInfoValid.value) {
    showNotification("Lỗi", "Vui lòng điền đầy đủ thông tin liên hệ và địa chỉ giao hàng.", "error");
    return;
  }

  loading.value = true;
  try {
    const orderData = {
      userId: user.value?.userId ?? null,
      items: selectedItems.value.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity,
        images: item.images,
      })),
      subtotal: subtotal.value,
      shippingFee: shippingFee.value,
      discount: discount.value,
      totalPrice: total.value,
      status: "pending",
      paymentMethod: selectedPaymentMethod.value,
      shippingAddress: { ...contactInfo.value },
      ...(selectedVoucher.value
        ? { voucherId: selectedVoucher.value.id, voucherCode: selectedVoucher.value.code }
        : {}),
      createdAt: serverTimestamp(),
    };

    const orderRef = await addDoc(collection(db, "orders"), orderData);

    if (selectedPaymentMethod.value === 'Banking') {
      showNotification('Thông báo', 'Đang chuyển đến Stripe...', 'info');
      await createPayment({
        order_id: orderRef.id,
        amount: total.value,
        order_desc: `Thanh toan GlowUp #${orderRef.id.slice(0, 8)}`,
      });
    } else {
      await removeMultiItems(selectedItemIds.value);
      showNotification('Thành công', 'Đặt hàng thành công!', 'success');
      navigateTo(`/order/success?id=${orderRef.id}`);
    }
  } catch (error: any) {
    console.error("[checkout] handlePlaceOrder:", error);
    showNotification("Lỗi", "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.", "error");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <NuxtLink to="/cart" class="text-gray-500 hover:text-glow-primary-600 transition-colors">
          <ArrowLeft class="w-6 h-6" />
        </NuxtLink>
        <h1 class="text-3xl font-serif font-bold text-gray-900">Đặt hàng</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cột trái -->
        <div class="lg:col-span-2 space-y-6">
          <ShippingAddress
            :contactInfo="contactInfo"
            :hasContactInfo="hasContactInfo"
            @editContactInfo="handleEditContactInfo"
            @update:contactInfo="(val) => (contactInfo = val)"
            @update:hasContactInfo="(val) => (hasContactInfo = val)"
          />

          <PaymentMethod
            :selectedMethod="selectedPaymentMethod"
            @selectMethod="(m) => (selectedPaymentMethod = m)"
          />

          <VoucherSelector
            :subtotal="subtotal"
            :selectedVoucher="selectedVoucher"
            @selectVoucher="(v) => (selectedVoucher = v)"
          />
        </div>

        <!-- Cột phải -->
        <div class="lg:col-span-1">
          <OrderSummary
            :items="selectedItems"
            :imageBaseUrl="IMAGE_BASE_URL"
            :subtotal="subtotal"
            :shippingFee="shippingFee"
            :discount="discount"
            :total="total"
            @placeOrder="handlePlaceOrder"
          />
        </div>
      </div>

      <!-- Loading overlay -->
      <div
        v-if="loading"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white p-8 rounded-2xl shadow-xl text-center">
          <div
            class="w-12 h-12 border-4 border-gray-200 border-t-glow-primary-600 rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-700 font-medium">Đang xử lý đơn hàng...</p>
        </div>
      </div>
    </div>
  </div>
</template>