import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import type { Address, AddressFormData } from "../@type/address";
import { useAuth } from "./useAuth";

export const useAddress = () => {
  const nuxtApp = useNuxtApp();
  const db = nuxtApp.$db as import("firebase/firestore").Firestore;
  const { user, isAuthenticated } = useAuth();

  const getUserId = (): string | null => {
    if (!isAuthenticated.value || !user.value?.userId) return null;
    return user.value.userId;
  };


  const addressesRef = (userId: string) =>
    collection(db, "users", userId, "addresses");

  const addressDocRef = (userId: string, addressId: string) =>
    doc(db, "users", userId, "addresses", addressId);



  const getAllAddresses = async (): Promise<Address[]> => {
    const userId = getUserId();
    if (!userId) throw new Error("Chưa đăng nhập");

    try {
      const q = query(addressesRef(userId), orderBy("created_at", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Address));
    } catch (err) {
      console.error("[useAddress] getAllAddresses:", err);
      throw err;
    }
  };



  const getAddressById = async (addressId: string): Promise<Address> => {
    const userId = getUserId();
    if (!userId) throw new Error("Chưa đăng nhập");

    try {
      const snap = await getDoc(addressDocRef(userId, addressId));
      if (!snap.exists()) throw new Error("Địa chỉ không tồn tại");
      return { id: snap.id, ...snap.data() } as Address;
    } catch (err) {
      console.error("[useAddress] getAddressById:", err);
      throw err;
    }
  };



  const createAddress = async (data: AddressFormData): Promise<Address> => {
    const userId = getUserId();
    if (!userId) throw new Error("Chưa đăng nhập");

    try {
      const batch = writeBatch(db);

      // Nếu đặt làm mặc định → bỏ mặc định các địa chỉ cũ
      if (data.is_default) {
        const existing = await getDocs(addressesRef(userId));
        existing.docs.forEach((d) => {
          if (d.data().is_default) {
            batch.update(d.ref, { is_default: false });
          }
        });
      }

      await batch.commit();

      // Thêm địa chỉ mới
      const payload = {
        ...data,
        user_id: userId,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      const docRef = await addDoc(addressesRef(userId), payload);
      return { id: docRef.id, ...payload } as Address;
    } catch (err) {
      console.error("[useAddress] createAddress:", err);
      throw err;
    }
  };


  const updateAddress = async (
    addressId: string,
    data: AddressFormData
  ): Promise<void> => {
    const userId = getUserId();
    if (!userId) throw new Error("Chưa đăng nhập");

    try {
      const batch = writeBatch(db);

      if (data.is_default) {
        const existing = await getDocs(addressesRef(userId));
        existing.docs.forEach((d) => {
          if (d.id !== addressId && d.data().is_default) {
            batch.update(d.ref, { is_default: false });
          }
        });
      }

      batch.update(addressDocRef(userId, addressId), {
        ...data,
        updated_at: Date.now(),
      });

      await batch.commit();
    } catch (err) {
      console.error("[useAddress] updateAddress:", err);
      throw err;
    }
  };



  const deleteAddress = async (addressId: string): Promise<void> => {
    const userId = getUserId();
    if (!userId) throw new Error("Chưa đăng nhập");

    try {
      await deleteDoc(addressDocRef(userId, addressId));
    } catch (err) {
      console.error("[useAddress] deleteAddress:", err);
      throw err;
    }
  };


  const setDefaultAddress = async (addressId: string): Promise<void> => {
    const userId = getUserId();
    if (!userId) throw new Error("Chưa đăng nhập");

    try {
      const snap = await getDocs(addressesRef(userId));
      const batch = writeBatch(db);

      snap.docs.forEach((d) => {
        const shouldBeDefault = d.id === addressId;
        if (d.data().is_default !== shouldBeDefault) {
          batch.update(d.ref, { is_default: shouldBeDefault });
        }
      });

      await batch.commit();
    } catch (err) {
      console.error("[useAddress] setDefaultAddress:", err);
      throw err;
    }
  };

  return {
    getAllAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};