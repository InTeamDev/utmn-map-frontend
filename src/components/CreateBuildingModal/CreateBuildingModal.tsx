import React, { useEffect, useState } from 'react'
import styles from './CreateBuildingModal.module.css'

interface CreateBuildingModalProps {
  onSave: (building: { name: string; address: string }) => void
  onCancel: () => void
}

const CreateBuildingModal: React.FC<CreateBuildingModalProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', address: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      return
    }
    setIsSubmitting(true)
    try {
      await onSave(formData)
      setFormData({ name: '', address: '' })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Создать корпус</h3>
          <button className={styles.closeButton} onClick={onCancel}>×</button>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="name">Название корпуса</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Введите название корпуса"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address">Адрес</label>
          <textarea
            id="address"
            name="address"
            placeholder="Введите адрес корпуса"
            value={formData.address}
            onChange={handleChange}
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.modalActions}>
          <button 
            className={`${styles.modalButton} ${styles.cancelButton}`} 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Отменить
          </button>
          <button 
            className={`${styles.modalButton} ${styles.saveButton}`} 
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim() || !formData.address.trim()}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateBuildingModal
