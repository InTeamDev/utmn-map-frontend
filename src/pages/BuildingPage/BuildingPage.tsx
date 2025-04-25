import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../services/auth/AuthContext'
import { Building, BuildingsResponse } from '../../services/interface/building'
import '../AdminPage/AdminPage.css'
import AdminHeader from '../../components/AdminHeader/AdminHeader'
import InteractiveCanvas from '../../components/Canvas/Canvas'

const BuildingDetails: React.FC = () => {
  const { buildingId } = useParams<{ buildingId: string }>()
  const { logout } = useAuth()
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

  return (
    <div className="admin-page">
      <AdminHeader title={building ? `Редактирование ${building.name}, Адрес: ${building.address}` : 'Загрузка...'} />

      <main className="admin-content">
        {loading && <p>Загрузка информации о строении...</p>}
        {error && <p className="error-message">{error}</p>}

        {building && (
          <div className="objects-section">
            <InteractiveCanvas />
          </div>
        )}
      </main>
    </div>
  )
}

export default BuildingDetails
