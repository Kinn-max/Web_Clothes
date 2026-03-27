import { ref } from "vue";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import type { Order } from "@/@type/order";


export const useOrder = () => {
  const nuxtApp = useNuxtApp();
  const db = nuxtApp.$db as import("firebase/firestore").Firestore;

  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** Chuyển Firestore Timestamp → chuỗi ISO để hiển thị */
  const normalizeOrder = (id: string, data: any): Order => ({
    ...data,
    id,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt ?? new Date().toISOString(),
  });

  /** Lấy tất cả đơn hàng của một user */
  const fetchUserOrders = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      orders.value = snap.docs.map((d) => normalizeOrder(d.id, d.data()));
      return orders.value;
    } catch (err: any) {
      console.error("[useOrder] fetchUserOrders:", err);
      error.value = "Có lỗi xảy ra khi tải danh sách đơn hàng.";
      return null;
    } finally {
      loading.value = false;
    }
  };

  /** Lấy tất cả đơn hàng (admin) */
  const fetchAllOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const q = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      orders.value = snap.docs.map((d) => normalizeOrder(d.id, d.data()));
      return orders.value;
    } catch (err: any) {
      console.error("[useOrder] fetchAllOrders:", err);
      error.value = "Có lỗi xảy ra khi tải danh sách đơn hàng.";
      return null;
    } finally {
      loading.value = false;
    }
  };

  /** Hủy đơn hàng: chỉ cập nhật status = "cancelled" */
  const cancelOrder = async (orderId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await updateDoc(doc(db, "orders", orderId), { status: "cancelled" });
      // Cập nhật local state ngay lập tức
      const idx = orders.value.findIndex((o) => o.id === orderId);
      if (idx !== -1) orders.value[idx].status = "cancelled";
    } catch (err: any) {
      console.error("[useOrder] cancelOrder:", err);
      error.value = "Có lỗi xảy ra khi hủy đơn hàng.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /** Cập nhật trạng thái đơn hàng (admin) */
  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    loading.value = true;
    error.value = null;
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      const idx = orders.value.findIndex((o) => o.id === orderId);
      if (idx !== -1) orders.value[idx].status = status;
    } catch (err: any) {
      console.error("[useOrder] updateOrderStatus:", err);
      error.value = "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    orders,
    loading,
    error,
    fetchUserOrders,
    fetchAllOrders,
    cancelOrder,
    updateOrderStatus,
  };
};