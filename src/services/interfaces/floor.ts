import { Object } from "./object";

export interface Floor {
  id: string;
  name: string;
  alias: string;
}

export interface BackgroundPoint {
  order: number;
  x: number;
  y: number;
}

export interface FloorBackgroundElement {
  id: string;
  label: string;
  z_index: number;
  points: BackgroundPoint[];
}

export interface FloorWithData {
  floor: Floor;
  objects: Object[];
  background: FloorBackgroundElement[];
} 