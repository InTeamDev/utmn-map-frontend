import React, { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../services/auth/AuthContext'
import { Building } from '../../services/interface/building'
import './AdminPage.css'

const AdminPage: React.FC = () => {
  const { logout } = useAuth()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true)
        const response = await api.getBuildings()

        // Исправленная обработка ответа
        console.log('Received data:', response)

        if (response && response.buildings && Array.isArray(response.buildings)) {
          setBuildings(response.buildings)
          if (response.buildings.length > 0) {
            setSelectedBuilding(response.buildings[0].id)
          }
        } else {
          throw new Error('Некорректный формат данных: ожидался объект с полем buildings')
        }
      } catch (err) {
        setError('Не удалось загрузить список строений')
        console.error('Error fetching buildings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBuildings()
  }, [])

  const handleBuildingClick = (buildingId: string) => {
    setSelectedBuilding(buildingId)
  }

  // Функция для отображения адреса
  const renderAddress = (address: string) => {
    return address.split(', ').map((line, index) => (
      <p key={index} className="address-line">
        {line}
      </p>
    ))
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Админ-панель</h1>
        <button onClick={logout} className="logout-button">
          Выйти
        </button>
      </header>
      <main className="admin-content">
        <p>Добро пожаловать в админку! Здесь вы можете управлять системой.</p>

        {loading && <p>Загрузка строений...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && buildings.length > 0 ? (
          <div className="buildings-board">
            <h2>Доступные строения</h2>
            <div className="buildings-grid">
              {buildings.map((building) => (
                <div
                  key={building.id}
                  className={`building-card ${selectedBuilding === building.id ? 'selected' : ''}`}
                  onClick={() => handleBuildingClick(building.id)}
                >
                  <div className="building-card-content">
                    <h3>{building.name}</h3>
                    <div className="address-container">{renderAddress(building.address)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !loading && !error && <p>Нет доступных строений</p>
        )}

        {selectedBuilding && (
          <div className="building-info">
            <h2>Управление выбранным строением</h2>
            <p>ID строения: {selectedBuilding}</p>
            {/* Дополнительная информация о выбранном здании */}
            {buildings.find((b) => b.id === selectedBuilding)?.address && (
              <div className="selected-building-address">
                <h3>Адрес:</h3>
                {renderAddress(buildings.find((b) => b.id === selectedBuilding)!.address)}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminPage
