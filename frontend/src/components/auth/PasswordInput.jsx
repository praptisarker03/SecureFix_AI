import { useState } from 'react'
import { Icon } from '../ui/Icons'

// Password <input> with a show/hide toggle button.
export function PasswordInput(props) {
  const [show, setShow] = useState(false)
  return (
    <div className="pw-input">
      <input {...props} type={show ? 'text' : 'password'} />
      <button type="button" className="pw-toggle" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
        <Icon name={show ? 'eyeOff' : 'eye'} size={16} />
      </button>
    </div>
  )
}
