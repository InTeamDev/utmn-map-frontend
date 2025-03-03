import React from 'react'
import { useAuth } from '../../services/auth/AuthContext'
import './AdminPage.css'

const AdminPage: React.FC = () => {
  const { logout } = useAuth()

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Админ-панель</h1>
        <button onClick={logout} className="logout-button">
          Выйти
        </button>
      </header>
      <main className="admin-content">
        <p>Добро пожаловать в админку! Здесь вы можете управлять системой.</p>
      </main>
    </div>
  )
}

export default AdminPage
