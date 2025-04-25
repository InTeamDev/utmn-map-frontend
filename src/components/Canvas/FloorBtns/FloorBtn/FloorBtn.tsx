// Компонент кнопки этажа
interface FloorButtonProps {
  floor: {
    name: string
    alias: string
  }
  isActive: boolean
  onClick: (floorName: string) => void
}

export const FloorButton: React.FC<FloorButtonProps> = ({ floor, isActive, onClick }) => (
  <button className={`button ${isActive ? 'active' : ''}`} onClick={() => onClick(floor.name)}>
    {floor.alias}
    <span className="tooltip">Этаж: {floor.name}</span>
  </button>
)
