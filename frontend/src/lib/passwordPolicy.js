// Client-side password policy. Supabase enforces the real rules server-side
// (Dashboard > Authentication > Providers > Email > Password requirements),
// so keep these values in sync with that setting.

const PASSWORD_MIN_LENGTH = 8
// bcrypt (used by Supabase) ignores everything after 72 bytes
const PASSWORD_MAX_LENGTH = 72

export function getPasswordChecks(password) {
  return [
    { id: 'length', label: `At least ${PASSWORD_MIN_LENGTH} characters`, ok: password.length >= PASSWORD_MIN_LENGTH },
    { id: 'lower', label: 'One lowercase letter', ok: /[a-z]/.test(password) },
    { id: 'upper', label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { id: 'number', label: 'One number', ok: /\d/.test(password) },
    { id: 'symbol', label: 'One special character', ok: /[^A-Za-z0-9\s]/.test(password) },
  ]
}

// Returns an error message, or null when the password is acceptable.
export function validatePassword(password, email = '') {
  const failed = getPasswordChecks(password).find((check) => !check.ok)
  if (failed) return `Password needs: ${failed.label.toLowerCase()}.`

  if (new TextEncoder().encode(password).length > PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`
  }

  const emailName = email.split('@')[0].trim().toLowerCase()
  if (emailName.length >= 3 && password.toLowerCase().includes(emailName)) {
    return 'Password must not contain your email name.'
  }

  return null
}

const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' }
  const passed = getPasswordChecks(password).filter((check) => check.ok).length
  const bonus = password.length >= 12 ? 1 : 0
  // 0-5 passed checks + length bonus, mapped onto 0-4
  const score = Math.min(4, Math.max(0, passed + bonus - 2))
  return { score, label: STRENGTH_LABELS[score] }
}
