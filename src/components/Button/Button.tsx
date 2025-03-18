import React from 'react'
import { motion, TargetAndTransition } from 'framer-motion' // Импортируем TargetAndTransition
import styles from './Button.module.css'

interface ButtonProps {
  text: string
  onClick: () => void
  isActive?: boolean
  whileHover?: TargetAndTransition
  whileTap?: TargetAndTransition
}

const Button: React.FC<ButtonProps> = ({ text, onClick, isActive, whileHover, whileTap }) => {
  return (
    <motion.button
      className={`${styles.button} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      whileHover={whileHover}
      whileTap={whileTap}
    >
      {text}
    </motion.button>
  )
}

export default Button
