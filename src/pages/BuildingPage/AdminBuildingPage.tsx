import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/public.api'
import { useAuth } from '../../services/auth/AuthContext'
import { Building, BuildingsResponse } from '../../services/interfaces/building'
import './AdminBuildingPage.css'
import InteractiveCanvas from '../../components/Canvas/Canvas'
import Header from '../../components/Header/Header'

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
    <div className="admin-building-page-container">
      <Header title={building ? `Редактирование ${building.name}, Адрес: ${building.address}` : 'Загрузка...'} />
      {loading && <p>Загрузка информации о строении...</p>}
      {error && <p className="error-message">{error}</p>}
      {building && <InteractiveCanvas showPanel={true} showEditBtns={true} />}
    </div>
  )
}

export default BuildingDetails
