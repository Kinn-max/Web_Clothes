import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { Store } from "@/@type/store";

export const useStore = () => {
  const { $db } = useNuxtApp();
  const db = $db as Firestore;

  const loading = ref(false);
  const error = ref<string | null>(null);

  /** Chuyển Firestore doc → Store object */
  const normalize = (id: string, data: any): Store => ({
    ...data,
    id,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt ?? null,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt ?? null,
  });

  /** Lấy tất cả cửa hàng */
  const getAllStores = async (): Promise<Store[]> => {
    loading.value = true;
    error.value = null;
    try {
      const snap = await getDocs(collection(db, "stores"));
      return snap.docs.map((d) => normalize(d.id, d.data()));
    } catch (err: any) {
      error.value = "Không thể lấy danh sách cửa hàng";
      console.error("[useStore] getAllStores:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /** Lấy cửa hàng theo ID */
  const getStoreById = async (storeId: string): Promise<Store> => {
    loading.value = true;
    error.value = null;
    try {
      const snap = await getDoc(doc(db, "stores", storeId));
      if (!snap.exists()) throw new Error("Không tìm thấy cửa hàng");
      return normalize(snap.id, snap.data());
    } catch (err: any) {
      error.value = "Không thể lấy thông tin cửa hàng";
      console.error("[useStore] getStoreById:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Lấy cửa hàng của manager hiện tại.
   * Query: stores where managerId == current user's uid
   */
  const getMyStores = async (): Promise<Store[]> => {
    const { user } = useAuth();
    const uid = user.value?.userId;
    if (!uid) return [];

    loading.value = true;
    error.value = null;
    try {
      const q = query(
        collection(db, "stores"),
        where("managerId", "==", uid)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => normalize(d.id, d.data()));
    } catch (err: any) {
      error.value = "Không thể lấy cửa hàng của bạn";
      console.error("[useStore] getMyStores:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /** Tạo cửa hàng mới (Admin) */
  const createStore = async (storeData: Omit<Store, "id">): Promise<Store> => {
    loading.value = true;
    error.value = null;
    try {
      const ref = await addDoc(collection(db, "stores"), {
        ...storeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { ...storeData, id: ref.id };
    } catch (err: any) {
      error.value = "Không thể tạo cửa hàng";
      console.error("[useStore] createStore:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /** Cập nhật cửa hàng */
  const updateStore = async (
    storeId: string,
    storeData: Partial<Store>
  ): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      // Loại bỏ field "id" trước khi lưu vào Firestore
      const { id: _id, ...data } = storeData as any;
      await updateDoc(doc(db, "stores", storeId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      error.value = "Không thể cập nhật cửa hàng";
      console.error("[useStore] updateStore:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /** Xóa cửa hàng (Admin) */
  const deleteStore = async (storeId: string): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      await deleteDoc(doc(db, "stores", storeId));
    } catch (err: any) {
      error.value = "Không thể xóa cửa hàng";
      console.error("[useStore] deleteStore:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    getAllStores,
    getStoreById,
    getMyStores,
    createStore,
    updateStore,
    deleteStore,
  };
};