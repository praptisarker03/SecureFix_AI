import { useState } from 'react'
import { Icon } from './Icons'

export function Faq({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="faq">
      {items.map(([q, a], i) => (
        <div key={q} className={`faq-item ${open === i ? 'open' : ''}`}>
          <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            {q}
            <Icon name="plus" size={18} />
          </button>
          <div className="faq-body">
            <div><p>{a}</p></div>
          </div>
        </div>
      ))}
    </div>
  )
}
