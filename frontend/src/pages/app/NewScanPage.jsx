import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Icon } from '../../components/ui/Icons'
import { Card, PageHeader } from '../../components/ui/Elements'
import { LANGUAGES } from '../../lib/constants'

const MAX_MB = 50

const LANG_BADGE = { python: 'Py', javascript: 'JS', typescript: 'TS', php: 'PHP', java: 'Java' }

export function NewScanPage() {
  const { startScan, getProject } = useData()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const existing = getProject(params.get('project'))
  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [language, setLanguage] = useState(existing?.language || 'python')
  const [projectName, setProjectName] = useState(existing?.name || '')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const pick = (f) => {
    setError('')
    if (!f) return
    if (!/\.zip$/i.test(f.name)) {
      setError('Please upload a .zip archive.')
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`The archive is larger than ${MAX_MB} MB.`)
      return
    }
    setFile(f)
    if (!projectName) setProjectName(f.name.replace(/\.zip$/i, ''))
  }

  const submit = async (e) => {
    e.preventDefault()
    setNotice('')
    if (!file) return setError('Choose a .zip file first.')
    if (!consent) return setError('Please confirm the privacy notice to continue.')
    setSubmitting(true)
    try {
      const scanId = await startScan({ file, language, projectName })
      navigate(`/scans/${scanId}/progress`)
    } catch (err) {
      setNotice(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const languageLabel = LANGUAGES.find((l) => l.id === language)?.label
  const steps = [
    ['Source', !!file],
    // A language is always selected (Python by default)
    ['Language', !!file],
    ['Privacy', consent],
    ['Scan', false],
  ]
  const currentStep = steps.findIndex(([, done]) => !done)
  const summary = [
    ['Archive', file ? file.name : 'No file chosen', !!file],
    ['Project', projectName || '—', !!projectName],
    ['Language', languageLabel, true],
    ['Privacy notice', consent ? 'Confirmed' : 'Not confirmed', consent],
  ]

  const removeFile = () => {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <PageHeader
        eyebrow="New scan"
        title={existing ? `Re-scan ${existing.name}` : 'Upload code to scan'}
        subtitle="Upload a .zip of your source code. Scans usually take 1 to 4 minutes."
      />

      <ol className="scan-stepper">
        {steps.map(([label, done], i) => (
          <li key={label} className={done ? 'done' : i === currentStep ? 'current' : ''}>
            <span className="scan-step-dot">{done ? <Icon name="check" size={13} strokeWidth={3} /> : i + 1}</span>
            <span className="scan-step-label">{label}</span>
          </li>
        ))}
      </ol>

      <form className="scan-layout" onSubmit={submit}>
        <div className="stack">
          <Card title={<><span className="step-chip">1</span> Source code</>}>
            <input ref={inputRef} type="file" accept=".zip,application/zip" hidden onChange={(e) => pick(e.target.files[0])} />
            {file ? (
              <div className="file-card">
                <span className="file-card-icon"><Icon name="zip" size={22} /></span>
                <div className="file-card-text">
                  <strong>{file.name}</strong>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB · ready to scan</span>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>Replace</button>
                <button type="button" className="icon-btn" onClick={removeFile} aria-label="Remove file">
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ) : (
              <div
                className={`dropzone dropzone-lg ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  pick(e.dataTransfer.files[0])
                }}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
              >
                <span className="dz-icon"><Icon name="upload" size={28} /></span>
                <strong>{dragging ? 'Drop it here' : 'Drag & drop your .zip here'}</strong>
                <span className="muted">or <u>browse your files</u> · max {MAX_MB} MB</span>
                <span className="dz-hints">
                  <span><Icon name="check" size={12} strokeWidth={3} /> .zip only</span>
                  <span><Icon name="check" size={12} strokeWidth={3} /> Deleted after the scan</span>
                </span>
              </div>
            )}
            <div className="form-row scan-name">
              <label htmlFor="project-name">Project name</label>
              <input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="my-app" />
            </div>
          </Card>

          <Card title={<><span className="step-chip">2</span> Language</>}>
            <div className="lang-grid">
              {LANGUAGES.map((l) => (
                <label key={l.id} className={`lang-option ${language === l.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="language"
                    value={l.id}
                    checked={language === l.id}
                    onChange={() => setLanguage(l.id)}
                  />
                  <span className={`lang-badge lang-${l.id}`}>{LANG_BADGE[l.id]}</span>
                  <span className="lang-text">
                    <strong>{l.label}</strong>
                    <span className="mono small">{l.rules}</span>
                  </span>
                  <span className="lang-check"><Icon name="check" size={12} strokeWidth={3} /></span>
                </label>
              ))}
            </div>
          </Card>

          <Card title={<><span className="step-chip">3</span> Privacy notice</>} className="privacy-card">
            <div className="notice">
              <Icon name="info" size={20} />
              <p>
                <strong>Code snippets will be sent to Google Gemini.</strong> For each finding, about 20 lines around the
                vulnerable code are sent to generate the explanation and fix. The full archive is never sent and is
                deleted from our server when the scan ends.
              </p>
            </div>
            <label className={`consent ${consent ? 'checked' : ''}`}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span className="consent-box"><Icon name="check" size={13} strokeWidth={3} /></span>
              I understand and I am allowed to share this code with a third-party AI service.
            </label>
          </Card>
        </div>

        <aside className="scan-aside">
          <Card title="Scan summary">
            <ul className="summary-list">
              {summary.map(([label, value, ok]) => (
                <li key={label} className={ok ? 'ok' : ''}>
                  <span className="summary-mark"><Icon name={ok ? 'check' : 'x'} size={12} strokeWidth={3} /></span>
                  <span className="summary-label">{label}</span>
                  <span className="summary-value">{value}</span>
                </li>
              ))}
            </ul>

            <div className="summary-next">
              <span className="eyebrow">What happens next</span>
              <ol className="mini-steps">
                <li>Archive is extracted and checked for unsafe paths</li>
                <li>Semgrep scans with the {languageLabel} rule packs</li>
                <li>Gemini explains each finding and proposes a fix</li>
                <li>Each fix is re-scanned and syntax-checked</li>
              </ol>
            </div>

            {error && <div className="alert alert-error" role="alert">{error}</div>}
            {notice && <div className="alert alert-info" role="status">{notice}</div>}
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={!file || !consent || submitting}>
              {submitting ? <span className="spinner light" /> : <Icon name="scan" size={18} />} Start scan
            </button>
            {(!file || !consent) && (
              <p className="muted small summary-hint">{!file ? 'Choose a .zip file to continue.' : 'Confirm the privacy notice to continue.'}</p>
            )}
          </Card>
        </aside>
      </form>
    </>
  )
}
