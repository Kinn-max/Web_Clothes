// composables/useAbout.ts
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { AboutContent } from '@/types/about'

export const useAbout = () => {
  const nuxtApp = useNuxtApp()
  const db = nuxtApp.$db as Firestore
  const queryClient = useQueryClient()

  const aboutRef = doc(db, 'site_config', 'about')

  // ── GET ────────────────────────────────────────────────────
  const useGetAboutContent = () =>
    useQuery({
      queryKey: ['about'],
      queryFn: async (): Promise<AboutContent | null> => {
        const snap = await getDoc(aboutRef)
        if (!snap.exists()) return null
        return snap.data() as AboutContent
      },
      staleTime: 1000 * 60 * 30, // cache 30 phút — nội dung ít thay đổi
    })

  // ── UPDATE ─────────────────────────────────────────────────
  const useUpdateAboutContent = () =>
    useMutation({
      mutationFn: (data: Partial<AboutContent>) =>
        setDoc(aboutRef, data, { merge: true }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['about'] })
      },
    })

  return {
    useGetAboutContent,
    useUpdateAboutContent,
  }
}