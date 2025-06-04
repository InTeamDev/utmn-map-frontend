import React from 'react'
import logo from '../../assets/Group.svg'
import { useAuth } from '../../services/auth/AuthContext'
import styles from './Header.module.css'

interface HeaderProps {
  title?: string
  showLogOut?: boolean
}

const Header: React.FC<HeaderProps> = ({ title = '', showLogOut = false }) => {
  const { logout } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>{title}</h1>
      </div>
      {showLogOut && (
        <>
          <button onClick={logout} className={styles.logoutButton}>
            Выйти
          </button>
        </>
      )}
    </header>
  )
}

export default Header
