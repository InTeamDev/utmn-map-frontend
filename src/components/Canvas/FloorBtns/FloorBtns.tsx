import { FloorButton } from './FloorBtn/FloorBtn'

// Компонент панели кнопок этажей
interface FloorButtonsProps {
  floors: Array<{
    floor: {
      name: string
      alias: string
    }
  }>
  currentFloor: string | null
  onFloorChange: (floorName: string) => void
}

export const FloorButtons: React.FC<FloorButtonsProps> = ({ floors, currentFloor, onFloorChange }) => {
  const sortedFloors = [...floors].sort((a, b) => {
    const floorA = parseInt(a.floor.alias, 10)
    const floorB = parseInt(b.floor.alias, 10)
    return floorB - floorA // сортировка от 4 к 1
  })

  return (
    <div className="floor-buttons">
      {sortedFloors.map((f) => {
        const displayAlias = f.floor.alias.replace(/\D/g, '') // удаляем все нецифровые символы

        return (
          <FloorButton
            key={f.floor.name}
            floor={{ ...f.floor, alias: displayAlias }}
            isActive={currentFloor === f.floor.name}
            onClick={onFloorChange}
          />
        )
      })}
    </div>
  )
}
