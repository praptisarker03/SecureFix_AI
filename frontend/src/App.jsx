import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setUser(data.user)
      setMessage('Login successful!')
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5174/',
      },
    })

    if (error) {
      setMessage(error.message)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setMessage(error.message)
    } else {
      setUser(null)
      setMessage('Logged out successfully!')
    }
  }

  return (
    <div>
      <h1>SecureFix AI</h1>

      {user ? (
        <>
          <h2>Welcome!</h2>

          <p>Logged in as: {user.email}</p>

          <button onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <div>
              <label>Email</label>
              <br />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <br />

            <div>
              <label>Password</label>
              <br />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <br />

            <button type="submit">
              Login
            </button>
          </form>

          <br />

          <button onClick={handleGoogleLogin}>
            Continue with Google
          </button>
        </>
      )}

      <p>{message}</p>
    </div>
  )
}

export default App