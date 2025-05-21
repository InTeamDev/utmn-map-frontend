import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/public.api'
import { BuildingData } from '../../services/interface/map-object'
import './Canvas.css'
import { CreationModal, NewObject } from './CreateObjectModal/CreateObjectModal'
import { FloorButtons } from './FloorBtns/FloorBtns'
import { InfoBox } from './InfoBox/InfoBox'
import { ScaleControls } from './Scale/ScaleControl'

// Типы для режимов работы
export type Mode = 'select' | 'create' | 'move' | 'route' | 'polygon'
// Типы для объектов на карте

type ObjectType = 'cabinet' | 'wardrobe' | 'woman-toilet' | 'man-toilet' | 'gym'

const OBJECT_COLORS: Record<ObjectType, string> = {
  cabinet: 'rgba(0,128,255,1)',
  wardrobe: 'rgba(255,165,0,0.5)',
  'woman-toilet': 'rgba(255,192,203,0.5)',
  'man-toilet': 'rgba(144,238,144,0.5)',
  gym: 'rgba(128,0,128,0.5)',
}

const DEFAULT_OBJECT_COLOR = 'rgba(200,200,200,0.5)'

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
        console.log(data)
        setBuildingData(data)
        if (data.objects.floors.length > 0) setCurrentFloor(data.objects.floors[0].floor.name)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [buildingId])

  // Отрисовка этажа
  const drawFloor = useCallback(
    (floorName: string) => {
      const canvas = canvasRef.current
      if (!canvas || !buildingData) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { offset, scale } = transformState.current
      const floor = buildingData.objects.floors.find((f) => f.floor.name === floorName)
      if (!floor) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.translate(offset.x, offset.y)
      ctx.scale(scale, scale)

      floor.objects.forEach((obj) => {
        const type = obj.object_type as ObjectType
        ctx.fillStyle = OBJECT_COLORS[type] || DEFAULT_OBJECT_COLOR
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)
        ctx.fillStyle = 'black'
        ctx.font = '14px Arial'
        ctx.fillText(obj.name || '???', obj.x + 5, obj.y + 15)
        obj.doors?.forEach((door) => {
          ctx.fillStyle = 'red'
          ctx.fillRect(door.x, door.y, door.width, door.height)
          ctx.strokeRect(door.x, door.y, door.width, door.height)
        })
      })

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
          ctx.fillStyle = 'rgba(200, 200, 200, 0.3)' // цвет и прозрачность фона
          ctx.fill()
          ctx.strokeStyle = 'rgba(150, 150, 150, 0.8)' // контур
          ctx.stroke()
        })
      }

      ctx.restore()
    },
    [buildingData],
  )

  // resize и обработчики
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth * 0.8
    canvas.height = window.innerHeight * 0.6
    if (currentFloor) drawFloor(currentFloor)
  }, [currentFloor, drawFloor])

  const setupCanvasEvents = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
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
        transformState.current.scale = e.deltaY < 0 ? prev * factor : prev / factor
        transformState.current.offset.x =
          x - ((x - transformState.current.offset.x) / prev) * transformState.current.scale
        transformState.current.offset.y =
          y - ((y - transformState.current.offset.y) / prev) * transformState.current.scale
        setScaleValue(transformState.current.scale)
        if (currentFloor) drawFloor(currentFloor)
      }
    }
    const click = (e: MouseEvent) => {
      const c = canvasRef.current!
      const rect = c.getBoundingClientRect()
      const sx = c.width / rect.width
      const sy = c.height / rect.height
      const px = (e.clientX - rect.left) * sx
      const py = (e.clientY - rect.top) * sy
      const { offset, scale } = transformState.current
      const mx = (px - offset.x) / scale
      const my = (py - offset.y) / scale
      if (mode === 'select') {
        const objs = buildingData?.objects.floors.find((f) => f.floor.name === currentFloor)?.objects || []
        const found = objs.find((o) => mx >= o.x && mx <= o.x + o.width && my >= o.y && my <= o.y + o.height)
        if (found)
          setSelectedObject({
            name: found.name || 'Unnamed',
            alias: found.alias || '',
            description: found.description || '',
            type: found.object_type,
            position: { x: found.x, y: found.y },
          })
        else setSelectedObject(undefined)
      }
      if (mode === 'create') {
        const c = canvasRef.current!
        const rect = c.getBoundingClientRect()
        const sx = c.width / rect.width
        const sy = c.height / rect.height
        const px = (e.clientX - rect.left) * sx
        const py = (e.clientY - rect.top) * sy
        const { offset, scale } = transformState.current
        const mx = (px - offset.x) / scale
        const my = (py - offset.y) / scale

        setNewObjectPosition({ x: mx, y: my })
        setCreationModalOpen(true)
      }
      if (mode === 'route') {
        // TODO: dp route point
      }
      if (mode === 'polygon') {
        // TODO: dp polygon point
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
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      off?.()
    }
  }, [resizeCanvas, setupCanvasEvents])

  const handleFloorChange = useCallback(
    (floor: string) => {
      setCurrentFloor(floor)
      drawFloor(floor)
    },
    [drawFloor],
  )
  const handleZoomIn = useCallback(() => {
    const ns = transformState.current.scale + 0.1
    transformState.current.scale = ns
    setScaleValue(ns)
    if (currentFloor) drawFloor(currentFloor)
  }, [currentFloor, drawFloor])
  const handleZoomOut = useCallback(() => {
    const ns = Math.max(0.1, transformState.current.scale - 0.1)
    transformState.current.scale = ns
    setScaleValue(ns)
    if (currentFloor) drawFloor(currentFloor)
  }, [currentFloor, drawFloor])

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
      <ScaleControls scale={scaleValue} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
    </div>
  )
}

export default InteractiveCanvas
