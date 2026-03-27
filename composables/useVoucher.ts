import { ref } from "vue";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { Voucher } from "../@type/voucher";

export const useVoucher = () => {
  const { $db } = useNuxtApp();
  const db = $db as Firestore;

  const vouchers = ref<Voucher[]>([]);
  const voucher = ref<Voucher | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getAll = async () => {
    loading.value = true;
    try {
      const snapshot = await getDocs(collection(db, "vouchers"));

      vouchers.value = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          code: data.code ?? "",
          discount_type: data.discount_type ?? "percent",
          discount_value: Number(data.discount_value) || 0,
          min_order_value: Number(data.min_order_value) || 0,
          max_discount: data.max_discount ?? null,
          quantity: Number(data.quantity) || 0,
          start_date: data.start_date ?? "",
          end_date: data.end_date ?? "",
          status: data.status ?? "active",
          created_at: data.created_at,
        };
      }) as Voucher[];
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id: string) => {
    loading.value = true;
    try {
      const snap = await getDoc(doc(db, "vouchers", id));
      if (!snap.exists()) throw new Error("Không tìm thấy");

      voucher.value = {
        id: snap.id,
        ...snap.data(),
      } as Voucher;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };


  const create = async (data: Partial<Voucher>) => {
    loading.value = true;
    try {
      await addDoc(collection(db, "vouchers"), {
        ...data,
        max_discount: data.max_discount ?? null, // tránh undefined ❗
        created_at: serverTimestamp(),
      });
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const update = async (id: string, data: Partial<Voucher>) => {
    loading.value = true;
    try {
      await updateDoc(doc(db, "vouchers", id), {
        ...data,
        max_discount: data.max_discount ?? null,
      });
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "vouchers", id), {
      status,
    });
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, "vouchers", id));
  };

  return {
    vouchers,
    voucher,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    updateStatus,
    remove,
  };
};