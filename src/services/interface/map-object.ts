export interface Point {
  x: number
  y: number
}

export interface Polygon {
  id: string
  name?: string
  points: Point[]
}

export interface Door {
  id: string
  x: number
  y: number
  width: number
  height: number
  angle?: number
}

export interface FloorInfo {
  id: string
  name: string
  alias: string
}

export interface MapObject {
  id: string
  name: string
  alias: string
  description: string
  x: number
  y: number
  width: number
  height: number
  object_type: string
  doors: Door[] | null
  floor: FloorInfo
}

export interface Floor {
  floor: FloorInfo
  background: Polygon[] // ← новое поле
  objects: MapObject[]
}

export interface BuildingData {
  objects: {
    building: {
      id: string
      name: string
      address: string
    }
    floors: Floor[]
  }
}
