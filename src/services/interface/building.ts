export interface BuildingsResponse {
  buildings: Building[]
}

export interface Building {
  id: string
  name: string
  address: string
}
