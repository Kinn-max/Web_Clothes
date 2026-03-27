import { ref } from "vue";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export interface Category {
  id?: string;
  name: string;
  description?: string;
  image?: string;
  public_id?: string; 
  createdAt?: any;
  updatedAt?: any;
}
import { uploadToCloudinary } from "@/utils/cloudinary";
export const useCategory = () => {
  const categories = ref<Category[]>([]);
  const category = ref<Category | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const { $db } = useNuxtApp();
  const db = $db as ReturnType<typeof getFirestore>;
  const COLLECTION = "category";

 
  const getById = async (id: string) => {
    loading.value = true;
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (snap.exists()) {
        category.value = { id: snap.id, ...snap.data() } as Category;
      }
    } catch (err) {
      error.value = "Không thể tải danh mục";
    } finally {
      loading.value = false;
    }
  };
  // GET ALL
  const getAll = async () => {
  loading.value = true;
  try {
    const snapshot = await getDocs(collection(db, COLLECTION));
    categories.value = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Category[];

  } catch (err) {
    console.error(err);
    error.value = "Không thể tải danh mục";
  } finally {
    loading.value = false;
  }
};
  // CREATE
  const create = async (payload: {
    name: string;
    description?: string;
    image?: File;
  }) => {
    try {
      let imageUrl = "";
      let publicId = "";

      if (payload.image) {
        const uploaded = await uploadToCloudinary(payload.image);
        imageUrl = uploaded.url;
        publicId = uploaded.public_id;
      }

      const newCategory = {
        name: payload.name,
        description: payload.description || "",
        image: imageUrl,
        public_id: publicId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION), newCategory);

      await getAll();
      return { id: docRef.id, ...newCategory };
    } catch (err) {
      console.error("CREATE ERROR:", err);
      throw err;
    }
  };
  // UPDATE
  const update = async (
    id: string,
    payload: {
      name: string;
      description?: string;
      image?: File | null;
      removeImage?: boolean;
    }
  ) => {
    try {
      const docRef = doc(db, COLLECTION, id);
      const existing = await getDoc(docRef);
      const data = existing.data() as Category;

      let imageUrl = data.image || "";
      let publicId = data.public_id || "";

      if (payload.image) {
        const uploaded = await uploadToCloudinary(payload.image);
        imageUrl = uploaded.url;
        publicId = uploaded.public_id;
      }

      if (payload.removeImage && !payload.image) {
        imageUrl = "";
        publicId = "";
      }

      await updateDoc(docRef, {
        name: payload.name,
        description: payload.description || "",
        image: imageUrl,
        public_id: publicId,
        updatedAt: serverTimestamp(),
      });

      await getAll();
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      throw err;
    }
  };

  // DELETE
 const remove = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    categories.value = categories.value.filter((c) => c.id !== id);
  } catch (err) {
    error.value = "Không thể xóa";
    throw err;
  }
};

  return {
    categories,
    category,
    loading,
    error,
    getAll,
    create,
    update,
    remove,
    getById,
  };
};