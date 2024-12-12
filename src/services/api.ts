const API_BASE_URL = "http://localhost:8000";

export interface RouteResponse {
  path: string[];
  distance: number;
}

export const api = {
  async getFloorPlan(floor: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/floor-plan/${floor}`);
    if (!response.ok) throw new Error("Failed to fetch floor plan");
    return response.blob();
  },

  async getObjects(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/objects`);
    if (!response.ok) throw new Error("Failed to fetch objects");
    return response.json();
  },

  async findRoute(
    officeAId: string,
    officeBId: string,
    topK: number = 3
  ): Promise<RouteResponse[]> {
    const response = await fetch(
      `${API_BASE_URL}/route?office_a_id=${officeAId}&office_b_id=${officeBId}&top_k=${topK}`
    );
    if (!response.ok) throw new Error("Failed to fetch route");
    return response.json();
  },
};
