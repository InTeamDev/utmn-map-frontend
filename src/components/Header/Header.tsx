import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Header.module.css'
import logo from '../../assets/Group.svg'

interface HeaderProps {
  title: string
  showLogOut?: boolean
  onLogout?: () => void
}

const Header: React.FC<HeaderProps> = ({ title, showLogOut, onLogout }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
      navigate('/login')
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <img className={styles.logo} src={logo} />
        <h1 className={styles.headerTitle}>{title}</h1>
        {showLogOut && (
          <button className={styles.logoutButton} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17 16L21 12M21 12L17 8M21 12H9M9 21H7C5.93913 21 4.92172 20.5786 4.17157 19.8284C3.42143 19.0783 3 18.0609 3 17V7C3 5.93913 3.42143 4.92172 4.17157 4.17157C4.92172 3.42143 5.93913 3 7 3H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Выйти
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
