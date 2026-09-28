import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Icon } from '../../components/ui/Icons'
import { Card, Confidence, EmptyState, PageHeader, SeverityBadge, StatusBadge } from '../../components/ui/Elements'
import { SEVERITIES, SEVERITY_LABEL } from '../../lib/constants'

const STATUSES = [
  ['open', 'Open'],
  ['fixed', 'Fix applied'],
  ['verified', 'Verified'],
  ['false_positive', 'False positive'],
]

export function FindingsPage() {
  const { findings, projects, setFindingStatus } = useData()
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState(new Set())
  const [sort, setSort] = useState('severity')

  const q = params.get('q') || ''
  const sev = params.get('severity') || ''
  const status = params.get('status') || ''
  const project = params.get('project') || ''
  const file = params.get('file') || ''

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
    setSelected(new Set())
  }

  const files = useMemo(() => [...new Set(findings.map((f) => f.file))].sort(), [findings])

  const visible = useMemo(() => {
    const needle = q.toLowerCase()
    const list = findings.filter(
      (f) =>
        (!sev || f.severity === sev) &&
        (!status || f.status === status) &&
        (!project || f.projectId === project) &&
        (!file || f.file === file) &&
        (!needle || [f.title, f.file, f.cwe, f.owasp, f.rule].some((v) => v.toLowerCase().includes(needle)))
    )
    const by = {
      severity: (a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity),
      confidence: (a, b) => b.confidence - a.confidence,
      file: (a, b) => a.file.localeCompare(b.file) || a.line - b.line,
    }[sort]
    return [...list].sort(by)
  }, [findings, q, sev, status, project, file, sort])

  const allSelected = visible.length > 0 && visible.every((f) => selected.has(f.id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(visible.map((f) => f.id)))
  const toggle = (id) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }
  const bulk = (newStatus) => {
    selected.forEach((id) => setFindingStatus(id, newStatus))
    setSelected(new Set())
  }

  const hasFilters = q || sev || status || project || file

  if (findings.length === 0) {
    return (
      <>
        <PageHeader title="Findings" />
        <Card>
          <EmptyState icon="bug" title="No findings yet" action={<Link to="/scans/new" className="btn btn-primary">Run a scan</Link>}>
            Findings appear here after your first scan finishes.
          </EmptyState>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Findings"
        subtitle={`${visible.length} of ${findings.length} findings`}
        actions={<Link to="/report" className="btn btn-outline"><Icon name="report" size={16} /> Report</Link>}
      />

      <div className="severity-tabs">
        <button className={!sev ? 'active' : ''} onClick={() => setFilter('severity', '')}>All <b>{findings.length}</b></button>
        {SEVERITIES.map((s) => (
          <button key={s} className={sev === s ? 'active' : ''} onClick={() => setFilter('severity', s)}>
            <SeverityBadge severity={s} compact /> {SEVERITY_LABEL[s]} <b>{findings.filter((f) => f.severity === s).length}</b>
          </button>
        ))}
      </div>

      <div className="toolbar wrap">
        <div className="input-icon grow">
          <Icon name="search" size={16} />
          <input placeholder="Search title, file, CWE, rule…" value={q} onChange={(e) => setFilter('q', e.target.value)} />
        </div>
        <select value={status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={project} onChange={(e) => setFilter('project', e.target.value)} aria-label="Project">
          <option value="">All projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={file} onChange={(e) => setFilter('file', e.target.value)} aria-label="File">
          <option value="">All files</option>
          {files.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="severity">Sort: severity</option>
          <option value="confidence">Sort: AI confidence</option>
          <option value="file">Sort: file</option>
        </select>
        {hasFilters && <button className="btn btn-ghost btn-sm" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}
      </div>

      {selected.size > 0 && (
        <div className="bulk-bar">
          <strong>{selected.size} selected</strong>
          <button className="btn btn-sm btn-primary" onClick={() => bulk('fixed')}><Icon name="sparkles" size={14} /> Apply AI fixes</button>
          <button className="btn btn-sm btn-outline" onClick={() => bulk('false_positive')}>Mark false positive</button>
          <button className="btn btn-sm btn-outline" onClick={() => bulk('open')}>Reopen</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setSelected(new Set())}>Cancel</button>
        </div>
      )}

      <Card pad={false}>
        {visible.length === 0 ? (
          <EmptyState icon="filter" title="No findings match these filters">
            <button className="link" onClick={() => setParams({}, { replace: true })}>Clear all filters</button>
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table findings-table">
              <thead>
                <tr>
                  <th className="col-check"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" /></th>
                  <th>Severity</th>
                  <th>Finding</th>
                  <th>CWE / OWASP</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((f) => (
                  <tr key={f.id} className={selected.has(f.id) ? 'selected' : ''}>
                    <td className="col-check"><input type="checkbox" checked={selected.has(f.id)} onChange={() => toggle(f.id)} aria-label={`Select ${f.id}`} /></td>
                    <td><SeverityBadge severity={f.severity} /></td>
                    <td>
                      <Link to={`/findings/${f.id}`} className="finding-link">{f.title}</Link>
                      <div className="mono small muted">{f.file}:{f.line}</div>
                    </td>
                    <td><span className="tag">{f.cwe}</span><div className="small muted">{f.owasp}</div></td>
                    <td><Confidence value={f.confidence} /></td>
                    <td><StatusBadge status={f.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
