<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useOrder } from "../../composables/useOrder";
import { useProduct } from "@/composables/useProduct";
import { useUsers } from "../../composables/useUser";

definePageMeta({
  layout: "admin",
});

const orderComposable = useOrder();
const productComposable = useProduct();
const userComposable = useUsers();

const totalProducts = ref(0);
const totalUsers = ref(0);
const loading = ref(true);

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      orderComposable.fetchAllOrders(),
      productComposable.getProducts().then((res) => (totalProducts.value = res.length)),
      userComposable.loadUsers().then(() => (totalUsers.value = userComposable.users.value.length)),
    ]);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDashboardData);

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = computed(() => {
  const orders = orderComposable.orders.value ?? [];
  const completedOrders = orders.filter((o) => o.status?.toLowerCase() === "completed");

  // Dùng field "totalPrice" (Firestore) thay vì "total_price"
  const revenue = completedOrders.reduce((sum, o) => sum + Number(o.totalPrice ?? 0), 0);

  return [
    {
      label: "Tổng doanh thu",
      value: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(revenue),
      icon: "dollar",
      color: "bg-emerald-50 text-emerald-600",
      trend: "+12.5%",
      isPositive: true,
    },
    {
      label: "Đơn hàng hoàn tất",
      value: completedOrders.length,
      icon: "shopping-bag",
      color: "bg-blue-50 text-blue-600",
      trend: "+8.2%",
      isPositive: true,
    },
    {
      label: "Sản phẩm",
      value: totalProducts.value,
      icon: "package",
      color: "bg-purple-50 text-purple-600",
      trend: "+3",
      isPositive: true,
    },
    {
      label: "Người dùng",
      value: totalUsers.value,
      icon: "users",
      color: "bg-orange-50 text-orange-600",
      trend: "+15",
      isPositive: true,
    },
  ];
});

// ─── Revenue Chart (7 ngày) ───────────────────────────────────────────────────
const revenueChartData = computed(() => {
  const orders = orderComposable.orders.value ?? [];
  const completedOrders = orders.filter((o) => o.status?.toLowerCase() === "completed");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));

    // Dùng field "createdAt" (Firestore) thay vì "created_at"
    const dayTotal = completedOrders.reduce((sum, o) => {
      const orderDate = new Date(o.createdAt);
      if (
        orderDate.getFullYear() === d.getFullYear() &&
        orderDate.getMonth() === d.getMonth() &&
        orderDate.getDate() === d.getDate()
      ) {
        return sum + Number(o.totalPrice ?? 0);
      }
      return sum;
    }, 0);

    return {
      total: dayTotal,
      label: d.toLocaleDateString("vi-VN", { weekday: "short" }),
      date: d.toISOString(),
    };
  });

  const maxTotal = Math.max(...days.map((d) => d.total), 1);

  return days.map((d) => ({
    ...d,
    height: d.total > 0 ? (d.total / maxTotal) * 85 + 15 : 0,
  }));
});

// ─── Recent Orders ────────────────────────────────────────────────────────────
const recentOrders = computed(() =>
  [...(orderComposable.orders.value ?? [])]
    // Dùng "createdAt" thay "created_at"
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed": return "bg-emerald-100 text-emerald-700";
    case "pending":   return "bg-amber-100 text-amber-700";
    case "cancelled": return "bg-rose-100 text-rose-700";
    case "shipping":  return "bg-blue-100 text-blue-700";
    case "confirmed": return "bg-sky-100 text-sky-700";
    default:          return "bg-slate-100 text-slate-700";
  }
};

const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed": return "Hoàn tất";
    case "pending":   return "Chờ xử lý";
    case "cancelled": return "Đã hủy";
    case "shipping":  return "Đang giao";
    case "confirmed": return "Đã xác nhận";
    default:          return status ?? "—";
  }
};

const formatDate = (val: any) => {
  const d = typeof val === "string" ? new Date(val) : val;
  if (!(d instanceof Date) || isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const paymentMethodLabel = (m?: string) => {
  switch (m?.toLowerCase()) {
    case "banking": return "Chuyển khoản";
    case "cod":     return "COD";
    default:        return m ?? "—";
  }
};
</script>

<template>
  <div class="dashboard-container">
    <div class="dashboard-header mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Tổng quan hệ thống</h1>
      <p class="text-slate-500 mt-1">Chào mừng quay lại, đây là những gì đang diễn ra trong hôm nay.</p>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="flex justify-between items-start mb-4">
          <div :class="['icon-wrapper', stat.color]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <template v-if="stat.icon === 'dollar'">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </template>
              <template v-else-if="stat.icon === 'shopping-bag'">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </template>
              <template v-else-if="stat.icon === 'package'">
                <path d="m7.5 4.27 9 5.15"/>
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
              </template>
              <template v-else-if="stat.icon === 'users'">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </template>
            </svg>
          </div>
          <span :class="['trend-badge', stat.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50']">
            {{ stat.trend }}
          </span>
        </div>
        <h3 class="text-slate-500 text-sm font-medium">{{ stat.label }}</h3>
        <p class="text-2xl font-bold text-slate-900 mt-1">{{ stat.value }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Revenue Chart -->
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-slate-900">Biểu đồ doanh thu</h2>
          <span class="text-sm bg-slate-50 rounded-lg px-3 py-1 text-slate-600">7 ngày qua</span>
        </div>
        <div class="h-64 flex justify-between gap-3 pt-4">
          <div
            v-for="(day, i) in revenueChartData"
            :key="i"
            class="flex-1 h-full flex flex-col justify-end group relative"
          >
            <div
              :style="{ height: day.total > 0 ? (day.height ?? 0) + '%' : '4px' }"
              :class="[
                'w-full rounded-t-lg transition-all duration-300 cursor-pointer',
                day.total > 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-slate-200',
              ]"
            ></div>
            <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {{ (day.total ?? 0).toLocaleString("vi-VN") }}đ
            </span>
          </div>
        </div>
        <div class="flex justify-between mt-4 text-xs text-slate-400">
          <span v-for="day in revenueChartData" :key="day.date">{{ day.label }}</span>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-slate-900">Đơn hàng mới nhất</h2>
          <NuxtLink to="/admin/orders" class="text-xs text-blue-600 font-medium hover:underline">
            Xem tất cả
          </NuxtLink>
        </div>

        <div class="space-y-4">
          <!-- Loading skeleton -->
          <div v-if="loading" class="animate-pulse space-y-4">
            <div v-for="i in 5" :key="i" class="h-12 bg-slate-50 rounded-xl"></div>
          </div>

          <template v-else-if="recentOrders.length > 0">
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <!-- Avatar rút gọn từ Firestore string ID -->
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] flex-shrink-0">
                  {{ order.id.slice(0, 4).toUpperCase() }}
                </div>
                <div>
                  <!-- Dùng createdAt thay created_at -->
                  <p class="text-sm font-bold text-slate-900">{{ formatDate(order.createdAt) }}</p>
                  <!-- Dùng paymentMethod thay payment_method -->
                  <p class="text-xs text-slate-500">{{ paymentMethodLabel(order.paymentMethod) }}</p>
                </div>
              </div>
              <div class="text-right">
                <!-- Dùng totalPrice thay total_price -->
                <p class="text-sm font-bold text-slate-900">
                  {{ (order.totalPrice ?? 0).toLocaleString("vi-VN") }}đ
                </p>
                <span :class="['text-[10px] px-2 py-0.5 rounded-full font-bold', getStatusBadge(order.status)]">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
            </div>
          </template>

          <div v-else class="text-center py-12 text-slate-400 text-sm">
            Chưa có đơn hàng nào.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 2rem;
  background-color: #f8fafc;
  min-height: calc(100vh - 64px);
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1.25rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.icon-wrapper {
  padding: 0.75rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: 2rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dashboard-container > div { animation: fadeIn 0.5s ease-out forwards; }
.dashboard-container > div:nth-child(2) { animation-delay: 0.1s; }
.dashboard-container > div:nth-child(3) { animation-delay: 0.2s; }
</style>