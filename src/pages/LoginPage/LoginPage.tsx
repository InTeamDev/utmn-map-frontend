import React from 'react'
import { useAuth } from '../../services/auth/AuthContext'
import './LoginPage.css'

const LoginPage: React.FC = () => {
  const { login } = useAuth()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    login()
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Добро пожаловать!</h1>
        <p>Пожалуйста, войдите в систему</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input type="text" id="username" placeholder="Введите имя пользователя" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" placeholder="Введите пароль" />
          </div>
          <button type="submit" className="login-button">
            Войти
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
