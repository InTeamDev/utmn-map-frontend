// Компонент панели управления масштабом
interface ScaleControlsProps {
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetScale?: () => void
}

export const ScaleControls: React.FC<ScaleControlsProps> = ({ scale, onZoomIn, onZoomOut, onResetScale }) => (
  <div className="scale-controls">
    <button onClick={onZoomOut}>−</button>
    <span
      style={{ cursor: onResetScale ? 'pointer' : 'default', userSelect: 'none' }}
      onClick={onResetScale}
      title="Сбросить масштаб к 100%"
    >
      {Math.round(scale * 100)}%
    </span>
    <button onClick={onZoomIn}>+</button>
  </div>
)
