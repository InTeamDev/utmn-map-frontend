import React from 'react'
import logo from '../../assets/Group.svg'
import styles from './Header.module.css'

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <img src={logo} alt="Logo" className={styles.logo} />
      </div>
    </header>
  )
}

export default Header
