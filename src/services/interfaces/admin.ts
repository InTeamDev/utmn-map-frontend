import { FloorWithData } from "./floor";
// Base types
export type ObjectType = 'cabinet' | 'department' | 'man-toilet' | 'woman-toilet' | 'stair' | 'wardrobe' | 'gym' | 'cafe' | 'canteen' | 'chill-zone'
export type NodeType = 'intersection' | 'door'

// Building related interfaces
export interface Building {
  id: string
  name: string
  address: string
}

export interface CreateBuildingInput {
  name: string
  address: string
}

export interface UpdateBuildingInput {
  name?: string
  address?: string
}

// Floor related interfaces
export interface Floor {
  id: string
  name: string
  alias: string
}

// Object related interfaces
export interface ObjectTypeInfo {
  id: number
  name: string
  alias: string
}

export interface Door {
  id: string
  x: number
  y: number
  width: number
  height: number
  object_id: string
}

export interface Object {
  id: string
  name: string
  alias: string
  description: string
  x: number
  y: number
  width: number
  height: number
  object_type_id: number
  doors: Door[]
  floor: Floor
}

export interface CreateObjectInput {
  id?: string
  name: string
  alias: string
  description: string
  x: number
  y: number
  width: number
  height: number
  object_type_id: number
}

export interface UpdateObjectInput {
  name?: string
  alias?: string
  description?: string
  x?: number
  y?: number
  width?: number
  height?: number
  object_type_id?: number
}

// Route related interfaces
export interface Intersection {
  id: string
  x: number
  y: number
  floor_id: string
}

export interface Connection {
  from_id: string
  to_id: string
  weight: number
}

export interface Edge {
  from_id: string
  to_id: string
  weight: number
}

export interface Node {
  id: string
  x: number
  y: number
  type: NodeType
  floor_id: string
}

export interface AddIntersectionRequest {
  id: string
  x: number
  y: number
  floor_id: string
}

// Polygon related interfaces
export interface PolygonPoint {
  polygon_id: string
  order: number
  x: number
  y: number
}

export interface Polygon {
  id: string
  floor_id: string
  label: string
  z_index: number
  points: PolygonPoint[]
}

export interface PolygonPointRequest {
  point_order: number
  x: number
  y: number
}

// Sync related interfaces
export interface SyncFloors {
  id: string
  name: string
  alias: string
  building_id: string
  objects: Object[]
  doors: Door[]
  floor_polygons: Polygon[]
  intersections: Intersection[]
  connections: Connection[]
}

export interface SyncBuildings {
  id: string
  name: string
  address: string
  floors: SyncFloors[]
}

export interface SyncAllData {
  object_types: ObjectTypeInfo[]
  buildings: SyncBuildings[]
}

// Response interfaces
export interface GetObjectsResponse {
  building: Building
  floors: FloorWithData[]
}

export interface GetDoorsResponse {
  id: string
  x: number
  y: number
  width: number
  height: number
  object_id: string
}

// Error interface
export interface AdminError {
  message: string
  status: number
} 