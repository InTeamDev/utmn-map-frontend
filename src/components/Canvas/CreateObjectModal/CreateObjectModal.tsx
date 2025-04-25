import { useState } from 'react'
import './CreateObjectModal.module.css'
type ObjectType = 'cabinet' | 'wardrobe' | 'woman-toilet' | 'man-toilet' | 'gym'

const OBJECT_TYPES = [
  { value: 'cabinet', label: 'Кабинет', color: 'rgba(0,128,255,1)' },
  { value: 'wardrobe', label: 'Гардероб', color: 'rgba(255,165,0,0.5)' },
  { value: 'woman-toilet', label: 'Женский туалет', color: 'rgba(255,192,203,0.5)' },
  { value: 'man-toilet', label: 'Мужской туалет', color: 'rgba(144,238,144,0.5)' },
  { value: 'gym', label: 'Спортзал', color: 'rgba(128,0,128,0.5)' },
]

export type NewObject = {
  name: string
  alias: string
  floor: string | null
  buildingId: string | undefined
  description: string
  type: ObjectType
  x: number
  y: number
  width: number
  height: number
}

type Props = {
  isOpen: boolean
  initialPosition: { x: number; y: number }
  buildingId?: string
  currentFloor?: string
  onClose: () => void
  onSubmit: (data: NewObject) => Promise<void>
}

export const CreationModal = ({ isOpen, initialPosition, buildingId, currentFloor, onClose, onSubmit }: Props) => {
  const [formData, setFormData] = useState<NewObject>({
    name: '',
    alias: '',
    floor: currentFloor || '',
    buildingId: buildingId || undefined,
    description: '',
    type: 'cabinet',
    x: initialPosition.x,
    y: initialPosition.y,
    width: 2,
    height: 2,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!formData.name) {
      setError('Укажите название объекта')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        ...formData,
        x: Number(formData.x),
        y: Number(formData.y),
      })
      onClose()
    } catch (err) {
      setError('Ошибка при создании объекта')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3 className="modal-title">Создать объект</h3>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <input
            type="text"
            placeholder="Название"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Алиас"
            value={formData.alias}
            onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
          />
        </div>

        <div className="form-group">
          <textarea
            placeholder="Описание"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="coord-group">
          <div className="form-group">
            <input
              type="number"
              placeholder="Координата X"
              value={formData.x}
              onChange={(e) => setFormData({ ...formData, x: Number(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Координата Y"
              value={formData.y}
              onChange={(e) => setFormData({ ...formData, y: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Тип объекта</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ObjectType })}
            className="combo-box"
          >
            {OBJECT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>
            Отменить
          </button>
          <button className="btn primary" onClick={handleSubmit}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
