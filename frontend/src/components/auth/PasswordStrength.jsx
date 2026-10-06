import { getPasswordChecks, getPasswordStrength } from '../../lib/passwordPolicy'

export function PasswordStrength({ password }) {
  if (!password) return null

  const { score, label } = getPasswordStrength(password)
  const checks = getPasswordChecks(password)

  return (
    <div className="password-strength">
      <div className="strength-bar" aria-hidden="true">
        <div className={`strength-fill strength-${score}`} style={{ width: `${((score + 1) / 5) * 100}%` }} />
      </div>
      <span className={`strength-label strength-text-${score}`}>Strength: {label}</span>
      <ul className="password-checklist">
        {checks.map((check) => (
          <li key={check.id} className={check.ok ? 'check-ok' : 'check-missing'}>
            {check.ok ? '✓' : '•'} {check.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
