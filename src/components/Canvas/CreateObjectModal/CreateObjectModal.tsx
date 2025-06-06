import { useState } from 'react'
import { ObjectType } from '../../../services/interfaces/object'
import styles from './CreateObjectModal.module.css' // ✅ Правильный импорт CSS-модуля

const OBJECT_TYPES = [
  { value: 'cabinet', label: 'Аудитория', color: '#4A90E2', icon: '🏫', description: 'Учебная аудитория' },
  { value: 'department', label: 'Кафедра', color: '#F5A623', icon: '📚', description: 'Кафедра факультета' },
  { value: 'man-toilet', label: 'Мужской туалет', color: '#7ED321', icon: '🚹', description: 'Мужской санузел' },
  { value: 'woman-toilet', label: 'Женский туалет', color: '#FF69B4', icon: '🚺', description: 'Женский санузел' },
  { value: 'stair', label: 'Лестница', color: '#9B9B9B', icon: '🪜', description: 'Межэтажная лестница' },
  { value: 'wardrobe', label: 'Гардероб', color: '#A52A2A', icon: '🧥', description: 'Место для верхней одежды' },
  { value: 'gym', label: 'Спортзал', color: '#9013FE', icon: '💪', description: 'Спортивный зал' },
  { value: 'cafe', label: 'Кафетерий', color: '#FFD700', icon: '☕', description: 'Место для перекуса' },
  { value: 'canteen', label: 'Столовая', color: '#FF4500', icon: '🍽️', description: 'Студенческая столовая' },
  { value: 'chill-zone', label: 'Зона отдыха', color: '#00FF7F', icon: '🛋️', description: 'Место для отдыха' },
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
      await onSubmit({ ...formData, x: Number(formData.x), y: Number(formData.y) })
      onClose()
    } catch (err) {
      setError('Ошибка при создании объекта')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Создать объект</h3>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={styles.inputField}
            />
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Alias"
              value={formData.alias}
              onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              className={styles.inputField}
            />
          </div>

          <div className={styles.formGroup}>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={styles.inputField}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as ObjectType })}
              className={styles.comboBox}
            >
              <option value="" disabled hidden>Type</option>
              {OBJECT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.coordGroup}>
            <input
              type="number"
              placeholder="X"
              value={formData.x}
              onChange={(e) => setFormData({ ...formData, x: Number(e.target.value) })}
              className={styles.inputField}
            />
            <input
              type="number"
              placeholder="Y"
              value={formData.y}
              onChange={(e) => setFormData({ ...formData, y: Number(e.target.value) })}
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button 
            className={styles.btnPrimary} 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Сохранить
          </button>
          <button 
            className={styles.btnSecondary} 
            onClick={onClose}
          >
            Отменить
          </button>
        </div>
      </div>
    </div>
  )
}
