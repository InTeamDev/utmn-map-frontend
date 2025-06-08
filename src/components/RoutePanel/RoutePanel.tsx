import React from 'react'
import styles from './RoutePanel.module.css'

interface RoutePoint {
  label: string
  type: 'start' | 'intermediate' | 'end'
  description?: string
}

interface RoutePanelProps {
  points: RoutePoint[]
  time?: string
  steps?: number
  onReverse?: () => void
  onClose?: () => void
}

const RoutePanel: React.FC<RoutePanelProps> = ({ points, time, steps, onReverse, onClose }) => {
  return (
    <div className={styles.panel}>
      <div className={styles.pointsList}>
        {points.map((point, idx) => (
          <div className={styles.pointRow} key={idx}>
            <span
              className={
                point.type === 'start'
                  ? styles.startCircle
                  : point.type === 'end'
                  ? styles.endCircle
                  : styles.intermediateCircle
              }
            />
            <span className={styles.pointLabel}>{point.label}</span>
            {point.description && <span className={styles.pointDesc}>{point.description}</span>}
          </div>
        ))}
      </div>
      <div className={styles.panelActions}>
        <button className={styles.reverseBtn} onClick={onReverse} title="Поменять направление">
          <span className={styles.reverseIcon}>↕️</span>
        </button>
        <button className={styles.closeBtn} onClick={onClose} title="Закрыть">
          <span className={styles.closeIcon}>✖️</span>
        </button>
      </div>
      <div className={styles.routeInfo}>
        <span className={styles.time}>⏰Время ~{time}</span>
        <span className={styles.steps}>🥾Шагов {steps}</span>
      </div>
    </div>
  )
}

export default RoutePanel 