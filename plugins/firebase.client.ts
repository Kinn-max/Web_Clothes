import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc} from "firebase/firestore";
import { getStorage} from "firebase/storage";
export default defineNuxtPlugin(() => {
const firebaseConfig = {
  apiKey: "AIzaSyDCiQVnqUNCy4k5DiCIMq9_6p-YrdVF0WQ",
  authDomain: "luanvan-edc3a.firebaseapp.com",
  projectId: "luanvan-edc3a",
  storageBucket: "luanvan-edc3a.firebasestorage.app",
  messagingSenderId: "888774652181",
  appId: "1:888774652181:web:e645911e92eb111f15791c",
  measurementId: "G-WTWPMZDDMP"
};

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const token = useState<string | null>("auth_token", () => null);
  const user = useState<any>("auth_user", () => null);
  const isReady = useState<boolean>("auth_ready", () => false);
  const storage = getStorage(app); 
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken();
      token.value = idToken;

  
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        user.value = {
          userId: firebaseUser.uid,
          ...userSnap.data(),
        };
      } else {
       
        user.value = {
          userId: firebaseUser.uid,
          email: firebaseUser.email,
          full_name: firebaseUser.displayName ?? "",
          role: "USER",
        };
      }
    } else {
      token.value = null;
      user.value = null;
    }

    isReady.value = true;
  });

  return {
    provide: {
      auth,
      db,
       storage,
    },
  };
});