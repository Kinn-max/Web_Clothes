import { ref } from "vue";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import type { Product } from "@/@type/product";

export const useProduct = () => {
  const { $db, $storage } = useNuxtApp();
  const db = $db as Firestore;
  const storage = $storage as FirebaseStorage;

  const products = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(collection(db, "products"));

  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name ?? "",
      brand: data.brand ?? "",
      gender: data.gender ?? "",
      price: Number(data.price) || 0,
      quantity: Number(data.quantity) || 0,
      description: data.description ?? "",
      images: (data.images),
      category_id: data.category_id ?? "",
    };
  });
};

  const getProductById = async (id: string) => {
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) throw new Error("Không tìm thấy sản phẩm");
    return { id: snap.id, ...snap.data() };
  };

  const getProductsByCat = async (categoryId: string) => {
    const q = query(
      collection(db, "products"),
      where("category_id", "==", categoryId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  const getRandomProducts = async (
    limit: number = 4,
    excludeId?: string
  ) => {
    const all = await getProducts();
    const filtered = excludeId ? all.filter((p) => p.id !== excludeId) : all;
    return filtered.sort(() => 0.5 - Math.random()).slice(0, limit);
  };
  const getRelatedProducts = async (
    productId: string,
    limit: number = 4
  ) => {
    try {
      const current: any = await getProductById(productId);
      if (current.category_id) {
        const catProducts = await getProductsByCat(current.category_id);
        const filtered = catProducts.filter((p) => p.id !== productId);
        if (filtered.length >= limit) return filtered.slice(0, limit);
        const random = await getRandomProducts(
          limit - filtered.length,
          productId
        );
        return [...filtered, ...random].slice(0, limit);
      }
      return await getRandomProducts(limit, productId);
    } catch {
      return await getRandomProducts(limit, productId);
    }
  };

  const loadProducts = async () => {
    loading.value = true;
    error.value = null;
    try {
      products.value = await getProducts();
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const uploadImagesToCloudinary = async (files: File[]) => {
    const urls: string[] = [];

    for (const file of files) {
      const uploaded = await uploadToCloudinary(file);
      if (uploaded?.url) {
        urls.push(uploaded.url);
      }
    }

    return urls;
  };
 const createProduct = async (data: any, files: File[]) => {
  try {
    let imageUrls: string[] = [];

    if (files.length) {
      imageUrls = await uploadImagesToCloudinary(files);
    }

    await addDoc(collection(db, "products"), {
      ...data,
      images: imageUrls, 
      created_at: serverTimestamp(),
    });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    throw err;
  }
};
  const updateProduct = async (
  id: string,
  data: any,
  newFiles: File[],
  keepImages: string[]
) => {
  try {
    let images = [...keepImages];

    if (newFiles.length) {
      const uploaded = await uploadImagesToCloudinary(newFiles);
      images = [...images, ...uploaded];
    }

    await updateDoc(doc(db, "products", id), {
      ...data,
      images, 
      updated_at: serverTimestamp(),
    });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    throw err;
  }
};

  const deleteProduct = async (id: string) => {
    const product: any = await getProductById(id);
    // Xóa ảnh trên storage
    // if (product.images?.length) {
    //   for (const url of product.images) {
    //     await deleteImageByUrl(url);
    //   }
    // }
    await deleteDoc(doc(db, "products", id));
  };

  return {
    products,
    loading,
    error,
    loadProducts,
    getProducts,
    getProductById,
    getProductsByCat,
    getRandomProducts,
    getRelatedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};