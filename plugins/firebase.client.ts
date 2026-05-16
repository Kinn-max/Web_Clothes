import { initializeApp } from 'firebase/app'
import { getAuth,onIdTokenChanged  } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import type { User } from 'firebase/auth'
import { useAuthStore } from '@/stores/auth'

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

  const authStore = useAuthStore()

  // Chờ Firebase restore session xong mới cho app render
  // Tránh flash màn hình login khi user đã đăng nhập
  await new Promise<void>((resolve) => {
    onIdTokenChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Lấy token mới nhất từ Firebase
        const idToken = await firebaseUser.getIdToken()

        // Lấy thông tin user từ Firestore
        const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid))

        if (userSnap.exists()) {
          // Lấy numeric id từ backend bằng firebase_uid
          let neonId: number | undefined;
          try {
            const res = await $fetch<{ id: number }>(
              `${config.public.apiBaseUrl}/users/by-firebase-uid/${firebaseUser.uid}`,
              { headers: { Authorization: `Bearer ${idToken}` ,'ngrok-skip-browser-warning': 'true',} }
            );
            neonId = res.id;
          } catch {}

          authStore.setAuth(
            {
              userId: firebaseUser.uid,
              neonId,
              ...userSnap.data(),
            },
            idToken
          )
        } else {
          // Trường hợp user chưa có trong Firestore (hiếm)
          authStore.setAuth(
            {
              userId: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              full_name: firebaseUser.displayName ?? '',
              role: 'USER',
            },
            idToken
          )
        }
      } else {
        //  clearAuth tự lo xóa localStorage
        authStore.clearAuth()
      }

      resolve() // app tiếp tục render
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