import { useState } from 'react'
import styles from './InfoBox.module.css'

interface InfoBoxProps {
  buildingData?: {
    name: string
    address: string
    description: string
  }
  selectedObject?: {
    name: string
    alias: string
    description: string
    type: string
    position: {
      x: number
      y: number
    }
  }
  floorNumber?: number
}

export const InfoBox: React.FC<InfoBoxProps> = ({ buildingData, selectedObject, floorNumber }) => {
  const [routeOptions, setRouteOptions] = useState({
    route: false,
    showObjects: false,
    showFloor: false,
    showBackground: false,
  })

  const handleCheckboxChange = (option: keyof typeof routeOptions) => {
    setRouteOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }))
  }

  return (
    <div className={styles['info-box']}>
      <div className={styles['info-section']}>
        <h3 className={styles['info-title']}>Свойства корпуса</h3>
        <div className={styles['info-row']}>
          <span className={styles['info-label']}>Name</span>
          <span className={styles['info-value']}>{buildingData?.name || '-'}</span>
        </div>
        <div className={styles['info-row']}>
          <span className={styles['info-label']}>Address</span>
          <span className={styles['info-value']}>{buildingData?.address || '-'}</span>
        </div>
        <div className={styles['info-row']}>
          <span className={styles['info-label']}>Description</span>
          <span className={styles['info-value']}>{buildingData?.description || '-'}</span>
        </div>
      </div>

      {selectedObject && (
        <div className={styles['info-section']}>
          <h3 className={styles['info-title']}>Свойства объекта</h3>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Name</span>
            <span className={styles['info-value']}>{selectedObject.name || '-'}</span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Alias</span>
            <span className={styles['info-value']}>{selectedObject.alias || '-'}</span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Description</span>
            <span className={styles['info-value']}>{selectedObject.description || '-'}</span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Type</span>
            <span className={styles['info-value']}>{selectedObject.type || '-'}</span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Position</span>
            <span className={styles['info-value']}>
              X {selectedObject.position?.x || 0} Y {selectedObject.position?.y || 0}
            </span>
          </div>
        </div>
      )}

      <div className={styles['info-section']}>
        <h3 className={styles['info-title']}></h3>
        <div className={styles['info-row']}>
          <label className={styles['checkbox-container']}>
            <input type="checkbox" checked={routeOptions.route} onChange={() => handleCheckboxChange('route')} />
            <span className={styles['checkmark']}></span>
            <span className={styles['info-label']}>Маршруты</span>
          </label>
        </div>

        <div className={styles['info-row']}>
          <label className={styles['checkbox-container']}>
            <input
              type="checkbox"
              checked={routeOptions.showObjects}
              onChange={() => handleCheckboxChange('showObjects')}
            />
            <span className={styles['checkmark']}></span>
            <span className={styles['info-label']}>Объекты</span>
          </label>
        </div>
        <div className={styles['info-row']}>
          <label className={styles['checkbox-container']}>
            <input
              type="checkbox"
              checked={routeOptions.showFloor}
              onChange={() => handleCheckboxChange('showFloor')}
            />
            <span className={styles['checkmark']}></span>
            <span className={styles['info-label']}>Пол</span>
          </label>
        </div>
        <div className={styles['info-row']}>
          <label className={styles['checkbox-container']}>
            <input
              type="checkbox"
              checked={routeOptions.showBackground}
              onChange={() => handleCheckboxChange('showBackground')}
            />
            <span className={styles['checkmark']}></span>
            <span className={styles['info-label']}>Фон-план</span>
          </label>
        </div>
      </div>
    </div>
  )
}
