import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateBuildingModal from '../../components/CreateBuildingModal/CreateBuildingModal'
import { api } from '../../services/public.api'
import { useAuth } from '../../services/auth/AuthContext'
import { Building } from '../../services/interface/building'
import './AdminPage.css'
import Header from '../../components/Header/Header'

const AdminPage: React.FC = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true)
        const response = await api.getBuildings()
        if (response && response.buildings && Array.isArray(response.buildings)) {
          console.log('Fetched buildings:', response.buildings)
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

    fetchBuildings()
  }, [])

  const handleBuildingClick = (buildingId: string) => {
    navigate(`/admin/${buildingId}`)
  }

  return (
    <div className="admin-page">
      <Header title="Админ-панель" showLogOut={true} />
      <main className="admin-content">
        {loading && <p>Загрузка строений...</p>}
        {error && <p className="error-message">{error}</p>}

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
            <div className="building-card add-card" onClick={() => setIsModalOpen(true)}>
              <div className="building-card-content plus-card">
                <span>+</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <CreateBuildingModal
          onSave={async (data) => {
            try {
              const created = await api.createBuilding(data)
              setBuildings([...buildings, created])
              setIsModalOpen(false)
            } catch (err) {
              console.error('Ошибка создания здания:', err)
            }
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}

const renderAddress = (address: string) => {
  return address.split('\n').map((line, index) => (
    <p key={index} className="address-line">
      {line}
    </p>
  ))
}

export default AdminPage
