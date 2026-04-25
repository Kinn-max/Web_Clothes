import { computed } from "vue";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type { AuthUser } from "../@type/auth";

export const useAuth = () => {

  
  const nuxtApp = useNuxtApp();

  const $auth = nuxtApp.$auth as import("firebase/auth").Auth;
  const $db = nuxtApp.$db as import("firebase/firestore").Firestore;

  const token = useState<string | null>("auth_token", () => null);
  const user = useState<AuthUser | null>("auth_user", () => null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const getUserId = computed(() => user.value?.userId ?? null);


  
  //SIGNUP
  const signup = async (data: {
    full_name: string;
    email: string;
    password: string;
  }) => {
    const credential = await createUserWithEmailAndPassword(
      $auth,
      data.email,
      data.password
    );

    await updateProfile(credential.user, {
      displayName: data.full_name,
    });
    await setDoc(doc($db, "users", credential.user.uid), {
      email: data.email,
      full_name: data.full_name,
      role: "USER",
      status:"active",
      phone:"",
      created_at: new Date(),
    });

    return credential;
  };

  //LOGIN 
 const login = async (data: { email: string; password: string }) => {
  const userCredential = await signInWithEmailAndPassword(
    $auth,
    data.email,
    data.password
  );

  const user = userCredential.user;

  const token = await user.getIdToken();

  localStorage.setItem("token", token);

  return user;
};
  //GOOGLE LOGIN 
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup($auth, provider);

    const userRef = doc($db, "users", credential.user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: credential.user.email,
        full_name: credential.user.displayName,
        role: "USER",
        created_at: new Date(),
      });
    }
    const idToken = await credential.user.getIdToken()
    localStorage.setItem('token', idToken)
    return credential;
  };
  
const logout = async () => {
  await signOut($auth)
  localStorage.removeItem('token')
  token.value = null              
  user.value = null               
  navigateTo("/auth/login")
}

  return {
    token,
    user,
    isAuthenticated,
    getUserId,
    signup,
    login,
    loginWithGoogle,
    logout,
  };
};