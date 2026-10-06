import { useAuth } from '../../context/AuthContext'

export function ConfigBanner() {
  const { isSupabaseConfigured } = useAuth()

  if (isSupabaseConfigured) return null

  return (
    <div className="config-banner">
      <div className="banner-content">
        <strong>⚠️ Configuration Needed:</strong> Open <code>frontend/.env</code> and enter your Supabase Project URL and Anon/Publishable Key from your Supabase Dashboard to enable live authentication and PostgreSQL integration.
      </div>
    </div>
  )
}
