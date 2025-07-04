import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { adminApi } from '../../services/admin.api'
import { api } from '../../services/public.api'
import { GetObjectsResponse, ObjectType, getObjectTypeById, OBJECT_TYPE_TO_ID } from '../../services/interfaces/object'
import './Canvas.css'
import { CreationModal, NewObject } from './CreateObjectModal/CreateObjectModal'
import { FloorButtons } from './FloorBtns/FloorBtns'
import { InfoBox } from './InfoBox/InfoBox'
import { ScaleControls } from './Scale/ScaleControl'

// Иконки для объектов
import WardrobeIcon from '../../assets/wardrobe.svg'
import CafeIcon from '../../assets/cafe.svg'
import CafeteriaIcon from '../../assets/canteen.svg'
import GymIcon from '../../assets/gym.svg'
import ManToiletIcon from '../../assets/man-toilet.svg'
import WomanToiletIcon from '../../assets/women-toilet.svg'
import StairIcon from '../../assets/stair.svg'
import DepartmentIcon from '../../assets/department.svg'
import ChillZoneIcon from '../../assets/chill-zone.svg'
import CabinetIcon from '../../assets/Point Icon.svg'

// Типы для режимов работы
export type Mode = 'select' | 'create' | 'move' | 'route' | 'polygon'

const OBJECT_COLORS: Record<ObjectType, string> = {
  cabinet: '#C9E6FA',
  wardrobe: '#C9E6FA',
  'woman-toilet': '#C9E6FA',
  'man-toilet': '#C9E6FA',
  gym: '#C9E6FA',
  cafe: '#C9E6FA',
  canteen: '#C9E6FA',
  stair: '#C9E6FA',
  department: '#C9E6FA',
  'chill-zone': '#C9E6FA',
}

const DEFAULT_OBJECT_COLOR = '#C9E6FA'

// Глобальный кэш для иконок
const iconCache: Record<string, HTMLImageElement> = {}

interface InteractiveCanvasProps {
  showPanel?: boolean
  showEditBtns?: boolean
  route?: any[] | null
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ showPanel = false, showEditBtns = false, route }) => {
  const { buildingId } = useParams<{ buildingId: string }>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [buildingData, setBuildingData] = useState<GetObjectsResponse | null>(null)
  const [currentFloor, setCurrentFloor] = useState<string | null>(null)
  const [selectedObject, setSelectedObject] = useState<
    | {
        name: string
        alias: string
        description: string
        type: string
        position: { x: number; y: number }
      }
    | {
        id: string
        object_id: string
        type: 'door'
        position: { x: number; y: number; width: number; height: number }
      }
    | undefined
  >()
  const [movingObject, setMovingObject] = useState<{
    id: string
    initialX: number
    initialY: number
    offsetX: number
    offsetY: number
  } | null>(null)
  const [scaleValue, setScaleValue] = useState(1)
  const [isInfoBoxVisible, setInfoBoxVisible] = useState(true)
  const [mode, setMode] = useState<Mode>('select')
  const [creationModalOpen, setCreationModalOpen] = useState(false)
  const [newObjectPosition, setNewObjectPosition] = useState({ x: 0, y: 0 })
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([])
  const [isPolygonDrawing, setIsPolygonDrawing] = useState(false)
  const [nodes, setNodes] = useState<any[]>([])
  const [intersections, setIntersections] = useState<any[]>([])
  const [animationProgress, setAnimationProgress] = useState(1)
  const animationRef = useRef<number | null>(null)
  const prevRouteRef = useRef<any[] | null>(null)

  const transformState = useRef({
    offset: { x: 0, y: 0 },
    scale: 1,
    isDragging: false,
    lastPosition: { x: 0, y: 0 },
  })

  // Анимация маршрута
  const animateRoute = useRef<((ts: number) => void) | null>(null)
  useEffect(() => {
    if (!route || !Array.isArray(route) || route.length === 0) {
      setAnimationProgress(1)
      prevRouteRef.current = null
      return
    }
    if (prevRouteRef.current !== route) {
      setAnimationProgress(0)
      prevRouteRef.current = route
      let start: number | null = null
      const duration = 1200 + route.length * 80
      animateRoute.current = function animate(ts: number) {
        if (start === null) start = ts
        const elapsed = ts - start
        const progress = Math.min(1, elapsed / duration)
        setAnimationProgress(progress)
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateRoute.current!)
        }
      }
      animationRef.current && cancelAnimationFrame(animationRef.current)
      animationRef.current = requestAnimationFrame(animateRoute.current)
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [route])

  // Загрузка данных здания
  useEffect(() => {
    if (!buildingId) return
    ;(async () => {
      try {
        const data = await api.getObjects(buildingId)
        setBuildingData(data)
        if (data.objects.floors.length > 0) setCurrentFloor(data.objects.floors[0].floor.name)
        // Загружаем nodes и intersections
        const nodesRes = await api.getGraphNodes(buildingId)
        setNodes(nodesRes.nodes)
        const intersectionsRes = await api.getIntersections(buildingId)
        setIntersections(intersectionsRes.intersections)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [buildingId])

  // Вспомогательная функция для поиска этажа по id узла
  const findFloorIdByNodeId = useCallback(
    (nodeId: string): string | null => {
      if (!buildingData) return null
      // Среди doors
      for (const fl of buildingData.objects.floors) {
        for (const obj of fl.objects) {
          if (obj.doors && obj.doors.find((d) => d.id === nodeId)) return fl.floor.name
        }
      }
      // Среди intersections
      if (intersections) {
        const i = intersections.find((i) => i.id === nodeId)
        if (i) {
          const fl = buildingData.objects.floors.find((f) => f.floor.id === i.floor_id)
          if (fl) return fl.floor.name
        }
      }
      // Среди nodes
      if (nodes) {
        const n = nodes.find((n) => n.id === nodeId)
        if (n) {
          const fl = buildingData.objects.floors.find((f) => f.floor.id === n.floor_id)
          if (fl) return fl.floor.name
        }
      }
      // Среди объектов
      for (const fl of buildingData.objects.floors) {
        if (fl.objects.find((o) => o.id === nodeId)) return fl.floor.name
      }
      return null
    },
    [buildingData, intersections, nodes],
  )

  // Отрисовка этажа с улучшенным стилем
  const drawFloor = useCallback(
    (floorName: string) => {
      const canvas = canvasRef.current
      if (!canvas || !buildingData) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const { offset, scale } = transformState.current
      const floor = buildingData.objects.floors.find((f) => f.floor.name === floorName)
      if (!floor) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.translate(offset.x, offset.y)
      ctx.scale(scale, scale)

      // Отрисовка background (если есть)
      if (floor.background && floor.background.length > 0) {
        floor.background.forEach((bg) => {
          if (!bg.points || bg.points.length < 2) return

          ctx.beginPath()
          const firstPoint = bg.points[0]
          ctx.moveTo(firstPoint.x, firstPoint.y)
          for (let i = 1; i < bg.points.length; i++) {
            const p = bg.points[i]
            ctx.lineTo(p.x, p.y)
          }
          ctx.closePath()
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
          ctx.fill()
          ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)'
          ctx.lineWidth = 2
          ctx.stroke()
        })
      }

      floor.objects
        .filter((obj) => !obj.name.includes('IDK'))
        .forEach((obj) => {
          const type = getObjectTypeById(obj.object_type_id)
          // Проверяем, является ли объект выбранным
          const isSelected =
            selectedObject && selectedObject.position.x === obj.x && selectedObject.position.y === obj.y

          // Если объект выбран, рисуем зеленую обводку
          if (isSelected) {
            ctx.strokeStyle = '#4CAF50'
            ctx.lineWidth = 3
            ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)
          }

          ctx.fillStyle = OBJECT_COLORS[type] || DEFAULT_OBJECT_COLOR
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
          ctx.strokeStyle = '#A0C4E0'
          ctx.lineWidth = 1
          ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)

          if (type === 'cabinet') {
            ctx.fillStyle = '#000000'
            ctx.font = '18px Arial, sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            const words = (obj.name || '???').split(' ')
            const lineHeight = 20
            const centerX = obj.x + obj.width / 2
            const centerY = obj.y + obj.height / 2
            const totalHeight = lineHeight * words.length
            for (let i = 0; i < words.length; i++) {
              ctx.fillText(words[i], centerX, centerY - totalHeight / 2 + lineHeight / 2 + i * lineHeight)
            }
          } else {
            // Для остальных объектов - иконки
            const icon = getObjectIcon(type)
            if (icon) {
              if (iconCache[icon]) {
                ctx.drawImage(iconCache[icon], obj.x + obj.width / 2 - 12, obj.y + obj.height / 2 - 12, 28, 28)
              } else {
                const img = new window.Image()
                img.onload = () => {
                  iconCache[icon] = img
                  if (currentFloor) drawFloor(currentFloor)
                }
                img.src = icon
              }
            }
          }

          // Отрисовка дверей
          obj.doors?.forEach((door) => {
            ctx.fillStyle = '#FF6B6B'
            ctx.fillRect(door.x, door.y, door.width, door.height)
            ctx.strokeStyle = '#FF0000'
            ctx.strokeRect(door.x, door.y, door.width, door.height)
          })
        })

      // Отрисовка маршрута
      if (route && Array.isArray(route) && buildingData) {
        // Новый блок: фильтруем сегменты маршрута, относящиеся к текущему этажу
        const floorSegments = []
        for (const conn of route) {
          const fromFloor = findFloorIdByNodeId(conn.from_id)
          const toFloor = findFloorIdByNodeId(conn.to_id)
          if (fromFloor === currentFloor && toFloor === currentFloor) {
            floorSegments.push(conn)
          }
        }
        if (floorSegments.length > 0) {
          ctx.save()
          ctx.strokeStyle = '#4CAF50'
          ctx.lineWidth = 4
          ctx.setLineDash([10, 8])
          let totalLength = 0
          const segments = []
          for (const conn of floorSegments) {
            let fromCoord = null
            let toCoord = null
            for (const fl of buildingData.objects.floors) {
              for (const obj of fl.objects) {
                if (!fromCoord && obj.doors) {
                  const d = obj.doors.find((d) => d.id === conn.from_id)
                  if (d) fromCoord = { x: d.x + d.width / 2, y: d.y + d.height / 2 }
                }
                if (!toCoord && obj.doors) {
                  const d = obj.doors.find((d) => d.id === conn.to_id)
                  if (d) toCoord = { x: d.x + d.width / 2, y: d.y + d.height / 2 }
                }
              }
            }
            if (!fromCoord && intersections) {
              const i = intersections.find((i) => i.id === conn.from_id)
              if (i) fromCoord = { x: i.x, y: i.y }
            }
            if (!toCoord && intersections) {
              const i = intersections.find((i) => i.id === conn.to_id)
              if (i) toCoord = { x: i.x, y: i.y }
            }
            if (!fromCoord && nodes) {
              const n = nodes.find((n) => n.id === conn.from_id)
              if (n) fromCoord = { x: n.x, y: n.y }
            }
            if (!toCoord && nodes) {
              const n = nodes.find((n) => n.id === conn.to_id)
              if (n) toCoord = { x: n.x, y: n.y }
            }
            if (!fromCoord) {
              for (const fl of buildingData.objects.floors) {
                const o = fl.objects.find((o) => o.id === conn.from_id)
                if (o) fromCoord = { x: o.x + o.width / 2, y: o.y + o.height / 2 }
              }
            }
            if (!toCoord) {
              for (const fl of buildingData.objects.floors) {
                const o = fl.objects.find((o) => o.id === conn.to_id)
                if (o) toCoord = { x: o.x + o.width / 2, y: o.y + o.height / 2 }
              }
            }
            if (fromCoord && toCoord) {
              const dx = toCoord.x - fromCoord.x
              const dy = toCoord.y - fromCoord.y
              const len = Math.sqrt(dx * dx + dy * dy)
              segments.push({ from: fromCoord, to: toCoord, length: len })
              totalLength += len
            }
          }
          let drawn = 0
          let remain = totalLength * animationProgress
          for (const seg of segments) {
            if (remain <= 0) break
            const segLen = seg.length
            if (remain >= segLen) {
              ctx.beginPath()
              ctx.moveTo(seg.from.x, seg.from.y)
              ctx.lineTo(seg.to.x, seg.to.y)
              ctx.stroke()
              remain -= segLen
            } else {
              const t = remain / segLen
              const x = seg.from.x + (seg.to.x - seg.from.x) * t
              const y = seg.from.y + (seg.to.y - seg.from.y) * t
              ctx.beginPath()
              ctx.moveTo(seg.from.x, seg.from.y)
              ctx.lineTo(x, y)
              ctx.stroke()
              remain = 0
            }
          }
          ctx.setLineDash([])
          ctx.restore()
        }
      }

      ctx.restore()
      // Рисуем временный полигон, если рисуем
      if (mode === 'polygon' && polygonPoints.length > 0) {
        ctx.save()
        ctx.translate(transformState.current.offset.x, transformState.current.offset.y)
        ctx.scale(transformState.current.scale, transformState.current.scale)
        ctx.beginPath()
        ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y)
        for (let i = 1; i < polygonPoints.length; i++) {
          ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y)
        }
        ctx.strokeStyle = '#1976d2'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.stroke()
        ctx.setLineDash([])
        // Рисуем точки
        for (const pt of polygonPoints) {
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI)
          ctx.fillStyle = '#1976d2'
          ctx.fill()
        }
        ctx.restore()
      }
    },
    [buildingData, currentFloor, selectedObject, mode, polygonPoints, route, nodes, intersections, animationProgress],
  )

  // resize и обработчики
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get the container's dimensions
    const container = canvas.parentElement
    if (!container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    // Set the canvas size to match the container size
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Scale the context to account for the device pixel ratio
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    if (currentFloor) drawFloor(currentFloor)
  }, [currentFloor, drawFloor])

  // Сброс offset и scale только при первом монтировании
  useEffect(() => {
    transformState.current.offset = { x: 0, y: 0 }
    transformState.current.scale = 1
    setScaleValue(1)
  }, [])

  const setupCanvasEvents = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const getMouseCoords = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      // Координаты мыши в CSS-пикселях
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      return { x, y }
    }

    const mouseDown = (e: MouseEvent) => {
      if (mode === 'select') {
        transformState.current.isDragging = true
        transformState.current.lastPosition = { x: e.clientX, y: e.clientY }
      } else if (mode === 'move') {
        const { x, y } = getMouseCoords(e)
        const scaledX = (x - transformState.current.offset.x) / transformState.current.scale
        const scaledY = (y - transformState.current.offset.y) / transformState.current.scale

        const objs = buildingData?.objects.floors.find((f) => f.floor.name === currentFloor)?.objects || []
        const found = objs.find((o) => {
          return scaledX >= o.x && scaledX <= o.x + o.width && scaledY >= o.y && scaledY <= o.y + o.height
        })

        if (found) {
          setMovingObject({
            id: found.id,
            initialX: found.x,
            initialY: found.y,
            offsetX: scaledX - found.x,
            offsetY: scaledY - found.y,
          })
        }
      }
    }

    const mouseUp = async () => {
      if (mode === 'select') {
        transformState.current.isDragging = false
      } else if (mode === 'move' && movingObject) {
        // Update object position in the backend
        try {
          if (!buildingId || !currentFloor) return
          const objs = buildingData?.objects.floors.find((f) => f.floor.name === currentFloor)?.objects || []
          const obj = objs.find((o) => o.id === movingObject.id)
          if (obj) {
            await adminApi.updateObject(buildingId, currentFloor, obj.id, {
              ...obj,
              x: obj.x,
              y: obj.y,
            })
            // Refresh building data
            const updatedData = await api.getObjects(buildingId)
            setBuildingData(updatedData)
          }
        } catch (err) {
          console.error('Failed to update object position:', err)
        }
        setMovingObject(null)
      }
    }

    const mouseMove = (e: MouseEvent) => {
      if (mode === 'select' && transformState.current.isDragging) {
        const dx = e.clientX - transformState.current.lastPosition.x
        const dy = e.clientY - transformState.current.lastPosition.y
        transformState.current.offset.x += dx
        transformState.current.offset.y += dy
        transformState.current.lastPosition = { x: e.clientX, y: e.clientY }
        if (currentFloor) drawFloor(currentFloor)
      } else if (mode === 'move' && movingObject) {
        const { x, y } = getMouseCoords(e)
        const scaledX = (x - transformState.current.offset.x) / transformState.current.scale
        const scaledY = (y - transformState.current.offset.y) / transformState.current.scale

        if (buildingData) {
          const floor = buildingData.objects.floors.find((f) => f.floor.name === currentFloor)
          if (floor) {
            const obj = floor.objects.find((o) => o.id === movingObject.id)
            if (obj) {
              obj.x = scaledX - movingObject.offsetX
              obj.y = scaledY - movingObject.offsetY
              if (currentFloor) drawFloor(currentFloor)
            }
          }
        }
      }
    }

    const wheel = (e: WheelEvent) => {
      if (mode === 'select') {
        e.preventDefault()
        const factor = 1.05
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const prev = transformState.current.scale
        let newScale = e.deltaY < 0 ? prev * factor : prev / factor
        newScale = Math.max(0.2, Math.min(10, newScale))
        transformState.current.scale = newScale
        transformState.current.offset.x = x - ((x - transformState.current.offset.x) / prev) * newScale
        transformState.current.offset.y = y - ((y - transformState.current.offset.y) / prev) * newScale
        setScaleValue(newScale)
        if (currentFloor) drawFloor(currentFloor)
      }
    }

    const click = (e: MouseEvent) => {
      const { x, y } = getMouseCoords(e)

      switch (mode) {
        case 'select': {
          const objs = buildingData?.objects.floors.find((f) => f.floor.name === currentFloor)?.objects || []
          const scaledX = (x - transformState.current.offset.x) / transformState.current.scale
          const scaledY = (y - transformState.current.offset.y) / transformState.current.scale
          // Try to find object first
          const found = objs.find((o) => {
            return scaledX >= o.x && scaledX <= o.x + o.width && scaledY >= o.y && scaledY <= o.y + o.height
          })
          if (found) {
            setSelectedObject({
              name: found.name || 'Unnamed',
              alias: found.alias || '',
              description: found.description || '',
              type: getObjectTypeById(found.object_type_id),
              position: { x: found.x, y: found.y },
            })
          } else {
            // Try to find a door
            let foundDoor = null
            let foundObjId = ''
            for (const obj of objs) {
              if (obj.doors) {
                for (const door of obj.doors) {
                  if (
                    scaledX >= door.x &&
                    scaledX <= door.x + door.width &&
                    scaledY >= door.y &&
                    scaledY <= door.y + door.height
                  ) {
                    foundDoor = door
                    foundObjId = obj.id
                    break
                  }
                }
              }
              if (foundDoor) break
            }
            if (foundDoor) {
              setSelectedObject({
                id: foundDoor.id,
                object_id: foundObjId,
                type: 'door',
                position: { x: foundDoor.x, y: foundDoor.y, width: foundDoor.width, height: foundDoor.height },
              })
            } else {
              setSelectedObject(undefined)
            }
          }
          break
        }

        case 'create': {
          const scaledX = (x - transformState.current.offset.x) / transformState.current.scale
          const scaledY = (y - transformState.current.offset.y) / transformState.current.scale
          setNewObjectPosition({ x: scaledX, y: scaledY })
          setCreationModalOpen(true)
          break
        }

        case 'move': {
          // TODO: переместить объект
          break
        }

        case 'route': {
          // TODO: добавить точку маршрута
          break
        }

        case 'polygon': {
          const scaledX = (x - transformState.current.offset.x) / transformState.current.scale
          const scaledY = (y - transformState.current.offset.y) / transformState.current.scale
          setPolygonPoints((prev) => [...prev, { x: scaledX, y: scaledY }])
          setIsPolygonDrawing(true)
          break
        }

        default:
          break
      }
    }

    canvas.addEventListener('mousedown', mouseDown)
    canvas.addEventListener('mouseup', mouseUp)
    canvas.addEventListener('mousemove', mouseMove)
    canvas.addEventListener('wheel', wheel, { passive: false })
    canvas.addEventListener('click', click)

    return () => {
      canvas.removeEventListener('mousedown', mouseDown)
      canvas.removeEventListener('mouseup', mouseUp)
      canvas.removeEventListener('mousemove', mouseMove)
      canvas.removeEventListener('wheel', wheel)
      canvas.removeEventListener('click', click)
    }
  }, [mode, buildingData, currentFloor, drawFloor, movingObject])

  const handleCreateObject = async (data: NewObject) => {
    try {
      if (!buildingId || !currentFloor) return
      await adminApi.createObject(buildingId, currentFloor, {
        ...data,
        object_type_id: OBJECT_TYPE_TO_ID[data.type],
      })
      const updatedData = await api.getObjects(buildingId)
      setBuildingData(updatedData)
    } catch (err) {
      console.error(err)
    }
  }

  const finishPolygon = async () => {
    if (!buildingId || !currentFloor || polygonPoints.length < 3) return
    try {
      // Автогенерируем label
      const label = `Фон этажа ${currentFloor}`
      const zIndex = 0
      const polygon = await adminApi.createPolygon(buildingId, currentFloor, label, zIndex)
      // Формируем точки для API
      const points = polygonPoints.map((p, idx) => ({ point_order: idx, x: p.x, y: p.y }))
      await adminApi.addPolygonPoints(buildingId, currentFloor, polygon.id, points)
      // Обновляем данные здания
      const updatedData = await api.getObjects(buildingId)
      setBuildingData(updatedData)
      setPolygonPoints([])
      setIsPolygonDrawing(false)
      setMode('select')
    } catch (err) {
      console.error('Ошибка создания полигона:', err)
    }
  }

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    const off = setupCanvasEvents()

    // Add resize observer to handle page zoom changes
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current)
    }

    // === PINCH-TO-ZOOM ===
    const canvas = canvasRef.current
    let lastTouchDist: number | null = null
    let lastScale = 1
    let lastTouchCenter: { x: number; y: number } | null = null
    let isTouchDragging = false
    let lastTouchPos: { x: number; y: number } | null = null
    function getTouchDist(e: TouchEvent) {
      const a = e.touches[0]
      const b = e.touches[1]
      const dx = a.clientX - b.clientX
      const dy = a.clientY - b.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }
    function getTouchCenter(e: TouchEvent) {
      const a = e.touches[0]
      const b = e.touches[1]
      return {
        x: (a.clientX + b.clientX) / 2,
        y: (a.clientY + b.clientY) / 2,
      }
    }
    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        lastTouchDist = getTouchDist(e)
        lastScale = transformState.current.scale
        lastTouchCenter = getTouchCenter(e)
      } else if (e.touches.length === 1) {
        isTouchDragging = true
        lastTouchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }
    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && lastTouchDist && lastTouchCenter) {
        e.preventDefault()
        const newDist = getTouchDist(e)
        const newCenter = getTouchCenter(e)
        let scale = lastScale * (newDist / lastTouchDist)
        scale = Math.max(0.2, Math.min(10, scale))
        // Корректируем offset так, чтобы центр pinch оставался на месте
        const canvas = canvasRef.current
        if (canvas) {
          const rect = canvas.getBoundingClientRect()
          const prevScale = transformState.current.scale
          // координаты центра pinch относительно canvas
          const cx = newCenter.x - rect.left
          const cy = newCenter.y - rect.top
          // offset относительно нового масштаба
          transformState.current.offset.x = cx - ((cx - transformState.current.offset.x) / prevScale) * scale
          transformState.current.offset.y = cy - ((cy - transformState.current.offset.y) / prevScale) * scale
        }
        transformState.current.scale = scale
        setScaleValue(scale)
        if (currentFloor) drawFloor(currentFloor)
      } else if (e.touches.length === 1 && isTouchDragging && lastTouchPos) {
        e.preventDefault()
        const touch = e.touches[0]
        const dx = touch.clientX - lastTouchPos.x
        const dy = touch.clientY - lastTouchPos.y
        transformState.current.offset.x += dx
        transformState.current.offset.y += dy
        lastTouchPos = { x: touch.clientX, y: touch.clientY }
        if (currentFloor) drawFloor(currentFloor)
      }
    }
    function handleTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) {
        lastTouchDist = null
        lastTouchCenter = null
      }
      if (e.touches.length === 0) {
        isTouchDragging = false
        lastTouchPos = null
      }
    }
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
      canvas.addEventListener('touchend', handleTouchEnd)
    }
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      off?.()
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouchStart)
        canvas.removeEventListener('touchmove', handleTouchMove)
        canvas.removeEventListener('touchend', handleTouchEnd)
      }
      resizeObserver.disconnect()
    }
  }, [resizeCanvas, setupCanvasEvents, currentFloor, drawFloor, buildingData, mode, movingObject])

  const handleFloorChange = useCallback(
    (floor: string) => {
      setCurrentFloor(floor)
      drawFloor(floor)
    },
    [drawFloor],
  )
  const handleZoomIn = useCallback(() => {
    const ns = Math.min(10, transformState.current.scale + 0.1)
    transformState.current.scale = ns
    setScaleValue(ns)
    if (currentFloor) drawFloor(currentFloor)
  }, [currentFloor, drawFloor])
  const handleZoomOut = useCallback(() => {
    const ns = Math.max(0.2, transformState.current.scale - 0.1)
    transformState.current.scale = ns
    setScaleValue(ns)
    if (currentFloor) drawFloor(currentFloor)
  }, [currentFloor, drawFloor])

  const handleResetScale = useCallback(() => {
    transformState.current.scale = 1
    setScaleValue(1)
    if (currentFloor) drawFloor(currentFloor)
  }, [currentFloor, drawFloor])

  // Функция выбора иконки по типу объекта
  const getObjectIcon = (type: ObjectType) => {
    switch (type) {
      case 'wardrobe':
        return WardrobeIcon
      case 'cafe':
        return CafeIcon
      case 'canteen':
        return CafeteriaIcon
      case 'gym':
        return GymIcon
      case 'man-toilet':
        return ManToiletIcon
      case 'woman-toilet':
        return WomanToiletIcon
      case 'stair':
        return StairIcon
      case 'cabinet':
        return CabinetIcon
      case 'department':
        return DepartmentIcon
      case 'chill-zone':
        return ChillZoneIcon
      default:
        return ''
    }
  }

  if (!buildingData) return <div>Loading...</div>

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} className="canvas" />
      <CreationModal
        isOpen={creationModalOpen}
        initialPosition={newObjectPosition}
        buildingId={buildingId}
        currentFloor={currentFloor || undefined}
        onClose={() => setCreationModalOpen(false)}
        onSubmit={handleCreateObject}
      />

      {showEditBtns && (
        <>
          {/* Режимы */}
          <div className="mode-buttons">
            <button
              onClick={() => setMode('select')}
              className={`mode-button ${mode === 'select' ? 'active' : ''}`}
              title="Выбрать объект"
            >
              <span className="material-icons">touch_app</span>
            </button>

            <button
              onClick={() => setMode('create')}
              className={`mode-button ${mode === 'create' ? 'active' : ''}`}
              title="Создать объект"
            >
              <span className="material-icons">add_circle</span>
            </button>

            <button
              onClick={() => setMode('move')}
              className={`mode-button ${mode === 'move' ? 'active' : ''}`}
              title="Переместить карту"
            >
              <span className="material-icons">open_with</span>
            </button>

            <button
              onClick={() => setMode('route')}
              className={`mode-button ${mode === 'route' ? 'active' : ''}`}
              title="Построить маршрут"
            >
              <span className="material-icons">route</span>
            </button>

            <button
              onClick={() => setMode('polygon')}
              className={`mode-button ${mode === 'polygon' ? 'active' : ''}`}
              title="Рисовать полигон"
            >
              <span className="material-icons">edit</span>
            </button>
          </div>
        </>
      )}

      {/* Навигация этажи */}
      <FloorButtons
        floors={buildingData.objects.floors}
        currentFloor={currentFloor}
        onFloorChange={handleFloorChange}
      />

      {showPanel && (
        <>
          {/* show/hide info */}
          <button className="toggle-infobox-btn" onClick={() => setInfoBoxVisible((v) => !v)}>
            {isInfoBoxVisible ? 'Скрыть панель' : 'Показать панель'}
          </button>
          {isInfoBoxVisible &&
            (() => {
              let doorName: string | undefined = undefined
              let linkedObjectName: string | undefined = undefined
              function isDoor(obj: typeof selectedObject): obj is {
                id: string
                object_id: string
                type: 'door'
                position: { x: number; y: number; width: number; height: number }
              } {
                return !!obj && obj.type === 'door'
              }
              if (isDoor(selectedObject) && buildingData) {
                // Find the object by object_id
                for (const floor of buildingData.objects.floors) {
                  for (const obj of floor.objects) {
                    if (obj.id === selectedObject.object_id) {
                      linkedObjectName = obj.name
                      // Find the door by id
                      const door = obj.doors?.find((d) => d.id === selectedObject.id)
                      if (door) {
                        // Try to use alias or id as name, fallback to id
                        doorName = obj.name + (obj.doors.length > 1 ? ` (дверь ${obj.doors.indexOf(door) + 1})` : '')
                      }
                    }
                  }
                }
              }
              return (
                <InfoBox
                  buildingData={{
                    name: buildingData.objects.building.name,
                    address: buildingData.objects.building.address,
                    description: buildingData.objects.building.name,
                  }}
                  selectedObject={selectedObject}
                  floorNumber={buildingData.objects.floors.findIndex((f) => f.floor.name === currentFloor) + 1}
                  doorName={doorName}
                  linkedObjectName={linkedObjectName}
                />
              )
            })()}
        </>
      )}

      {/* Масштаб */}
      <ScaleControls
        scale={scaleValue}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetScale={handleResetScale}
      />

      {/* Кнопка завершения полигона */}
      {mode === 'polygon' && isPolygonDrawing && polygonPoints.length >= 3 && (
        <button style={{ position: 'absolute', top: 20, left: 20, zIndex: 100 }} onClick={finishPolygon}>
          Завершить полигон
        </button>
      )}
    </div>
  )
}

export default InteractiveCanvas
