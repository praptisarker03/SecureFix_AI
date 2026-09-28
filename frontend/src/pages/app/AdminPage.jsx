import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import { Card, PageHeader } from '../../components/ui/Elements'

// Admin-only page. The route is guarded in the UI, and the data comes from a
// backend endpoint that checks the admin role again on the server.
export function AdminPage() {
  const [state, setState] = useState({ loading: true, data: null, error: '' })

  useEffect(() => {
    let active = true
    apiFetch('/admin/overview')
      .then((data) => active && setState({ loading: false, data, error: '' }))
      .catch((err) => active && setState({ loading: false, data: null, error: err.message }))
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <PageHeader eyebrow="Admin only · role protected" title="Admin panel" />
      <Card title="Backend check">
        {state.loading && <p className="muted">Checking admin access with the backend...</p>}
        {state.error && <div className="alert alert-error">Backend check failed: {state.error}</div>}
        {state.data && <div className="alert alert-success">{state.data.message}</div>}
      </Card>
    </>
  )
}
