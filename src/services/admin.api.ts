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

export const adminApi = {
  // Buildings
  async createBuilding(input: CreateBuildingInput): Promise<Building> {
    const response = await fetch(`${API_BASE_URL}/api/buildings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(input),
    })
    const data = await handleResponse<Building>(response)
    console.log(data)
    return data
  },

  async updateBuilding(buildingId: string, input: UpdateBuildingInput): Promise<Building> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(input),
    })
    return handleResponse<Building>(response)
  },

  async deleteBuilding(buildingId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
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
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/floors/${floorId}/objects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(input),
    })
    return handleResponse<Object>(response)
  },

  async updateObject(buildingId: string, floorId: string, objectId: string, input: UpdateObjectInput): Promise<Object> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/floors/${floorId}/objects/${objectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(input),
    })
    return handleResponse<Object>(response)
  },

  async deleteObject(buildingId: string, floorId: string, objectId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/floors/${floorId}/objects/${objectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
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
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/route/intersections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(input),
    })
    return handleResponse<Intersection>(response)
  },

  async deleteIntersection(buildingId: string, intersectionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/route/intersections/${intersectionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
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
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/route/connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(input),
    })
    return handleResponse<Edge>(response)
  },

  // Polygons
  async createPolygon(buildingId: string, floorId: string, label: string, zIndex: number): Promise<Polygon> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/floors/${floorId}/poligons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({ label, z_index: zIndex }),
    })
    return handleResponse<Polygon>(response)
  },

  async addPolygonPoints(buildingId: string, floorId: string, polygonId: string, points: PolygonPointRequest[]): Promise<PolygonPointRequest[]> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/floors/${floorId}/poligons/${polygonId}/points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(points),
    })
    return handleResponse<PolygonPointRequest[]>(response)
  },

  // Sync
  async syncData(data: SyncAllData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
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
    const response = await fetch(`${API_BASE_URL}/api/sync`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    return handleResponse<SyncAllData>(response)
  },
} 