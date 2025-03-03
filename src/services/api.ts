import { cacheService } from './cacheService'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'

export interface LocationsMap {
  [key: string]: string
}

export const api = {
  async getFloorPlan(floor: string, officeAId?: string, officeBId?: string): Promise<Blob> {
    let url = `${API_BASE_URL}/floor-plan?floor=${floor}`

    if (officeAId && officeBId) {
      url += `&office_a_id=${officeAId}&office_b_id=${officeBId}&top_k=3`
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch floor plan')

    return response.blob()
  },

  async getObjects(): Promise<LocationsMap> {
    const cacheKey = 'objects'
    const response = await fetch(`${API_BASE_URL}/objects`)
    if (!response.ok) throw new Error('Failed to fetch objects')

    const data = await response.json()
    cacheService.set(cacheKey, data)
    return data
  },
}
