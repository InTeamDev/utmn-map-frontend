import React from 'react'
import { useAuth } from '../../services/auth/AuthContext'
import logo from '../../assets/Group.svg'
import '../../pages/AdminPage/AdminPage.css'

interface AdminHeaderProps {
  title?: string
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title = 'Админ-панель' }) => {
  const { logout } = useAuth()

  return (
    <header className="admin-header">
      <div className="left">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <h1>{title}</h1>
      <button onClick={logout} className="logout-button">
        Выйти
      </button>
    </header>
  )
}

export default AdminHeader
