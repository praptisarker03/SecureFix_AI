import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

// Role lives in app_metadata, which only the server / service role can change.
// Never read it from user_metadata - users can edit that themselves.
function getUserRole(user) {
  return user?.app_metadata?.role || 'user'
}

function isEmailVerified(user) {
  return Boolean(user?.email_confirmed_at)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  // Nothing to load when Supabase is not configured
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    // 1. Session Persistence: Check active session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((err) => {
      console.error('Error fetching session:', err)
      setLoading(false)
    })

    // 2. Real-time auth state updates (e.g. login, logout, token refresh, password recovery)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true)
      if (event === 'SIGNED_OUT') setIsPasswordRecovery(false)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Includes the base path so links in emails work when hosted under /<repo>/
  const redirectUrl = (path) => `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`

  // Sign In with email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw error
    return data
  }

  // Sign Up with email, password, and user metadata
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName?.trim() || '',
        },
        emailRedirectTo: redirectUrl('/dashboard'),
      },
    })
    if (error) throw error
    return data
  }

  // Google OAuth Login
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl('/dashboard'),
      },
    })
    if (error) throw error
    return data
  }

  // Re-send the signup confirmation email
  const resendVerification = async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: redirectUrl('/dashboard') },
    })
    if (error) throw error
  }

  // Send a password reset link; the link opens /reset-password
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl('/reset-password'),
    })
    if (error) throw error
  }

  // Set a new password for the signed-in (or recovering) user
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    setIsPasswordRecovery(false)
    return data
  }

  // Fetch a fresh session so changes like email confirmation show up
  const refreshUser = async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    setSession(data.session)
    setUser(data.user ?? null)
    return data.user
  }

  // Sign Out / Logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } finally {
      // Clear local state even if the server call failed (e.g. expired session)
      setUser(null)
      setSession(null)
      setIsPasswordRecovery(false)
    }
  }

  const value = {
    user,
    session,
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
