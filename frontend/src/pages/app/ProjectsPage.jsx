import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Icon } from '../../components/ui/Icons'
import { Card, EmptyState, HealthScore, PageHeader, SeverityCounts } from '../../components/ui/Elements'
import { LANGUAGES, formatDate, timeAgo, totalCount } from '../../lib/constants'

const langLabel = (id) => LANGUAGES.find((l) => l.id === id)?.label || id

export function ProjectsPage() {
  const { projects } = useData()
  const [view, setView] = useState('cards')
  const [query, setQuery] = useState('')

  const visible = projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Every uploaded codebase, with its latest scan and health score."
        actions={<Link to="/scans/new" className="btn btn-primary"><Icon name="plus" size={16} /> New project</Link>}
      />

      {projects.length === 0 ? (
        <Card>
          <EmptyState
            icon="folder"
            title="No projects yet"
            action={<Link to="/scans/new" className="btn btn-primary"><Icon name="upload" size={16} /> Upload your first code</Link>}
          >
            A project is created the first time you upload a .zip. Re-upload the same project later to compare scans.
          </EmptyState>
        </Card>
      ) : (
        <>
          <div className="toolbar">
            <div className="input-icon">
              <Icon name="search" size={16} />
              <input placeholder="Search projects" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="segmented">
              <button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>Cards</button>
              <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>Table</button>
            </div>
          </div>

          {visible.length === 0 && <Card><EmptyState icon="search" title="No matching projects">Try a different name.</EmptyState></Card>}

          {view === 'cards' ? (
            <div className="project-grid">
              {visible.map((p) => (
                <div key={p.id} className="project-card">
                  <div className="project-top">
                    <span className="project-icon"><Icon name="code" size={18} /></span>
                    <div>
                      <h3>{p.name}</h3>
                      <span className="muted small">{langLabel(p.language)} · {p.source}</span>
                    </div>
                  </div>
                  <div className="project-health">
                    <span className="muted small">Health score</span>
                    <HealthScore value={p.health} />
                  </div>
                  <div className="project-row">
                    <span className="muted small">{p.pending ? 'Scan running' : `${totalCount(p.counts)} open findings`}</span>
                    <SeverityCounts counts={p.counts} />
                  </div>
                  <div className="project-foot">
                    <span className="muted small">Last scan {timeAgo(p.lastScanAt)}</span>
                    <div className="project-actions">
                      <Link to={`/findings?project=${p.id}`} className="btn btn-sm btn-outline">Findings</Link>
                      <Link to={`/scans/new?project=${p.id}`} className="btn btn-sm btn-ghost" title="Re-scan"><Icon name="refresh" size={14} /></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card pad={false}>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Project</th><th>Language</th><th>Last scan</th><th>Findings</th><th>Health</th><th /></tr>
                  </thead>
                  <tbody>
                    {visible.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong><div className="muted small">{p.source}</div></td>
                        <td>{langLabel(p.language)}</td>
                        <td className="muted">{formatDate(p.lastScanAt, true)}</td>
                        <td><SeverityCounts counts={p.counts} /></td>
                        <td><HealthScore value={p.health} /></td>
                        <td><Link to={`/findings?project=${p.id}`} className="card-link">Open <Icon name="arrowRight" size={14} /></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </>
  )
}
