import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

// The role comes from app_metadata, which only the server can change.
// user_metadata is editable by the user, so it is never trusted for roles.
function getUserRole(user) {
  return user?.app_metadata?.role || 'user'
}

function isEmailVerified(user) {
  return Boolean(user?.email_confirmed_at)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Nothing to load when Supabase is not configured
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    // Restore the saved session when the page loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((err) => {
      console.error('Error fetching session:', err)
      setLoading(false)
    })

    // Keep the user in sync on login, logout, token refresh and password reset
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true)
      if (event === 'SIGNED_OUT') setIsPasswordRecovery(false)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Includes the base path so links in emails work when hosted under /<repo>/
  const redirectUrl = (path) => `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || '',
        },
        emailRedirectTo: redirectUrl('/auth/callback'),
      },
    })
    if (error) throw error
    return data
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl('/auth/callback'),
      },
    })
    if (error) throw error
    return data
  }

  const resendVerification = async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: redirectUrl('/auth/callback') },
    })
    if (error) throw error
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl('/reset-password'),
    })
    if (error) throw error
  }

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    setIsPasswordRecovery(false)
    return data
  }

  // Fetch a fresh session so a just-confirmed email shows up
  const refreshUser = async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    setUser(data.user ?? null)
    return data.user
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } finally {
      // Clear local state even if the server call failed (e.g. expired session)
      setUser(null)
      setIsPasswordRecovery(false)
    }
  }

  const value = {
    user,
    loading,
    role: getUserRole(user),
    emailVerified: isEmailVerified(user),
    isPasswordRecovery,
    isSupabaseConfigured,
    signIn,
    signUp,
    signInWithGoogle,
    resendVerification,
    resetPassword,
    updatePassword,
    refreshUser,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
