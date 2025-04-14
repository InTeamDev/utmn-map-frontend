import React from 'react'

interface FloorMapProps {
  objects: {
    id: string
    name: string
    type: string
    x: number
    y: number
    width?: number
    height?: number
  }[]
  paths?: {
    points: { x: number; y: number }[]
  }[]
  selectedFrom?: string | null
  selectedTo?: string | null
}

const FloorMap: React.FC<FloorMapProps> = ({ objects, paths, selectedFrom, selectedTo }) => {
  return (
    <svg width="100%" height="500" viewBox="0 0 1000 500">
      {/* Отрисовка фона карты */}
      <rect x="0" y="0" width="1000" height="500" fill="#f5f5f5" />

      {/* Отрисовка объектов */}
      {objects.map((obj) => (
        <g key={obj.id}>
          <rect
            x={obj.x}
            y={obj.y}
            width={obj.width || 40}
            height={obj.height || 40}
            fill={obj.id === selectedFrom ? 'blue' : obj.id === selectedTo ? 'red' : '#ccc'}
            stroke="#333"
          />
          <text
            x={obj.x + (obj.width || 40) / 2}
            y={obj.y + (obj.height || 40) / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#000"
            fontSize="12"
          >
            {obj.name}
          </text>
        </g>
      ))}

      {/* Отрисовка пути, если есть */}
      {paths?.map((path, i) => (
        <polyline
          key={i}
          points={path.points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="green"
          strokeWidth="3"
        />
      ))}
    </svg>
  )
}

export default FloorMap
