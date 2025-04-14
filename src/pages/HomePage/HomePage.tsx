import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styles from './HomePage.module.css'
import Dropdown from '../../components/DropDown/DropDown'
import ImageCard from '../../components/ImageCard/ImageCard'
import Button from '../../components/Button/Button'
import { api } from '../../services/api'
import Error from '../../components/Error/Error'

const floors = {
  Floor_Fourth: '4',
  Floor_Third: '3',
  Floor_Second: '2',
  Floor_First: '1',
} as const

const HomePage: React.FC = () => {
  const [from, setFrom] = useState<string | null>(null)
  const [to, setTo] = useState<string | null>(null)
  const [currentFloor, setCurrentFloor] = useState('Floor_First')
  const [locations, setLocations] = useState<Record<string, string>>({})
  const [floorImage, setFloorImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Мемоизация locationOptions
  const locationOptions = useMemo(() => {
    if (!Object.keys(locations).length) return []

    return Object.entries(locations)
      .filter(([key]) => !key.includes('IDK') && !key.includes('Stairs'))
      .map(([key, value]) => {
        const floor = key.split('_')[1]
        const floorNum = floor === 'First' ? 1 : floor === 'Second' ? 2 : floor === 'Third' ? 3 : 4

        const label = value
          .replace(/Toilet[^(]*/g, 'Туалет')
          .replace('Gym', 'Спортзал')
          .replace('Kitchen', 'Кухня')
          .replace('Dining', 'Столовая')
          .replace('Wardrobe', 'Гардероб')
          .replace(/(?:First|Second|Third|Fourth)/g, (match) =>
            String(['First', 'Second', 'Third', 'Fourth'].indexOf(match) + 1),
          )

        return {
          value: key,
          label,
          floor: floorNum,
        }
      })
      .sort((a, b) => {
        if (a.floor !== b.floor) return a.floor - b.floor

        const [numA, numB] = [a.label, b.label].map((label) => parseInt(label.match(/\d+/)?.[0] || '0'))

        return numA !== numB ? numA - numB : a.label.localeCompare(b.label)
      })
  }, [locations])

  // Мемоизация функции обновления изображения этажа
  const updateFloorImage = useCallback(async (floor: string, fromLoc?: string, toLoc?: string) => {
    try {
      const blob = await api.getFloorPlan(floor, fromLoc, toLoc)
      const url = URL.createObjectURL(blob)

      setFloorImage((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl) // Очистка предыдущего URL
        return url
      })

      setError(null)
    } catch (err) {
      setError('Не удалось загрузить план этажа')
    }
  }, [])

  // Инициализация данных
  useEffect(() => {
    // const initializeData = async () => {
    //   try {
    //     const locationsData = await api.getObjects()
    //     setLocations(locationsData)
    //     await updateFloorImage('Floor_First')
    //     setError(null)
    //   } catch (err) {
    //     setError('Не удалось загрузить данные. Пожалуйста, обновите страницу.')
    //   }
    // }
    //
    // initializeData()

    // Очистка URL при размонтировании
    return () => {
      if (floorImage) URL.revokeObjectURL(floorImage)
    }
  }, [updateFloorImage])

  // Обновление маршрута
  useEffect(() => {
    if (!currentFloor) return
    updateFloorImage(currentFloor, from || undefined, to || undefined)
  }, [from, to, currentFloor, updateFloorImage])

  // Мемоизация обработчика смены этажа
  const handleFloorChange = useCallback(
    (floor: string) => {
      console.log(floors, currentFloor)
      if (floor === currentFloor) return
      updateFloorImage(floor, from || undefined, to || undefined)
      setCurrentFloor(floor)
    },
    [currentFloor, from, to, updateFloorImage],
  )

  // Мемоизация обработчика смены локации
  const handleLocationChange = useCallback(
    (value: string | null, setter: (value: string | null) => void) => {
      if (!value) return
      setter(value)

      const floor = `Floor_${value.split('_')[1]}`
      if (floor !== currentFloor) {
        handleFloorChange(floor)
      }
    },
    [currentFloor, handleFloorChange],
  )

  return (
    <div className={styles.container}>
      <div className={styles.navigationPanel}>
        {error && <Error message={error} />}

        <div className={styles.dropdownContainer}>
          {to && (
            <Dropdown
              options={locationOptions}
              placeholder="Откуда?"
              onChange={(value) => handleLocationChange(value, setFrom)}
            />
          )}
          <Dropdown
            options={locationOptions}
            placeholder="Куда?"
            onChange={(value) => handleLocationChange(value, setTo)}
          />
        </div>
      </div>

      <div className={styles.content}>
        {floorImage && <ImageCard src={floorImage} alt="Floor Plan" />}
        <div className={styles.buttonContainer}>
          {Object.entries(floors)
            .reverse()
            .map(([apiFloor, displayText]) => (
              <Button
                key={apiFloor}
                text={displayText}
                isActive={currentFloor === apiFloor}
                onClick={() => handleFloorChange(apiFloor)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

export default React.memo(HomePage)
