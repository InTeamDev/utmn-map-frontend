import React, { memo, useCallback } from 'react'
import { motion, TargetAndTransition } from 'framer-motion'
import styles from './Button.module.css'

interface ButtonProps {
  text: string
  onClick: () => void
  isActive?: boolean
  whileHover?: TargetAndTransition
  whileTap?: TargetAndTransition
}

const Button: React.FC<ButtonProps> = memo(({ text, onClick, isActive, whileHover, whileTap }) => {
  // Используем useCallback для оптимизации обработчика клика
  const handleClick = useCallback(() => {
    onClick()
  }, [onClick])

  return (
    <motion.button
      className={`${styles.button} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      whileHover={whileHover}
      whileTap={whileTap}
    >
      {text}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button
