// plugins/firebase.client.ts
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { User } from "firebase/auth";

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
  apiKey: config.public.firebaseApiKey as string,
  authDomain: config.public.firebaseAuthDomain as string,
  projectId: config.public.firebaseProjectId as string,
  storageBucket: config.public.firebaseStorageBucket as string,
  messagingSenderId: config.public.firebaseMessagingSenderId as string,
  appId: config.public.firebaseAppId as string,
  measurementId: config.public.firebaseMeasurementId as string,
}
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  const storage = getStorage(app)

  const token = useState<string | null>("auth_token", () => null)
  const user = useState<any>("auth_user", () => null)
  const isReady = useState<boolean>("auth_ready", () => false)

  // Restore auth state khi refresh - chờ Firebase xong mới render
  await new Promise<void>((resolve) => {
    onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken()
        token.value = idToken
        localStorage.setItem("token", idToken)

        const userSnap = await getDoc(doc(db, "users", firebaseUser.uid))
        if (userSnap.exists()) {
          user.value = {
            userId: firebaseUser.uid,
            ...userSnap.data(),
          }
        } else {
          user.value = {
            userId: firebaseUser.uid,
            email: firebaseUser.email,
            full_name: firebaseUser.displayName ?? "",
            role: "USER",
          }
        }
      } else {
        token.value = null
        user.value = null
        localStorage.removeItem("token")
      }

      isReady.value = true
      resolve()
    })
  })

  return {
    provide: {
      auth,
      db,
      storage,
    },
  }
})