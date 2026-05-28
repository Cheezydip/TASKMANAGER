import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../lib/api.js'
import '../styles/auth.css'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const payload = await api.login({ email, password })
      setToken(payload.token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Log in to continue managing tasks.</div>

        <form onSubmit={handleSubmit}>
          <div className="auth-row">
            <label className="auth-label" htmlFor="login-email">Email</label>
            <input
              className="auth-input"
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="auth-row">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <input
              className="auth-input"
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button className="auth-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {error ? <div className="auth-error">{error}</div> : null}

        <Link className="auth-link" to="/register">
          New here? Create an account
        </Link>
      </div>
    </div>
  )
}

export default Login
