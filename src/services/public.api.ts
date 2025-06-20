import { Building, BuildingsResponse } from './interfaces/building'
import { Floor } from './interfaces/floor'
import { Door, GetObjectsResponse, Object, ObjectTypeInfo, SearchResult } from './interfaces/object'
import { BuildRouteRequest, Connection, Intersection, Node } from './interfaces/route'

declare const process: {
  env: {
    REACT_APP_PUBLIC_API: string
  }
}

const API_BASE_URL = process.env.REACT_APP_PUBLIC_API

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export const api = {
  async getBuildings(): Promise<BuildingsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/buildings`)
    const data = await handleResponse<BuildingsResponse>(response)
    return data
  },

  async getBuilding(buildingId: string): Promise<Building> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}`)
    return handleResponse<Building>(response)
  },

  async getFloors(buildingId: string): Promise<{ floors: Floor[] }> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/floors`)
    const data = await handleResponse<{ floors: Floor[] }>(response)
    return data
  },

  async getObjects(buildingId: string): Promise<GetObjectsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/objects`)
    const data = await handleResponse<GetObjectsResponse>(response)
    return data
  },

  async getObject(buildingId: string, objectId: string): Promise<Object> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/objects/${objectId}`)
    return handleResponse<Object>(response)
  },

  async getDoors(buildingId: string): Promise<{ doors: Door[] }> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/doors`)
    return handleResponse<{ doors: Door[] }>(response)
  },

  async getIntersections(buildingId: string): Promise<{ intersections: Intersection[] }> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/intersections`)
    return handleResponse<{ intersections: Intersection[] }>(response)
  },

  async getConnections(buildingId: string): Promise<{ connections: Connection[] }> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/connections`)
    return handleResponse<{ connections: Connection[] }>(response)
  },

  async getGraphNodes(buildingId: string): Promise<{ nodes: Node[] }> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/graph/nodes`)
    return handleResponse<{ nodes: Node[] }>(response)
  },

  async buildRoute(buildingId: string, request: BuildRouteRequest): Promise<{ route: Connection[] }> {
    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    return handleResponse<{ route: Connection[] }>(response)
  },

  async search(buildingId: string, query?: string, categories?: string[]): Promise<{ results: SearchResult[] }> {
    const params = new URLSearchParams()
    if (query) params.append('query', query)
    if (categories) categories.forEach((cat) => params.append('category', cat))

    const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/search?${params.toString()}`)
    return handleResponse<{ results: SearchResult[] }>(response)
  },

  async getCategories(): Promise<{ categories: ObjectTypeInfo[] }> {
    const response = await fetch(`${API_BASE_URL}/api/categories`)
    const data = await handleResponse<{ categories: ObjectTypeInfo[] }>(response)
    return data
  },
}
