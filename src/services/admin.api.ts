import {
  Building,
  CreateBuildingInput,
  UpdateBuildingInput,
  Object,
  CreateObjectInput,
  UpdateObjectInput,
  Intersection,
  Connection,
  Edge,
  AddIntersectionRequest,
  Polygon,
  PolygonPointRequest,
  SyncAllData,
  AdminError
} from './interfaces/admin'
import { authApi } from './auth.api'

declare const process: {
  env: {
    REACT_APP_ADMIN_API: string
  }
}

const API_BASE_URL = process.env.REACT_APP_ADMIN_API

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: AdminError = {
      message: `HTTP error! status: ${response.status}`,
      status: response.status
    }
    throw error
  }
  return response.json() as Promise<T>
}

async function fetchWithAuthRetry(input: RequestInfo, init?: RequestInit, retry = true): Promise<Response> {
  let accessToken = localStorage.getItem('access_token')
  let refreshToken = localStorage.getItem('refresh_token')
  if (init && init.headers && typeof init.headers === 'object') {
    (init.headers as any)['Authorization'] = `Bearer ${accessToken}`
  } else {
    init = { ...(init || {}), headers: { ...(init?.headers || {}), 'Authorization': `Bearer ${accessToken}` } }
  }
  let response = await fetch(input, init)
  if (response.status === 401 && retry && refreshToken) {
    try {
      const refreshRes = await authApi.refresh({ refresh_token: refreshToken })
      localStorage.setItem('access_token', refreshRes.access_token)
      localStorage.setItem('refresh_token', refreshRes.refresh_token)
      // Повторяем запрос с новым токеном
      if (init && init.headers && typeof init.headers === 'object') {
        (init.headers as any)['Authorization'] = `Bearer ${refreshRes.access_token}`
      } else {
        init = { ...(init || {}), headers: { ...(init?.headers || {}), 'Authorization': `Bearer ${refreshRes.access_token}` } }
      }
      response = await fetch(input, init)
    } catch (e) {
      // refresh не удался, кидаем ошибку
      throw new Error('Не удалось обновить токен авторизации')
    }
  }
  return response
}

export const adminApi = {
  // Buildings
  async createBuilding(input: CreateBuildingInput): Promise<Building> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/buildings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    return await handleResponse<Building>(response)
  },

  async updateBuilding(buildingId: string, input: UpdateBuildingInput): Promise<Building> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/buildings/${buildingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    return handleResponse<Building>(response)
  },

  async deleteBuilding(buildingId: string): Promise<void> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/buildings/${buildingId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const error: AdminError = {
        message: `HTTP error! status: ${response.status}`,
        status: response.status
      }
      throw error
    }
  },

  // Objects
  async createObject(buildingId: string, floorId: string, input: CreateObjectInput): Promise<Object> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/buildings/${buildingId}/floors/${floorId}/objects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    return handleResponse<Object>(response)
  },

  async updateObject(buildingId: string, floorId: string, objectId: string, input: UpdateObjectInput): Promise<Object> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/buildings/${buildingId}/floors/${floorId}/objects/${objectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    return handleResponse<Object>(response)
  },

  async deleteObject(buildingId: string, floorId: string, objectId: string): Promise<void> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/buildings/${buildingId}/floors/${floorId}/objects/${objectId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const error: AdminError = {
        message: `HTTP error! status: ${response.status}`,
        status: response.status
      }
      throw error
    }
  },

  // Route
  async addIntersection(buildingId: string, input: AddIntersectionRequest): Promise<Intersection> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/buildings/${buildingId}/route/intersections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    return handleResponse<Intersection>(response)
  },

  async deleteIntersection(buildingId: string, intersectionId: string): Promise<void> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/buildings/${buildingId}/route/intersections/${intersectionId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const error: AdminError = {
        message: `HTTP error! status: ${response.status}`,
        status: response.status
      }
      throw error
    }
  },

  async addConnection(buildingId: string, input: Connection): Promise<Edge> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/buildings/${buildingId}/route/connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    return handleResponse<Edge>(response)
  },

  // Polygons
  async createPolygon(buildingId: string, floorId: string, label: string, zIndex: number): Promise<Polygon> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/buildings/${buildingId}/floors/${floorId}/poligons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label, z_index: zIndex }),
    })
    return handleResponse<Polygon>(response)
  },

  async addPolygonPoints(buildingId: string, floorId: string, polygonId: string, points: PolygonPointRequest[]): Promise<PolygonPointRequest[]> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/buildings/${buildingId}/floors/${floorId}/poligons/${polygonId}/points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(points),
    })
    return handleResponse<PolygonPointRequest[]>(response)
  },

  // Sync
  async syncData(data: SyncAllData): Promise<void> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error: AdminError = {
        message: `HTTP error! status: ${response.status}`,
        status: response.status
      }
      throw error
    }
  },

  async getSyncData(): Promise<SyncAllData> {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/sync`, {
      headers: {},
    })
    return handleResponse<SyncAllData>(response)
  },
} 