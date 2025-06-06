export type NodeType = 'intersection' | 'door';

export interface Node {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  floor_id: string;
}

export interface Edge {
  from_id: string;
  to_id: string;
  weight: number;
}

export interface Connection {
  from_id: string;
  to_id: string;
  weight: number;
}

export interface Intersection {
  id: string;
  x: number;
  y: number;
  floor_id: string;
}

export interface BuildRouteRequest {
  start_node_id: string;
  end_node_id: string;
  waypoints?: string[];
} 