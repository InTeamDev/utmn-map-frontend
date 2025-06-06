import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/public.api'
import { Building } from '../../services/interfaces/building'
import './BuildingsPage.css'

const BuildingsPage: React.FC = () => {
  const navigate = useNavigate()
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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

    fetchBuildings()
  }, [])

  const handleBuildingClick = (buildingId: string) => {
    navigate(`/building/${buildingId}`)
  }

  return (
    <div className="buildings-page">
     

      <main className="buildings-content">
        {loading && <p>Загрузка строений...</p>}
        {error && <p className="error-message">{error}</p>}

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
      </main>
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

export default BuildingsPage
