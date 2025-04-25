import React, { useEffect, useState } from 'react'
import './CreateBuildingModal.module.css'

interface CreateBuildingModalProps {
  onSave: (building: { name: string; address: string; description: string }) => void
  onCancel: () => void
}

const CreateBuildingModal: React.FC<CreateBuildingModalProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', address: '', description: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    onSave(formData)
    setFormData({ name: '', address: '', description: '' })
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
    <div className="modal-overlay">
      <div className="modal">
        <h3 className="modal-title">Создать корпус</h3>
        <input type="text" name="name" placeholder="Название" value={formData.name} onChange={handleChange} />
        <input type="text" name="address" placeholder="Адрес" value={formData.address} onChange={handleChange} />
        <textarea name="description" placeholder="Описание" value={formData.description} onChange={handleChange} />
        <div className="modal-actions">
          <button className="modal-button save" onClick={handleSubmit}>
            Сохранить
          </button>
          <button className="modal-button cancel" onClick={onCancel}>
            Отменить
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateBuildingModal
