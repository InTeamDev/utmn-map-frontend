// Компонент панели управления масштабом
interface ScaleControlsProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
}

export const ScaleControls: React.FC<ScaleControlsProps> = ({ scale, onZoomIn, onZoomOut }) => (
  <div className="scale-controls">
    <button onClick={onZoomOut}>−</button>
    <span>{Math.round(scale * 100)}%</span>
    <button onClick={onZoomIn}>+</button>
  </div>
)
