import React, { useState, useEffect } from 'react'
import { useAuth } from '../../services/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import './LoginPage.css'

const LoginPage: React.FC = () => {
  const { login, error, isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [isCodeSent, setIsCodeSent] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCodeSent) {
      await login(username)
      setIsCodeSent(true)
    } else {
      await login(username, code)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Добро пожаловать!</h1>
        <p>Пожалуйста, войдите через Telegram</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Telegram username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              disabled={isCodeSent}
            />
          </div>
          {isCodeSent && (
            <div className="form-group">
              <label htmlFor="code">Код подтверждения</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Введите код из Telegram"
              />
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Загрузка...' : isCodeSent ? 'Подтвердить' : 'Получить код'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
