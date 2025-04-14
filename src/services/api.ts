import { cacheService } from './cacheService'
import { BuildingsResponse } from './interface/building'
import { Category } from './interface/category'
import { Floor } from './interface/floor'
import { MapObject } from './interface/map-object'
import { MapPath } from './interface/map-path'

declare const process: {
  env: {
    REACT_APP_API_BASE_URL?: string
  }
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export const api = {
  async getBuildings(): Promise<BuildingsResponse> {
    const cacheKey = 'buildings'
    const cachedData = cacheService.get<BuildingsResponse>(cacheKey)
    if (cachedData) return cachedData

    const response = await fetch(`${API_BASE_URL}/api/buildings`)
    const data = await handleResponse<BuildingsResponse>(response)
    cacheService.set(cacheKey, data)
    return data
  },

  async getFloors(buildId: string): Promise<Floor[]> {
    const cacheKey = `floors-${buildId}`
    const cachedData = cacheService.get<Floor[]>(cacheKey)
    if (cachedData) return cachedData

    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildId}/floors`)
    const data = await handleResponse<Floor[]>(response)
    cacheService.set(cacheKey, data)
    return data
  },

  async getMapPath(buildId: string, fromId: string, toId: string): Promise<MapPath[]> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildId}/path?from=${fromId}&to=${toId}`)
    if (!response.ok) throw new Error('Failed to fetch path')
    return response.json()
  },

  // Получить объекты на этаже корпуса
  async getObjectsByBuilding(buildId: string): Promise<MapObject[]> {
    const cacheKey = `objects-${buildId}`
    const cachedData = cacheService.get<MapObject[]>(cacheKey)
    if (cachedData) return cachedData

    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildId}/objects`)
    const data = await handleResponse<MapObject[]>(response)
    cacheService.set(cacheKey, data)
    return data
  },

  // Поиск объектов в корпусе
  async search(buildId: string, query: string): Promise<MapObject[]> {
    const cacheKey = `search-${buildId}-${query}`
    const cachedData = cacheService.get<MapObject[]>(cacheKey)
    if (cachedData) return cachedData

    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildId}/search?query=${encodeURIComponent(query)}`)
    const data = await handleResponse<MapObject[]>(response)
    cacheService.set(cacheKey, data)
    return data
  },

  // Получить все категории объектов
  async getCategories(): Promise<Category[]> {
    const cacheKey = 'categories'
    const cachedData = cacheService.get<Category[]>(cacheKey)
    if (cachedData) return cachedData

    const response = await fetch(`${API_BASE_URL}/api/categories`)
    const data = await handleResponse<Category[]>(response)
    cacheService.set(cacheKey, data)
    return data
  },

  async getFloorPlan(floor: string, officeAId?: string, officeBId?: string): Promise<Blob> {
    let url = `${API_BASE_URL}/floor-plan?floor=${floor}`

    if (officeAId && officeBId) {
      url += `&office_a_id=${officeAId}&office_b_id=${officeBId}&top_k=3`
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch floor plan')
    return response.blob()
  },
}
