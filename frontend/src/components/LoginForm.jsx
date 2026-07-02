import { useState } from 'react'
import { login } from '../api/tasks'

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(username, password)
      onLogin(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">✦</div>
        <h2 className="login-title">Добро пожаловать</h2>
        <p className="login-sub">Войдите, чтобы продолжить</p>

        <div className="field">
          <label>Логин</label>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Войти'}
        </button>
      </form>
    </div>
  )
}
