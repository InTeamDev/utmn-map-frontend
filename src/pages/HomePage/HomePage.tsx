import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Dropdown from '../../components/DropDown/DropDown'
import styles from './HomePage.module.css'
import { api } from '../../services/public.api'
import Error from '../../components/Error/Error'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import InteractiveCanvas from '../../components/Canvas/Canvas'
import { useParams } from 'react-router-dom'
import { BuildingData } from '../../services/interface/map-object'
import Header from '../../components/Header/Header'

const HomePage: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>()
  const [currentFloor, setCurrentFloor] = useState('Floor_First')
  const [locations, setLocations] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const locationOptions = useMemo(() => {
    if (!Object.keys(locations).length) return []

    return Object.entries(locations)
      .filter(([key, value]) => {
        const hasValidAlias = value && !value.includes('???')
        const isNotIDK = !key.includes('IDK')
        const isNotStairs = !key.includes('Stairs')
        return hasValidAlias && isNotIDK && isNotStairs
      })
      .map(([key, value]) => {
        const floor = key.split('_')[1]
        const floorNum = floor === 'First' ? 1 : floor === 'Second' ? 2 : floor === 'Third' ? 3 : 4

        const label = value.replace(/(?:First|Second|Third|Fourth)/g, (match) =>
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

  // Инициализация данных (объекты)
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true)
      try {
        const locationsData = await api.getObjectsByBuilding(buildingId)
        const mappedLocations = transformLocationsData(locationsData)
        setLocations(mappedLocations)
        setError(null)
      } catch (err) {
        setError('Не удалось загрузить данные. Пожалуйста, обновите страницу.')
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [])

  const transformLocationsData = (data: BuildingData): Record<string, string> => {
    const result: Record<string, string> = {}

    data.objects.floors.forEach((floor) => {
      floor.objects.forEach((obj) => {
        result[obj.id] = obj.name
      })
    })

    return result
  }

  const handleFloorChange = useCallback(
    (floor: string) => {
      if (floor === currentFloor) return
      setCurrentFloor(floor)
    },
    [currentFloor],
  )

  const handleLocationChange = useCallback(
    (value: string | null) => {
      if (!value) return

      const floor = `Floor_${value.split('_')[1]}`
      if (floor !== currentFloor) {
        handleFloorChange(floor)
      }
    },
    [currentFloor, handleFloorChange],
  )

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.navigationPanel}>
          {error && <Error message={error} />}

          <div className={styles.dropdownContainer}>
            <Dropdown
              options={locationOptions}
              placeholder="Откуда?"
              onChange={(value) => handleLocationChange(value)}
            />
            <Dropdown options={locationOptions} placeholder="Куда?" onChange={(value) => handleLocationChange(value)} />
          </div>
        </div>

        <InteractiveCanvas showPanel={false} showEditBtns={false} />
      </div>
    </>
  )
}

export default React.memo(HomePage)
