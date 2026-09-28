import { supabase } from './supabase'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim().replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Calls the FastAPI backend with the current Supabase access token attached,
// so the backend can verify who the user is and what they may access.
export async function apiFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = new Headers(options.headers)
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  const res = await fetch(`${API_URL}/api/v1${path}`, { ...options, headers })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(res.status, body?.detail || res.statusText)
  }
  return body
}
