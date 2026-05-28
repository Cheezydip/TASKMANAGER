import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import '../styles/auth.css'

const Profile = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const payload = await api.getCurrentUser()
        setName(payload.user.name)
        setEmail(payload.user.email)
      } catch (err) {
        setError(err.message)
      }
    }

    loadUser()
  }, [])

  const handleProfileUpdate = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await api.updateProfile({ name, email })
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordUpdate = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await api.changePassword({ currentPassword, newPassword })
      setSuccess('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-title">Profile settings</div>
        <div className="auth-sub">Update your account details.</div>

        <div className="profile-grid">
          <form className="profile-section" onSubmit={handleProfileUpdate}>
            <h3>Profile</h3>
            <div className="auth-row">
              <label className="auth-label" htmlFor="profile-name">Name</label>
              <input
                className="auth-input"
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="auth-row">
              <label className="auth-label" htmlFor="profile-email">Email</label>
              <input
                className="auth-input"
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <button className="auth-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save profile'}
            </button>
          </form>

          <form className="profile-section" onSubmit={handlePasswordUpdate}>
            <h3>Password</h3>
            <div className="auth-row">
              <label className="auth-label" htmlFor="profile-current">Current password</label>
              <input
                className="auth-input"
                id="profile-current"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
            <div className="auth-row">
              <label className="auth-label" htmlFor="profile-new">New password</label>
              <input
                className="auth-input"
                id="profile-new"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </div>
            <button className="auth-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Change password'}
            </button>
          </form>
        </div>

        {error ? <div className="auth-error">{error}</div> : null}
        {success ? <div className="auth-error" style={{ color: 'var(--low)' }}>{success}</div> : null}

        <Link className="auth-link" to="/">Back to dashboard</Link>
      </div>
    </div>
  )
}

export default Profile
