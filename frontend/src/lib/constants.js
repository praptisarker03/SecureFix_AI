export const SEVERITIES = ['critical', 'high', 'medium', 'low']
export const SEVERITY_LABEL = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }

export const LANGUAGES = [
  { id: 'python', label: 'Python', rules: 'p/python, p/flask, p/django', check: 'python -m py_compile' },
  { id: 'javascript', label: 'JavaScript / Node.js', rules: 'p/javascript, p/nodejs, p/express', check: 'node --check' },
  { id: 'typescript', label: 'TypeScript', rules: 'p/typescript', check: 'tsc --noEmit' },
  { id: 'php', label: 'PHP', rules: 'p/php', check: 'php -l' },
  { id: 'java', label: 'Java', rules: 'p/java, p/spring', check: 'javac' },
]

export function totalCount(counts) {
  return SEVERITIES.reduce((sum, s) => sum + (counts?.[s] || 0), 0)
}

export function formatDate(iso, withTime = false) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`
  const days = Math.floor(diff / 86400)
  return days === 1 ? 'yesterday' : `${days} days ago`
}
