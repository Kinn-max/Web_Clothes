import { ref } from "vue";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc } from "firebase/firestore";
import type { Auth } from "firebase/auth";
export const useUsers = () => {
    const { $db, $auth } = useNuxtApp();
    const db = $db as Firestore;
    const auth = $auth as Auth;
  const users = ref<any[]>([]);
  const loading = ref(false);
  const showModal = ref(false);
  const editingUser = ref<any>(null);

  const toast = ref<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const form = ref({
    full_name: "",
    email: "",
    phone: "",
    role: "user",
    password:"",
    status: "active",
  });

  const showToast = (message: string, type: "success" | "error") => {
    toast.value = { message, type };
    setTimeout(() => (toast.value = null), 3000);
  };

  const loadUsers = async () => {
    loading.value = true;
    try {
      const snapshot = await getDocs(collection(db, "users"));
      users.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
    } catch (err) {
      console.error(err);
      showToast("Lỗi tải danh sách", "error");
    } finally {
      loading.value = false;
    }
  };

  const openModal = (user: any = null) => {
    editingUser.value = user;
    form.value = user
      ? {
          full_name: user.full_name ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          role: user.role ?? "user",
          status: user.status ?? "active",
          password: ""
        }
      : {
          full_name: "",
          email: "",
          phone: "",
          role: "user",
          status: "active",
          password: ""
        };

    showModal.value = true;
  };

  const saveUser = async () => {
  if (!form.value.full_name || !form.value.email) {
    showToast("Nhập đầy đủ thông tin", "error");
    return;
  }

  try {
    if (!editingUser.value) {
      if (!form.value.password) {
        showToast("Phải nhập mật khẩu", "error");
        return;
      }

     const secondaryApp = initializeApp(auth.app.options, "secondary-" + Date.now());
      const secondaryAuth = getAuth(secondaryApp);

      const credential = await createUserWithEmailAndPassword(
        secondaryAuth,       
        form.value.email,
        form.value.password
      );

      await updateProfile(credential.user, {
        displayName: form.value.full_name,
      });

      await setDoc(doc(db, "users", credential.user.uid), {
        email: form.value.email,
        full_name: form.value.full_name,
        phone: form.value.phone || "",
        role: form.value.role,
        status: form.value.status,
        created_at: new Date(),
      });

      await deleteApp(secondaryApp);

      showToast("Tạo user thành công", "success");
    } 
    await loadUsers();
    showModal.value = false;
  } catch (err: any) {
    console.error("CREATE USER ERROR:", err);

    const msg =
        err?.code === "auth/email-already-in-use"
        ? "Email đã tồn tại"
        : err?.code === "auth/weak-password"
        ? "Mật khẩu tối thiểu 6 ký tự"
        : err?.message || "Có lỗi xảy ra";

    showToast(msg, "error");
    }
};

  const deleteUser = async (id: string) => {
    if (!confirm("Xóa user?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      await loadUsers();
      showToast("Đã xóa", "success");
    } catch (err) {
      console.error(err);
      showToast("Lỗi xóa", "error");
    }
  };

  return {
    users,
    loading,
    showModal,
    editingUser,
    form,
    toast,
    loadUsers,
    openModal,
    saveUser,
    deleteUser,
  };
};