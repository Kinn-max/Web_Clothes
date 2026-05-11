
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import type { AuthUser } from '@/types/auth'

export const useAuth = () => {
  const nuxtApp = useNuxtApp()
  const $auth = nuxtApp.$auth as import('firebase/auth').Auth
  const $db   = nuxtApp.$db  as import('firebase/firestore').Firestore

  //  Source of truth duy nhất
  const authStore = useAuthStore()

  // ── SIGNUP ─────────────────────────────────────────────────
  // Không cần setAuth ở đây vì sau signup
  // firebase.client.ts sẽ tự bắt qua onAuthStateChanged
  const signup = async (data: {
    full_name: string
    email: string
    password: string
  }) => {
    const credential = await createUserWithEmailAndPassword(
      $auth,
      data.email,
      data.password
    )

    await updateProfile(credential.user, {
      displayName: data.full_name,
    })

    await setDoc(doc($db, 'users', credential.user.uid), {
      email:      data.email,
      full_name:  data.full_name,
      role:       'USER',
      status:     'active',
      phone:      '',
      created_at: new Date(),
    })

    return credential
  }

  // ── LOGIN ──────────────────────────────────────────────────
  const login = async (data: { email: string; password: string }) => {
    const credential = await signInWithEmailAndPassword(
      $auth,
      data.email,
      data.password
    )

    const idToken = await credential.user.getIdToken()

    // Lấy thêm role, full_name từ Firestore
    const userSnap = await getDoc(doc($db, 'users', credential.user.uid))
    const userData = userSnap.data()
    authStore.setAuth(
      {
        userId:    credential.user.uid,
        email:     credential.user.email    ?? '',
        full_name: userData?.full_name      ?? credential.user.displayName ?? '',
        role:      userData?.role           ?? 'USER',
      },
      idToken
    )

    return credential.user
  }

  // ── GOOGLE LOGIN ───────────────────────────────────────────
  const loginWithGoogle = async () => {
    const provider   = new GoogleAuthProvider()
    const credential = await signInWithPopup($auth, provider)

    const userRef  = doc($db, 'users', credential.user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email:      credential.user.email,
        full_name:  credential.user.displayName,
        role:       'USER',
        created_at: new Date(),
      })
    }

    const idToken  = await credential.user.getIdToken()
    const userData = userSnap.data()

    authStore.setAuth(
      {
        userId:    credential.user.uid,
        email:     credential.user.email    ?? '',
        full_name: userData?.full_name      ?? credential.user.displayName ?? '',
        role:      userData?.role           ?? 'USER',
      },
      idToken
    )

    return credential
  }

  // ── LOGOUT ─────────────────────────────────────────────────
  const logout = async () => {
    await signOut($auth)
    authStore.clearAuth()
    navigateTo('/auth/login')
  }

  //  Export computed từ store — dùng được ở mọi nơi
  return {
    token:           computed(() => authStore.token),
    user:            computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    userId:          computed(() => authStore.userId),  
    role:            computed(() => authStore.role),
    fullName:        computed(() => authStore.fullName),
    signup,
    login,
    loginWithGoogle,
    logout,
  }
}