import { SEVERITIES } from './constants'

// Browser-only pattern check used by the Quick Code Check demo on the
// Services page. It is a tiny stand-in for the real Semgrep pipeline:
// line-based regexes, no parsing, so expect false positives and misses.

const SQL_KEYWORD = /\b(select|insert|update|delete)\b[\s\S]*\b(from|into|set|where)\b/i
const SQL_DYNAMIC = /(["'`]\s*\+|\+\s*["'`]|\$\{|\.format\(|\bf["']|["']\s*%\s*[(\w])/

export const QUICK_RULES = [
  {
    id: 'sql-injection',
    title: 'SQL query built from strings',
    severity: 'critical',
    cwe: 'CWE-89',
    owasp: 'A03 Injection',
    test: (line) => SQL_KEYWORD.test(line) && SQL_DYNAMIC.test(line),
    fix: 'Use parameterised queries (placeholders like ? or %s passed separately), never string concatenation.',
  },
  {
    id: 'command-injection',
    title: 'Shell command execution',
    severity: 'critical',
    cwe: 'CWE-78',
    owasp: 'A03 Injection',
    test: (line) => /os\.system\s*\(|shell\s*=\s*True|child_process|Runtime\.getRuntime\(\)\.exec|\b(shell_exec|passthru|system)\s*\(/.test(line),
    fix: 'Pass arguments as a list without a shell (e.g. subprocess.run([...])) and validate any user input.',
  },
  {
    id: 'code-eval',
    title: 'Dynamic code evaluation',
    severity: 'high',
    cwe: 'CWE-95',
    owasp: 'A03 Injection',
    test: (line) => /(^|[^\w.])(eval|exec)\s*\(/.test(line) || /new\s+Function\s*\(/.test(line),
    fix: 'Avoid eval/exec. Parse data with a safe parser such as json.loads / JSON.parse or ast.literal_eval.',
  },
  {
    id: 'hardcoded-secret',
    title: 'Hardcoded password or secret',
    severity: 'high',
    cwe: 'CWE-798',
    owasp: 'A07 Identification & Auth Failures',
    test: (line) => /\b\w*(password|passwd|pwd|secret|api_?key|token)\w*\b["']?\s*[:=]\s*["'][^"']{4,}["']/i.test(line),
    fix: 'Load secrets from environment variables or a secret manager, and rotate the leaked value.',
  },
  {
    id: 'xss-sink',
    title: 'Unescaped HTML output',
    severity: 'high',
    cwe: 'CWE-79',
    owasp: 'A03 Injection',
    test: (line) => /\.innerHTML\s*=|\.outerHTML\s*=|document\.write\s*\(|dangerouslySetInnerHTML/.test(line),
    fix: 'Use textContent (or framework escaping) instead of writing raw HTML. Sanitise if HTML is required.',
  },
  {
    id: 'unsafe-deserialization',
    title: 'Unsafe deserialization',
    severity: 'high',
    cwe: 'CWE-502',
    owasp: 'A08 Software & Data Integrity Failures',
    test: (line) => /pickle\.loads?\s*\(|\bunserialize\s*\(|ObjectInputStream/.test(line) || (/yaml\.load\s*\(/.test(line) && !/SafeLoader/.test(line)),
    fix: 'Never deserialize untrusted data with pickle/unserialize. Use JSON, or yaml.safe_load for YAML.',
  },
  {
    id: 'weak-hash',
    title: 'Weak hash algorithm',
    severity: 'medium',
    cwe: 'CWE-328',
    owasp: 'A02 Cryptographic Failures',
    test: (line) => /\b(md5|sha1)\b/i.test(line),
    fix: 'For passwords use bcrypt, scrypt or Argon2. For integrity checks use SHA-256 or better.',
  },
  {
    id: 'insecure-random',
    title: 'Non-cryptographic random value',
    severity: 'low',
    cwe: 'CWE-338',
    owasp: 'A02 Cryptographic Failures',
    test: (line) => /Math\.random\s*\(|\brandom\.(random|randint|choice)\s*\(|\brand\s*\(/.test(line),
    fix: 'For tokens and IDs use a secure source: secrets (Python), crypto.randomUUID / getRandomValues (JS), random_bytes (PHP).',
  },
  {
    id: 'debug-enabled',
    title: 'Debug mode enabled',
    severity: 'low',
    cwe: 'CWE-489',
    owasp: 'A05 Security Misconfiguration',
    test: (line) => /\bdebug\s*[:=]\s*(True|true|1)\b|\.run\([^)]*debug\s*=\s*True/.test(line),
    fix: 'Turn debug off in production and read the setting from an environment variable.',
  },
]

export const SAMPLE_CODE = `import os, sqlite3, hashlib, pickle
from flask import Flask, request

app = Flask(__name__)
API_KEY = "sk-live-1234567890abcdef"

@app.route("/user")
def get_user():
    name = request.args.get("name")
    db = sqlite3.connect("app.db")
    return db.execute("SELECT * FROM users WHERE name = '" + name + "'").fetchall()

@app.route("/ping")
def ping():
    os.system("ping -c 1 " + request.args.get("host"))
    return "ok"

def save_password(pw):
    return hashlib.md5(pw.encode()).hexdigest()

def load_session(blob):
    return pickle.loads(blob)

if __name__ == "__main__":
    app.run(debug=True)
`

const isComment = (line) => /^\s*(#|\/\/|\*|\/\*)/.test(line)

export function runQuickCheck(code) {
  const findings = []
  code.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim() || isComment(line)) return
    for (const rule of QUICK_RULES) {
      if (rule.test(line)) findings.push({ ...rule, key: `${rule.id}-${i}`, line: i + 1, snippet: line.trim() })
    }
  })
  return findings.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity) || a.line - b.line)
}
