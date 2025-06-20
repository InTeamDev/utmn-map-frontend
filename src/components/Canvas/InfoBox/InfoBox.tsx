import { useState } from 'react'
import styles from './InfoBox.module.css'

interface InfoBoxProps {
  buildingData?: {
    name: string
    address: string
    description: string
  }
  selectedObject?:
    | {
        name: string
        alias: string
        description: string
        type: string
        position: {
          x: number
          y: number
        }
      }
    | {
        id: string
        object_id: string
        type: 'door'
        position: { x: number; y: number; width: number; height: number }
      }
  floorNumber?: number
  doorName?: string
  linkedObjectName?: string
}

export const InfoBox: React.FC<InfoBoxProps> = ({ buildingData, selectedObject, floorNumber, doorName, linkedObjectName }) => {
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

  function isDoor(obj: InfoBoxProps['selectedObject']): obj is { id: string; object_id: string; type: 'door'; position: { x: number; y: number; width: number; height: number } } {
    return !!obj && obj.type === 'door';
  }

  return (
    <div className={styles['info-box']}>
      <div className={styles['info-section']}>
        <h3 className={styles['info-title']}>Свойства корпуса</h3>
        <div className={styles['info-row']}>
          <span className={styles['info-label']}>Имя</span>
          <span className={styles['info-value']}>{buildingData?.name || '-'}</span>
        </div>
        <div className={styles['info-row']}>
          <span className={styles['info-label']}>Адрес</span>
          <span className={styles['info-value']}>{buildingData?.address || '-'}</span>
        </div>
        <div className={styles['info-row']}>
          <span className={styles['info-label']}>Описание</span>
          <span className={styles['info-value']}>{buildingData?.description || '-'}</span>
        </div>
      </div>

      {selectedObject && (
        <div className={styles['info-section']}>
          {isDoor(selectedObject) ? (
            <>
              <h3 className={styles['info-title']}>Свойства двери</h3>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Имя двери</span>
                <span className={styles['info-value']}>{doorName || selectedObject.id}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Привязанный объект</span>
                <span className={styles['info-value']}>{linkedObjectName || selectedObject.object_id}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Координаты</span>
                <span className={styles['info-value']}>
                  X {selectedObject.position.x} Y {selectedObject.position.y}
                </span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Размер</span>
                <span className={styles['info-value']}>
                  {selectedObject.position.width} x {selectedObject.position.height}
                </span>
              </div>
            </>
          ) : (
            <>
              <h3 className={styles['info-title']}>Свойства объекта</h3>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Имя</span>
                <span className={styles['info-value']}>{selectedObject.name || '-'}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Доп информация</span>
                <span className={styles['info-value']}>{selectedObject.alias || '-'}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Описание</span>
                <span className={styles['info-value']}>{selectedObject.description || '-'}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Тип</span>
                <span className={styles['info-value']}>{selectedObject.type || '-'}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Координаты</span>
                <span className={styles['info-value']}>
                  X {selectedObject.position?.x || 0} Y {selectedObject.position?.y || 0}
                </span>
              </div>
            </>
          )}
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
