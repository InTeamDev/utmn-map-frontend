import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Dropdown from '../../components/DropDown/DropDown'
import styles from './HomePage.module.css'
import { api } from '../../services/public.api'
import Error from '../../components/Error/Error'
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen'
import InteractiveCanvas from '../../components/Canvas/Canvas'
import { useParams } from 'react-router-dom'
import Header from '../../components/Header/Header'
import { GetObjectsResponse } from '../../services/interfaces/object'
import RoutePanel from '../../components/RoutePanel/RoutePanel'

const HomePage: React.FC = () => {
  const { buildingId, objectId } = useParams<{ buildingId: string; objectId?: string }>()
  const [currentFloor, setCurrentFloor] = useState('Floor_First')
  const [locations, setLocations] = useState<Record<string, string>>({})
  const [buildingData, setBuildingData] = useState<GetObjectsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showHeader, setShowHeader] = useState(true)
  const [from, setFrom] = useState<string | null>(null)
  const [to, setTo] = useState<string | null>(null)
  const [route, setRoute] = useState<any[] | null>(null)

  const locationOptions = useMemo(() => {
    if (!Object.keys(locations).length) return []

    return Object.entries(locations)
      .filter(([key, value]) => {
        const hasValidAlias = value && !value.includes('???')
        const isNotIDK = !key.includes('IDK') && !value.includes('IDK')
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
        if (!buildingId) return
        const locationsData = await api.getObjects(buildingId)
        setBuildingData(locationsData)
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
  }, [buildingId])

  const transformLocationsData = (data: GetObjectsResponse): Record<string, string> => {
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
    (value: string | null, type: 'from' | 'to') => {
      if (!value) return
      if (type === 'from') setFrom(value)
      if (type === 'to') setTo(value)

      const floor = `Floor_${value.split('_')[1]}`
      if (floor !== currentFloor) {
        handleFloorChange(floor)
      }
    },
    [currentFloor, handleFloorChange],
  )

  // Запрос маршрута, когда выбраны обе точки
  useEffect(() => {
    const fetchRoute = async () => {
      if (!buildingId || !from || !to || from === to) {
        setRoute(null)
        return
      }
      if (!buildingData) return
      // Найти объекты по id
      let fromObj = null
      let toObj = null
      for (const floor of buildingData.objects.floors) {
        if (!fromObj) fromObj = floor.objects.find((o) => o.id === from)
        if (!toObj) toObj = floor.objects.find((o) => o.id === to)
      }
      if (!fromObj || !toObj) {
        setError('Не удалось найти выбранные объекты.')
        setRoute(null)
        return
      }
      // Найти первую дверь у каждого объекта
      const fromDoor = fromObj.doors && fromObj.doors.length > 0 ? fromObj.doors[0] : null
      const toDoor = toObj.doors && toObj.doors.length > 0 ? toObj.doors[0] : null
      if (!fromDoor || !toDoor) {
        setError('У выбранного объекта нет двери для построения маршрута.')
        setRoute(null)
        return
      }
      try {
        const res: any = await api.buildRoute(buildingId, {
          start_node_id: fromDoor.id,
          end_node_id: toDoor.id,
        })
        setRoute(res.edges ? res.edges : res.route)
        setError(null)
      } catch (err) {
        setError('Не удалось построить маршрут. Попробуйте еще раз.')
        setRoute(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRoute()
  }, [buildingId, from, to, buildingData])

  useEffect(() => {
    function handleResize() {
      setShowHeader(window.innerWidth > 668)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Вспомогательная функция для поиска объекта по id или по id двери
  const findObjectById = (id: string) => {
    if (!buildingData) return null
    // Сначала ищем объект по id
    for (const floor of buildingData.objects.floors) {
      const obj = floor.objects.find((o) => o.id === id)
      if (obj) return obj
    }
    // Если не найден, ищем объект по id двери
    for (const floor of buildingData.objects.floors) {
      for (const obj of floor.objects) {
        if (obj.doors && obj.doors.some((door) => door.id === id)) {
          return obj
        }
      }
    }
    return null
  }

  // Формируем точки маршрута для RoutePanel
  const routePoints = useMemo(() => {
    if (!route || !route.length) return []
    const points: { label: string; type: 'start' | 'intermediate' | 'end'; description?: string }[] = []
    // Собираем уникальные id точек маршрута (from_id первой, to_id последней, промежуточные)
    const ids: string[] = [route[0]?.from_id]
    for (const edge of route) {
      ids.push(edge.to_id)
    }
    ids.forEach((id, idx) => {
      const obj = findObjectById(id)
      if (!obj) return // Неизвестные точки не отображаем
      let type: 'start' | 'intermediate' | 'end' = 'intermediate'
      if (idx === 0) type = 'start'
      else if (idx === ids.length - 1) type = 'end'
      let label = obj.name
      // Для лестницы и гардероба можно явно подписывать
      if (obj.object_type_id === 5) label = 'Лестница'
      if (obj.object_type_id === 6) label = 'Гардероб'
      points.push({ label, type })
    })
    // Удаляем дубликаты лестниц среди промежуточных точек (оставляем только первую)
    const seenStairs = new Set()
    return points.filter((p, idx) => {
      if (p.type !== 'intermediate' || p.label !== 'Лестница') return true
      if (seenStairs.has(p.label)) return false
      seenStairs.add(p.label)
      return true
    })
  }, [route, buildingData])

  // Функция для смены направления маршрута
  const handleReverseRoute = useCallback(() => {
    setFrom((prevFrom) => {
      setTo(prevFrom)
      return to
    })
  }, [to])

  const handleCloseRoutePanel = () => {
    setFrom(null);
    setTo(null);
    setRoute(null);
  };

  const totalDistance = useMemo(() => route?.reduce((sum, e) => sum + (e.weight || 0), 0) || 0, [route])
  const steps = Math.round(totalDistance / 5)
  const seconds = Math.round(steps * 0.6)

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  const timeString = seconds < 60 ? `${seconds} сек` : `${minutes} мин ${remainingSeconds} сек`

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <>
      {showHeader && <Header title="UTMN MAP" />}
      <div className={styles.container}>
        <div className={styles.navigationPanel}>
          {error && <Error message={error} />}

          <div className={styles.routePanelDesktop}>
            {route && (
              <RoutePanel
                points={routePoints}
                time={timeString}
                steps={steps}
                onReverse={handleReverseRoute}
                onClose={handleCloseRoutePanel}
              />
            )}
          </div>

          <div className={styles.dropdownContainer}>
            <Dropdown
              placeholder="Откуда?"
              onChange={(value) => handleLocationChange(value, 'from')}
              buildingId={buildingId}
              searchable={true}
              value={from}
              options={locationOptions}
            />
            <Dropdown
              placeholder="Куда?"
              onChange={(value) => handleLocationChange(value, 'to')}
              buildingId={buildingId}
              searchable={true}
              value={to}
              options={locationOptions}
            />
          </div>
        </div>

        <InteractiveCanvas showPanel={false} showEditBtns={false} route={route} selectedObjectId={objectId} />
      </div>
      {/* RoutePanel для мобильной версии */}
      <div className={styles.routePanelMobile}>
        {route && (
          <RoutePanel
            points={routePoints}
            time={timeString}
            steps={steps}
            onReverse={handleReverseRoute}
            onClose={handleCloseRoutePanel}
          />
        )}
      </div>
    </>
  )
}

export default React.memo(HomePage)
