import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      userProfile: null,
      lastSynced: null,
      
      setUser: (user) => {
        set({ user, lastSynced: Date.now() })
        // Cache user profile data
        if (user) {
          const profileData = {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name,
            avatar: user.user_metadata?.avatar_url,
            createdAt: user.created_at
          }
          set({ userProfile: profileData })
        }
      },
      
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
  
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error
    return data
  },
  
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },
  
      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        set({ user: null, session: null, userProfile: null, lastSynced: null })
      },
      
      initialize: async () => {
        set({ loading: true })
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error) {
            console.error('Auth initialization error:', error)
          }
          
          const user = session?.user ?? null
          set({ session, user, loading: false })
          
          // Update user profile cache
          if (user) {
            get().setUser(user)
          }
          
          supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user ?? null
            set({ session, user })
            if (user) {
              get().setUser(user)
            } else {
              set({ userProfile: null })
            }
          })
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          set({ loading: false })
          throw error
        }
      },
      
      // Update user profile
      updateProfile: (profileData) => {
        set({
          userProfile: { ...get().userProfile, ...profileData },
          lastSynced: Date.now()
        })
      }
    }),
    {
      name: 'quickcommerce-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userProfile: state.userProfile,
        lastSynced: state.lastSynced
      })
    }
  )
)

