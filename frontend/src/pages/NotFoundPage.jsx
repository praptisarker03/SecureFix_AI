import { Link } from 'react-router-dom'
import { Icon, Logo } from '../components/ui/Icons'

export function NotFoundPage({ code = '404', title = 'Page not found', message = "The page you're looking for doesn't exist or has moved." }) {
  return (
    <div className="error-page">
      <Link to="/" className="error-logo"><Logo light /></Link>
      <div className="error-body">
        <div className="error-code">{code}</div>
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="hero-actions center">
          <Link to="/dashboard" className="btn btn-primary">Go to dashboard</Link>
          <Link to="/" className="btn btn-outline-light"><Icon name="arrowLeft" size={16} /> Home</Link>
        </div>
      </div>
    </div>
  )
}
