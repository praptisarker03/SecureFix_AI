import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Icon } from '../../components/ui/Icons'
import { Card, PageHeader } from '../../components/ui/Elements'
import { LANGUAGES } from '../../lib/constants'

const MAX_MB = 50

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

  return (
    <>
      <PageHeader
        eyebrow="New scan"
        title={existing ? `Re-scan ${existing.name}` : 'Upload code to scan'}
        subtitle="Upload a .zip of your source code. Scans usually take 1 to 4 minutes."
      />
      <form className="grid-2-1" onSubmit={submit}>
        <div className="stack">
          <Card title="1. Source code">
            <div
              className={`dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
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
              <input ref={inputRef} type="file" accept=".zip,application/zip" hidden onChange={(e) => pick(e.target.files[0])} />
              {file ? (
                <>
                  <span className="dz-icon ok"><Icon name="zip" size={28} /></span>
                  <strong>{file.name}</strong>
                  <span className="muted">{(file.size / 1024 / 1024).toFixed(2)} MB · click to replace</span>
                </>
              ) : (
                <>
                  <span className="dz-icon"><Icon name="upload" size={28} /></span>
                  <strong>Drag & drop your .zip here</strong>
                  <span className="muted">or click to browse · max {MAX_MB} MB</span>
                </>
              )}
            </div>
            <div className="form-row">
              <label htmlFor="project-name">Project name</label>
              <input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="my-app" />
            </div>
          </Card>

          <Card title="2. Language">
            <div className="lang-grid">
              {LANGUAGES.map((l) => (
                <label key={l.id} className={`lang-option ${language === l.id ? 'selected' : ''}`}>
                  <input type="radio" name="language" value={l.id} checked={language === l.id} onChange={() => setLanguage(l.id)} />
                  <strong>{l.label}</strong>
                  <span className="mono small">{l.rules}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card title="3. Privacy notice" className="privacy-card">
            <div className="notice">
              <Icon name="info" size={20} />
              <p>
                <strong>Code snippets will be sent to Google Gemini.</strong> For each finding, about 20 lines around the
                vulnerable code are sent to generate the explanation and fix. The full archive is never sent and is
                deleted from our server when the scan ends.
              </p>
            </div>
            <label className="checkbox">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              I understand and I am allowed to share this code with a third-party AI service.
            </label>
          </Card>

          <Card title="What happens next">
            <ol className="mini-steps">
              <li>Archive is extracted and checked for unsafe paths</li>
              <li>Semgrep scans with the {LANGUAGES.find((l) => l.id === language)?.label} rule packs</li>
              <li>Gemini explains each finding and proposes a fix</li>
              <li>Each fix is re-scanned and syntax-checked</li>
            </ol>
          </Card>

          {error && <div className="alert alert-error" role="alert">{error}</div>}
          {notice && <div className="alert alert-info" role="status">{notice}</div>}
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={!file || !consent || submitting}>
            {submitting ? <span className="spinner light" /> : <Icon name="scan" size={18} />} Start scan
          </button>
        </div>
      </form>
    </>
  )
}
