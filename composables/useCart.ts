import { ref, computed, watch } from "vue";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
  increment,
} from "firebase/firestore";
import { useAuth } from "./useAuth";

export interface CartItem {
  product_id: string;
  quantity: number;
  added_at: number;
  name: string;
  price: number;
  brand: string;
  images: string[];
  gender: string;
  description: string;
}

export interface Cart {
  user_id: string;
  cart_id: string;
  items: CartItem[];
  total_quantity: number;
  total_price: number;
}

export interface AddToCartPayload {
  product_id: string | number;
  name: string;
  price: number;
  brand: string;
  images: string[];
  gender?: string;
  description?: string;
}

export const useCart = () => {
  const { user, isAuthenticated } = useAuth();

  // Lấy db từ plugin — cùng instance với useAuth
  const nuxtApp = useNuxtApp();
  const db = nuxtApp.$db as import("firebase/firestore").Firestore;

  const cart = useState<Cart | null>("cart_state", () => null);
  const loading = ref(false);
  const cartCount = computed(() => cart.value?.total_quantity ?? 0);

  const calcTotals = (items: CartItem[]) => ({
    total_quantity: items.reduce((sum, i) => sum + i.quantity, 0),
    total_price: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  });

  // userId = Firebase uid, được map thành AuthUser.userId trong plugin
  const getUserId = (): string | null => {
    if (!isAuthenticated.value || !user.value?.userId) return null;
    return user.value.userId;
  };

  const ensureCartDoc = async (userId: string) => {
    const cartRef = doc(db, "carts", userId);
    const snap = await getDoc(cartRef);
    if (!snap.exists()) {
      await setDoc(cartRef, {
        user_id: userId,
        cart_id: userId,
        total_quantity: 0,
        total_price: 0,
      });
    }
    return cartRef;
  };

  const fetchCart = async () => {
    const userId = getUserId();
    if (!userId) { cart.value = null; return; }

    loading.value = true;
    try {
      const cartRef = doc(db, "carts", userId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        await setDoc(cartRef, { user_id: userId, cart_id: userId, total_quantity: 0, total_price: 0 });
        cart.value = { user_id: userId, cart_id: userId, items: [], total_quantity: 0, total_price: 0 };
        return;
      }

      const itemsSnap = await getDocs(collection(db, "carts", userId, "items"));
      console.log("🛒 Raw Firestore docs:", itemsSnap.docs);
      const items: CartItem[] = itemsSnap.docs
        .map((d) => {
          const data = d.data() as CartItem;

          console.log("📦 Item data:", data); // 🔥 LOG Ở ĐÂY

          return data;
        })
        .sort((a, b) => a.added_at - b.added_at);
      const totals = calcTotals(items);
      cart.value = { ...(cartSnap.data() as Omit<Cart, "items">), items, ...totals };
      await updateDoc(cartRef, totals);
    } catch (err) {
      console.error("[useCart] fetchCart:", err);
      cart.value = null;
    } finally {
      loading.value = false;
    }
  };

  const addToCart = async (payload: AddToCartPayload, quantity: number) => {
    const userId = getUserId();
    if (!userId) { navigateTo("/auth/login"); return; }

    loading.value = true;
    try {
      const pid = String(payload.product_id);
      await ensureCartDoc(userId);

      const itemRef = doc(db, "carts", userId, "items", pid);
      const itemSnap = await getDoc(itemRef);

      if (itemSnap.exists()) {
        await updateDoc(itemRef, { quantity: increment(quantity) });
      } else {
        await setDoc(itemRef, {
          product_id: pid,
          quantity,
          added_at: Date.now(),
          name: payload.name,
          price: payload.price,
          brand: payload.brand,
          images: payload.images ?? [],
          gender: payload.gender ?? "",
          description: payload.description ?? "",
        } as CartItem);
      }

      await fetchCart();
    } catch (err) {
      console.error("[useCart] addToCart:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const userId = getUserId();
    if (!userId || quantity < 1) return;
    loading.value = true;
    try {
      await updateDoc(doc(db, "carts", userId, "items", productId), { quantity });
      await fetchCart();
    } catch (err) { console.error("[useCart] updateQuantity:", err); throw err; }
    finally { loading.value = false; }
  };

  const removeItem = async (productId: string) => {
    const userId = getUserId();
    if (!userId) return;
    loading.value = true;
    try {
      await deleteDoc(doc(db, "carts", userId, "items", productId));
      await fetchCart();
    } catch (err) { console.error("[useCart] removeItem:", err); throw err; }
    finally { loading.value = false; }
  };

  const removeMultiItems = async (productIds: string[]) => {
    const userId = getUserId();
    if (!userId || productIds.length === 0) return;
    loading.value = true;
    try {
      const batch = writeBatch(db);
      productIds.forEach((pid) => batch.delete(doc(db, "carts", userId, "items", pid)));
      await batch.commit();
      await fetchCart();
    } catch (err) { console.error("[useCart] removeMultiItems:", err); throw err; }
    finally { loading.value = false; }
  };

  const clearCart = async () => {
    const userId = getUserId();
    if (!userId) return;
    loading.value = true;
    try {
      const itemsSnap = await getDocs(collection(db, "carts", userId, "items"));
      const batch = writeBatch(db);
      itemsSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      await updateDoc(doc(db, "carts", userId), { total_quantity: 0, total_price: 0 });
      if (cart.value) {
        cart.value = { ...cart.value, items: [], total_quantity: 0, total_price: 0 };
      }
    } catch (err) { console.error("[useCart] clearCart:", err); throw err; }
    finally { loading.value = false; }
  };

  if (process.client) {
    watch(isAuthenticated, (val) => { if (val) fetchCart(); else cart.value = null; }, { immediate: true });
  }

  return { cart, cartCount, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart, removeMultiItems };
};