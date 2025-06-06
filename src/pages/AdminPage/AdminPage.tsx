import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateBuildingModal from '../../components/CreateBuildingModal/CreateBuildingModal'
import { api } from '../../services/public.api'
import { useAuth } from '../../services/auth/AuthContext'
import { Building } from '../../services/interfaces/building'
import './AdminPage.css'
import Header from '../../components/Header/Header'
import { adminApi } from '../../services/admin.api'

const AdminPage: React.FC = () => {
  const { logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; buildingId: string } | null>(null)
  const [deletingBuildingId, setDeletingBuildingId] = useState<string | null>(null)

  const fetchBuildings = async () => {
    try {
      setLoading(true)
      const response = await api.getBuildings()
      if (response && response.buildings && Array.isArray(response.buildings)) {
        setBuildings(response.buildings)
      } else {
        throw new Error('Некорректный формат данных: ожидался объект с полем buildings')
      }
    } catch (err) {
      setError('Не удалось загрузить список строений')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchBuildings()
  }, [isAuthenticated, navigate])

  const handleNewBuilding = async (buildingData: { name: string; address: string }) => {
    try {
      await adminApi.createBuilding(buildingData)
      await fetchBuildings() // Перезагружаем список зданий после создания
      setIsModalOpen(false)
    } catch (err) {
      console.error('Error creating building:', err)
      setError('Не удалось создать здание')
    }
  }

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleBuildingClick = (buildingId: string) => {
    navigate(`/admin/${buildingId}`)
  }

  const handleContextMenu = (e: React.MouseEvent, buildingId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, buildingId })
  }

  const handleDeleteBuilding = async (buildingId: string) => {
    try {
      setDeletingBuildingId(buildingId)
      await adminApi.deleteBuilding(buildingId)
      await fetchBuildings() // Перезагружаем список зданий после удаления
      setDeletingBuildingId(null)
    } catch (err) {
      console.error('Ошибка удаления здания:', err)
      setDeletingBuildingId(null)
    }
    setContextMenu(null)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="admin-page">
      <Header title="Админ-панель" showLogOut={true} onLogout={handleLogout} />
      <main className="admin-content">
        {loading && <p>Загрузка строений...</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="buildings-board">
          <h2>Доступные строения</h2>
          <div className="buildings-grid">
            {buildings.map((building) => (
              <div
                key={building.id}
                className={`building-card ${deletingBuildingId === building.id ? 'deleting' : ''}`}
                onClick={() => handleBuildingClick(building.id)}
                onContextMenu={(e) => handleContextMenu(e, building.id)}
              >
                <div className="building-card-content">
                  <h3>{building.name}</h3>
                  <div className="address-container">{renderAddress(building.address)}</div>
                </div>
              </div>
            ))}
            <div className="building-card add-card" onClick={() => setIsModalOpen(true)}>
              <div className="building-card-content plus-card">
                <span>+</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          <button onClick={() => handleDeleteBuilding(contextMenu.buildingId)}>
            Удалить здание
          </button>
        </div>
      )}

      {isModalOpen && (
        <CreateBuildingModal
          onSave={handleNewBuilding}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}

const renderAddress = (address: string | undefined | null) => {
  if (!address) {
    return <p className="address-line">Адрес не указан</p>
  }
  return address.split('\n').map((line, index) => (
    <p key={index} className="address-line">
      {line}
    </p>
  ))
}

export default AdminPage
