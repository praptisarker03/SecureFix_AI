import { useEffect, useRef, useState } from 'react'

// Adds `.is-in` once the element scrolls into view. The CSS decides what the
// entrance looks like, and turns it off for prefers-reduced-motion.
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inView])

  return (
    <Tag ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`} style={{ '--delay': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  )
}
