import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { apiFetch } from '../../lib/api'
import { Icon } from '../../components/ui/Icons'
import { Card, SeverityCounts } from '../../components/ui/Elements'
import { SEVERITIES, timeAgo, totalCount } from '../../lib/constants'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function DashboardPage() {
  const { user } = useAuth()
  const { projects, scans } = useData()
  // Result of asking the backend to verify our token: 'checking' | 'connected' | 'offline'
  const [api, setApi] = useState('checking')

  useEffect(() => {
    let active = true
    apiFetch('/auth/me')
      .then(() => active && setApi('connected'))
      .catch(() => active && setApi('offline'))
    return () => {
      active = false
    }
  }, [])

  const name = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  const hasScans = scans.length > 0
  const totals = SEVERITIES.reduce((acc, s) => ({ ...acc, [s]: projects.reduce((sum, p) => sum + p.counts[s], 0) }), {})
  const recentScans = [...scans].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)).slice(0, 5)

  const stats = [
    { label: 'Open findings', value: hasScans ? totalCount(totals) : '—', icon: 'bug' },
    { label: 'Critical', value: hasScans ? totals.critical : '—', icon: 'alert' },
    { label: 'Projects', value: projects.length, icon: 'folder' },
    { label: 'Scans run', value: scans.length, icon: 'scan' },
  ]

  return (
    <>
      <header className="dash-head">
        <div>
          <p className="dash-date">
            {today}
            <span className={`api-status api-${api}`}><span className="dot" /> API {api}</span>
          </p>
          <h1>{greeting()}, {name}</h1>
        </div>
        <Link to="/scans/new" className="btn btn-primary"><Icon name="plus" size={16} /> New scan</Link>
      </header>

      {!hasScans && (
        <Link to="/scans/new" className="dash-cta">
          <span className="dash-cta-icon"><Icon name="shield" size={26} /></span>
          <div className="dash-cta-text">
            <strong>Scan your first project</strong>
            <span>Upload a .zip and get findings, AI fixes and verified patches in minutes.</span>
          </div>
          <span className="dash-cta-go">Start <Icon name="arrowRight" size={16} /></span>
        </Link>
      )}

      <div className="dash-stats">
        {stats.map((s) => (
          <div key={s.label} className="dash-stat">
            <span className="dash-stat-icon"><Icon name={s.icon} size={18} /></span>
            <span className="dash-stat-label">{s.label}</span>
            <b>{s.value}</b>
          </div>
        ))}
      </div>

      <Card title="Recent scans" pad={false}>
        {hasScans ? (
          <ul className="list">
            {recentScans.map((s) => (
              <li key={s.id}>
                <Link to={`/scans/${s.id}/progress`} className="list-row">
                  <span className="list-icon"><Icon name="scan" size={16} /></span>
                  <div className="list-main">
                    <strong>{projects.find((p) => p.id === s.projectId)?.name || s.projectId}</strong>
                    <span>{timeAgo(s.startedAt)}</span>
                  </div>
                  {s.pending ? <span className="pill pill-info">Running</span> : <SeverityCounts counts={s.counts} />}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dash-empty">No scans yet. Your scans will show up here.</p>
        )}
      </Card>
    </>
  )
}
