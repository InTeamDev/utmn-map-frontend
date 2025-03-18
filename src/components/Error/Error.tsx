import React from 'react'
import styles from './Error.module.css'
import { motion } from 'framer-motion'

interface ErrorProps {
  message: string
}

const Error: React.FC<ErrorProps> = ({ message }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    {' '}
    <div className={styles.error}>{message}</div>
  </motion.div>
)

export default Error
