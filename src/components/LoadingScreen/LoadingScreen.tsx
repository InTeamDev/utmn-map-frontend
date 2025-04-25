import React from 'react'
import styles from './LoadingScreen.module.css'
import logo from '../../assets/Group.svg'

const LoadingScreen: React.FC = () => {
  return (
    <div className={styles.container}>
      <img src={logo} alt="" />
      <div className={styles.spinner}></div>
      <p className={styles.text}>Загрузка...</p>
    </div>
  )
}

export default LoadingScreen
