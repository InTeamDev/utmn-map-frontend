export interface Building {
  id: string;
  name: string;
  address: string;
}

export interface CreateBuildingInput {
  id: string;
  name: string;
  address: string;
}

export interface UpdateBuildingInput {
  name?: string;
  address?: string;
}

export interface BuildingsResponse {
  buildings: Building[];
} 