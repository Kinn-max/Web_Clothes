import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp()
  const $auth = nuxtApp.$auth as import('firebase/auth').Auth
  const $db = nuxtApp.$db as import('firebase/firestore').Firestore

  const token = useState<string | null>('auth_token', () => null)
  const user = useState<any>('auth_user', () => null)

  await new Promise<void>((resolve) => {
    onAuthStateChanged($auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken()
        token.value = idToken
        localStorage.setItem('token', idToken)

        const userSnap = await getDoc(doc($db, 'users', firebaseUser.uid))
        if (userSnap.exists()) {
          user.value = {
            ...userSnap.data(),
            userId: firebaseUser.uid,
            email: firebaseUser.email,
          }
        }
      } else {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
      }
      resolve()
    })
  })
})