import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/public.api'
import { BuildingData } from '../../services/interface/map-object'
import './Canvas.css'
import { CreationModal, NewObject } from './CreateObjectModal/CreateObjectModal'
import { FloorButtons } from './FloorBtns/FloorBtns'
import { InfoBox } from './InfoBox/InfoBox'
import { ScaleControls } from './Scale/ScaleControl'

// Иконки для объектов
import WardrobeIcon from '../../assets/wardrobe.svg'
import KitchenIcon from '../../assets/kitchen.svg'
import CafeteriaIcon from '../../assets/cafeteria.svg'
import GymIcon from '../../assets/gym.svg'
import ManToiletIcon from '../../assets/man-toilet.svg'
import WomanToiletIcon from '../../assets/woman-toilet.svg'

// Типы для режимов работы
export type Mode = 'select' | 'create' | 'move' | 'route' | 'polygon'

// Типы для объектов на карте
type ObjectType = 'cabinet' | 'wardrobe' | 'woman-toilet' | 'man-toilet' | 'gym' | 'kitchen' | 'cafeteria'

const OBJECT_COLORS: Record<ObjectType, string> = {
  cabinet: '#C9E6FA',
  wardrobe: '#C9E6FA',
  'woman-toilet': '#C9E6FA',
  'man-toilet': '#C9E6FA',
  gym: '#C9E6FA',
  kitchen: '#C9E6FA',
  cafeteria: '#C9E6FA',
}

const OBJECT_ICONS: Record<ObjectType, string> = {
  cabinet: '',
  wardrobe: WardrobeIcon,
  'woman-toilet': WomanToiletIcon,
  'man-toilet': ManToiletIcon,
  gym: GymIcon,
  kitchen: KitchenIcon,
  cafeteria: CafeteriaIcon,
}

const DEFAULT_OBJECT_COLOR = '#C9E6FA'

// Глобальный кэш для иконок
const iconCache: Record<string, HTMLImageElement> = {}

interface InteractiveCanvasProps {
  showPanel?: boolean
  showEditBtns?: boolean
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ showPanel = false, showEditBtns = false }) => {
  const { buildingId } = useParams<{ buildingId: string }>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [buildingData, setBuildingData] = useState<BuildingData | null>(null)
  const [currentFloor, setCurrentFloor] = useState<string | null>(null)
  const [selectedObject, setSelectedObject] = useState<
    | {
        name: string
        alias: string
        description: string
        type: string
        position: { x: number; y: number }
      }
    | undefined
  >()
  const [scaleValue, setScaleValue] = useState(1)
  const [isInfoBoxVisible, setInfoBoxVisible] = useState(true)
  const [mode, setMode] = useState<Mode>('select')
  const [creationModalOpen, setCreationModalOpen] = useState(false)
  const [newObjectPosition, setNewObjectPosition] = useState({ x: 0, y: 0 })

  const transformState = useRef({
    offset: { x: 0, y: 0 },
    scale: 1,
    isDragging: false,
    lastPosition: { x: 0, y: 0 },
  })

  // Загрузка данных здания
  useEffect(() => {
    if (!buildingId) return
    ;(async () => {
      try {
        const data = await api.getObjectsByBuilding(buildingId)
        setBuildingData(data)
        if (data.objects.floors.length > 0) setCurrentFloor(data.objects.floors[0].floor.name)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [buildingId])

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

      // Отрисовка объектов
      floor.objects.forEach((obj) => {
        const type = obj.object_type as ObjectType
        ctx.fillStyle = OBJECT_COLORS[type] || DEFAULT_OBJECT_COLOR
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
        ctx.strokeStyle = '#A0C4E0'
        ctx.lineWidth = 1
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)

        switch (obj.name) {
          case 'Гардероб':
            obj.object_type = 'wardrobe'
            break
          case 'Dining':
            obj.object_type = 'cafeteria'
            break
          case 'Кухня':
            obj.object_type = 'kitchen'
            break
        }

        // Для кабинетов - текст по центру
        if (type === 'cabinet') {
          ctx.fillStyle = '#000000'
          ctx.font = '18px Arial, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(obj.name || '???', obj.x + obj.width / 2, obj.y + obj.height / 2)
        } else {
          // Для остальных объектов - иконки
          const icon = getObjectIcon(obj.object_type)
          if (icon) {
            if (iconCache[icon]) {
              ctx.drawImage(iconCache[icon], obj.x + obj.width / 2 - 12, obj.y + obj.height / 2 - 12, 24, 24)
            } else {
              const img = new window.Image()
              img.onload = () => {
                iconCache[icon] = img
                // Перерисовать canvas после загрузки иконки
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

      ctx.restore()
    }, [buildingData, currentFloor])

  // resize и обработчики
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const cssWidth = window.innerWidth
    const cssHeight = window.innerHeight
    canvas.width = cssWidth * dpr
    canvas.height = cssHeight * dpr
    canvas.style.width = cssWidth + 'px'
    canvas.style.height = cssHeight + 'px'
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    // Сброс трансформаций после resize
    transformState.current.offset = { x: 0, y: 0 }
    transformState.current.scale = 1
    setScaleValue(1)
    if (currentFloor) drawFloor(currentFloor)
  }, [currentFloor, drawFloor])

  const setupCanvasEvents = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
  
    const getMouseCoords = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const sx = canvas.width / rect.width
      const sy = canvas.height / rect.height
      const px = (e.clientX - rect.left) * sx
      const py = (e.clientY - rect.top) * sy
      const { offset, scale } = transformState.current
      const mx = (px - offset.x) / scale
      const my = (py - offset.y) / scale
      return { mx, my }
    }
  
    const mouseDown = (e: MouseEvent) => {
      if (mode === 'select') {
        transformState.current.isDragging = true
        transformState.current.lastPosition = { x: e.clientX, y: e.clientY }
      }
    }
  
    const mouseUp = () => {
      transformState.current.isDragging = false
    }
  
    const mouseMove = (e: MouseEvent) => {
      if (mode === 'select' && transformState.current.isDragging) {
        const dx = e.clientX - transformState.current.lastPosition.x
        const dy = e.clientY - transformState.current.lastPosition.y
        transformState.current.offset.x += dx
        transformState.current.offset.y += dy
        transformState.current.lastPosition = { x: e.clientX, y: e.clientY }
        if (currentFloor) drawFloor(currentFloor)
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
        transformState.current.offset.x =
          x - ((x - transformState.current.offset.x) / prev) * newScale
        transformState.current.offset.y =
          y - ((y - transformState.current.offset.y) / prev) * newScale
        setScaleValue(newScale)
        if (currentFloor) drawFloor(currentFloor)
      }
    }
  
    const click = (e: MouseEvent) => {
      const { mx, my } = getMouseCoords(e)
  
      switch (mode) {
        case 'select': {
          const objs = buildingData?.objects.floors.find((f) => f.floor.name === currentFloor)?.objects || []
          const found = objs.find(
            (o) =>
              mx >= o.x &&
              mx <= o.x + o.width &&
              my >= o.y &&
              my <= o.y + o.height
          )
          if (found) {
            setSelectedObject({
              name: found.name || 'Unnamed',
              alias: found.alias || '',
              description: found.description || '',
              type: found.object_type,
              position: { x: found.x, y: found.y },
            })
          } else {
            setSelectedObject(undefined)
          }
          break
        }
  
        case 'create': {
          setNewObjectPosition({ x: mx, y: my })
          setCreationModalOpen(true)
          break
        }
  
        case 'route': {
          // TODO: добавить точку маршрута
          break
        }
  
        case 'polygon': {
          // TODO: добавить точку полигона
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
  }, [mode, buildingData, currentFloor, drawFloor])
  

  const handleCreateObject = async (data: NewObject) => {
    try {
      await api.createObject({
        ...data,
        floor: currentFloor,
        buildingId: buildingId,
      })
      // Обновление данных
      const updatedData = await api.getObjectsByBuilding(buildingId)
      setBuildingData(updatedData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    const off = setupCanvasEvents()

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
          transformState.current.offset.x =
            cx - ((cx - transformState.current.offset.x) / prevScale) * scale
          transformState.current.offset.y =
            cy - ((cy - transformState.current.offset.y) / prevScale) * scale
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
    }
  }, [resizeCanvas, setupCanvasEvents, currentFloor, drawFloor])

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

  // Функция выбора иконки по строгому типу
  const getObjectIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'wardrobe') return WardrobeIcon;
    if (t === 'kitchen') return KitchenIcon;
    if (t === 'cafeteria' || t === 'dining') return CafeteriaIcon;
    if (t === 'gym') return GymIcon;
    if (t === 'man-toilet') return ManToiletIcon;
    if (t === 'woman-toilet') return WomanToiletIcon;
    return '';
  };

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
          {isInfoBoxVisible && (
            <InfoBox
              buildingData={{
                name: buildingData.objects.building.name,
                address: buildingData.objects.building.address,
                description: buildingData.objects.building.name,
              }}
              selectedObject={selectedObject}
              floorNumber={buildingData.objects.floors.findIndex((f) => f.floor.name === currentFloor) + 1}
            />
          )}
        </>
      )}

      {/* Масштаб */}
      <ScaleControls
        scale={scaleValue}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetScale={handleResetScale}
      />
    </div>
  )
}

export default InteractiveCanvas
