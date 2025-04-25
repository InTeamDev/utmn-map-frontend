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

export const FloorButtons: React.FC<FloorButtonsProps> = ({ floors, currentFloor, onFloorChange }) => (
  <div className="floor-buttons">
    {floors.map((f) => (
      <FloorButton
        key={f.floor.name}
        floor={f.floor}
        isActive={currentFloor === f.floor.name}
        onClick={onFloorChange}
      />
    ))}
  </div>
)
