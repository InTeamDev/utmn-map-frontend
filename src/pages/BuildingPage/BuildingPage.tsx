import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../services/auth/AuthContext'
import { MapObject } from '../../services/interface/map-object'
import { Building, BuildingsResponse } from '../../services/interface/building'
import '../AdminPage/AdminPage.css'
import AdminHeader from '../../components/AdminHeader/AdminHeader'

const BuildingDetails: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [objects, setObjects] = useState<MapObject[]>([])
  const [building, setBuilding] = useState<Building | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 1. Получаем список всех строений
        const buildingsResponse: BuildingsResponse = await api.getBuildings()

        // 2. Находим нужное здание по ID
        const foundBuilding = buildingsResponse.buildings.find((b) => b.id === buildingId)
        if (!foundBuilding) {
          throw new Error('Здание не найдено')
        }
        setBuilding(foundBuilding)

        // 3. Получаем объекты в этом здании
        const objectsResponse = await api.getObjectsByBuilding(buildingId!)
        setObjects(objectsResponse)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить данные')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (buildingId) {
      fetchData()
    }
  }, [buildingId])

  const handleObjectClick = (objectId: string) => {
    navigate(`/admin/${buildingId}/object/${objectId}`)
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
      <AdminHeader title={building ? `Объекты в ${building.name}` : 'Загрузка...'} />

      <main className="admin-content">
        {loading && <p>Загрузка информации о строении...</p>}
        {error && <p className="error-message">{error}</p>}

        {building && (
          <div className="building-info-section">
            <div className="building-header">
              <h2>{building.name}</h2>
              <div className="address-container">
                <h3>Адрес:</h3>
                {renderAddress(building.address)}
              </div>
            </div>

            <div className="objects-section">
              <h3>Объекты в здании:</h3>

              {objects.length > 0 ? (
                <div className="objects-grid">
                  {objects.map((obj) => (
                    <div key={obj.id} className="object-card" onClick={() => handleObjectClick(obj.id)}>
                      <h4>{obj.name}</h4>
                      <p>Категория: {obj.category}</p>
                      {/* Дополнительная информация об объекте */}
                    </div>
                  ))}
                </div>
              ) : (
                <p>В этом здании нет объектов</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default BuildingDetails
