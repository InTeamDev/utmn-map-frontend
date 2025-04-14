import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminHeader from '../../components/AdminHeader/AdminHeader'
import { api } from '../../services/api'
import { useAuth } from '../../services/auth/AuthContext'
import { Building } from '../../services/interface/building'
import './AdminPage.css'

const AdminPage: React.FC = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true)
        const response = await api.getBuildings()

        console.log('Received data:', response)

        if (response && response.buildings && Array.isArray(response.buildings)) {
          setBuildings(response.buildings)
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
    navigate(`/admin/${buildingId}`)
  }

  const renderAddress = (address: string) => {
    return address.split(', ').map((line, index) => (
      <p key={index} className="address-line">
        {line}
      </p>
    ))
  }

  return (
    <div className="admin-page">
      <AdminHeader title="Админ-панель" />
      <main className="admin-content">
        <p>Добро пожаловать в админку! Здесь вы можете управлять системой.</p>

        {loading && <p>Загрузка строений...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && buildings.length > 0 ? (
          <div className="buildings-board">
            <h2>Доступные строения</h2>
            <div className="buildings-grid">
              {buildings.map((building) => (
                <div key={building.id} className="building-card" onClick={() => handleBuildingClick(building.id)}>
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
      </main>
    </div>
  )
}

export default AdminPage
