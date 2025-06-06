import { Building } from './building';
import { Floor, FloorWithData } from './floor';

export type ObjectType = 
  | 'cabinet'      // Аудитория
  | 'department'   // Кафедра
  | 'man-toilet'   // Мужской туалет
  | 'woman-toilet' // Женский туалет
  | 'stair'        // Лестница
  | 'wardrobe'     // Гардероб
  | 'gym'          // Спортзал
  | 'cafe'         // Кафетерий
  | 'canteen'      // Столовая
  | 'chill-zone';  // Зона отдыха

// Маппинг ID типов объектов к их именам
export const OBJECT_TYPE_MAP: Record<number, ObjectType> = {
  1: 'cabinet',      // Аудитория
  2: 'department',   // Кафедра
  3: 'man-toilet',   // Мужской туалет
  4: 'woman-toilet', // Женский туалет
  5: 'stair',        // Лестница
  6: 'wardrobe',     // Гардероб
  7: 'gym',          // Спортзал
  8: 'cafe',         // Кафетерий
  9: 'canteen',      // Столовая
  10: 'chill-zone',  // Зона отдыха
};

// Обратный маппинг для получения ID по типу
export const OBJECT_TYPE_TO_ID: Record<ObjectType, number> = {
  'cabinet': 1,
  'department': 2,
  'man-toilet': 3,
  'woman-toilet': 4,
  'stair': 5,
  'wardrobe': 6,
  'gym': 7,
  'cafe': 8,
  'canteen': 9,
  'chill-zone': 10
};

// Функция для получения типа объекта по его ID
export function getObjectTypeById(id: number): ObjectType {
  const type = OBJECT_TYPE_MAP[id];
  if (!type) {
    throw new Error(`Unknown object type ID: ${id}`);
  }
  return type;
}

export interface ObjectTypeInfo {
  id: number;
  name: string;
  alias: string;
}

export interface Door {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  object_id: string;
}

export interface Object {
  id: string;
  name: string;
  alias: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  object_type_id: number;
  doors: Door[];
  floor: Floor;
}

export interface CreateObjectInput {
  id?: string;
  name: string;
  alias: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  object_type_id: number;
}

export interface UpdateObjectInput {
  name?: string;
  alias?: string;
  description?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  object_type_id?: number;
}

export interface GetObjectsResponse {
  objects: {
  building: Building;
  floors: FloorWithData[];
  }
}

export interface SearchResult {
  object_id: string;
  door_id: string;
  object_type_id: number;
  preview: string;
} 