import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../lib/api.js'
import '../styles/auth.css'

const Register = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const payload = await api.register({ name, email, password })
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
        <div className="auth-title">Create account</div>
        <div className="auth-sub">Start organizing your workflow today.</div>

        <form onSubmit={handleSubmit}>
          <div className="auth-row">
            <label className="auth-label" htmlFor="register-name">Name</label>
            <input
              className="auth-input"
              id="register-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="auth-row">
            <label className="auth-label" htmlFor="register-email">Email</label>
            <input
              className="auth-input"
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="auth-row">
            <label className="auth-label" htmlFor="register-password">Password</label>
            <input
              className="auth-input"
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button className="auth-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        {error ? <div className="auth-error">{error}</div> : null}

        <Link className="auth-link" to="/login">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  )
}

export default Register
