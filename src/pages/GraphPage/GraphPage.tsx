import React, { useEffect, useState } from 'react';
import { api } from '../../services/public.api';
import { Building } from '../../services/interfaces/building';
import { Node, Connection } from '../../services/interfaces/route';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const sphereColor = '#1976d2';
const lineColor = '#ff9800';

const Graph3D = ({ nodes, connections, objects, floors }: { nodes: Node[]; connections: Connection[]; objects: any[]; floors: any[] }) => {
  // Преобразуем массив узлов в Map для быстрого доступа по id
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, Node>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Центрирование графа
  const center = React.useMemo(() => {
    if (nodes.length === 0) return { x: 0, y: 0 };
    let minX = nodes[0].x, maxX = nodes[0].x, minY = nodes[0].y, maxY = nodes[0].y;
    nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    };
  }, [nodes]);

  // --- Новый floorOrder на основе floors ---
  // Функция для извлечения номера этажа из name или alias
  function extractFloorNumber(floor: any): number {
    // Пробуем найти число в name или alias
    const str = floor.name || floor.alias || '';
    const match = str.match(/\d+/);
    if (match) return parseInt(match[0], 10);
    // Попытка по ключевым словам (First, Second, ...)
    if (/first/i.test(str)) return 1;
    if (/second/i.test(str)) return 2;
    if (/third/i.test(str)) return 3;
    if (/fourth/i.test(str)) return 4;
    return 0; // если не найдено
  }
  const floorOrder = React.useMemo(() => {
    // floors уже отсортированы по номеру этажа
    return floors.reduce((acc: Record<string, number>, floor: any, idx: number) => {
      acc[floor.id] = idx;
      return acc;
    }, {});
  }, [floors]);
  const FLOOR_GAP = 100;

  // Вспомогательная функция для поиска имени объекта по node типа 'door'
  function getObjectNameByDoorNode(node: Node): string | null {
    if (node.type !== 'door') return null;
    // Найти door с таким id среди всех объектов
    for (const obj of objects) {
      if (obj.doors && Array.isArray(obj.doors)) {
        if (obj.doors.some((d: any) => d.id === node.id)) {
          return obj.name;
        }
      }
    }
    return null;
  }

  return (
    <Canvas camera={{ position: [0, 0, 100], fov: 60, near: 0.1, far: 5000 }} style={{ width: '100vw', height: '100vh', background: '#f5f5f5', display: 'block' }}>
      <primitive object={new THREE.AmbientLight(0xffffff, 0.7)} />
      <primitive object={new THREE.PointLight(0xffffff, 0.8)} position={[100, 100, 100]} />
      {/* Диагностический куб в центре */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5, 5, 5]} />
        <meshStandardMaterial color={0x00ff00} />
      </mesh>
      {/* Вершины */}
      {nodes.map((node) => {
        const floorIdx = floorOrder[node.floor_id] ?? 0;
        const z = (node.type === 'door' ? 10 : 0) + floorIdx * FLOOR_GAP;
        const pos: [number, number, number] = [node.x - center.x, node.y - center.y, z];
        const objectName = getObjectNameByDoorNode(node);
        return (
          <group key={node.id} position={pos}>
            <mesh>
              <sphereGeometry args={[5, 24, 24]} />
              <meshStandardMaterial color={0xff0000} />
            </mesh>
            {objectName && (
              <Html center position={[0, 10, 0]} style={{ pointerEvents: 'none', userSelect: 'none', fontSize: 10, color: '#000', textAlign: 'center', width: 40, fontWeight: 600 }}>
                {objectName}
              </Html>
            )}
          </group>
        );
      })}
      {/* Связи */}
      {connections.map((conn, idx) => {
        const from = nodeMap.get(conn.from_id);
        const to = nodeMap.get(conn.to_id);
        if (!from || !to) return null;
        const fromFloorIdx = floorOrder[from.floor_id] ?? 0;
        const toFloorIdx = floorOrder[to.floor_id] ?? 0;
        const fromZ = (from.type === 'door' ? 10 : 0) + fromFloorIdx * FLOOR_GAP;
        const toZ = (to.type === 'door' ? 10 : 0) + toFloorIdx * FLOOR_GAP;
        const geometry = React.useMemo(() => {
          const points = [
            new THREE.Vector3(from.x - center.x, from.y - center.y, fromZ),
            new THREE.Vector3(to.x - center.x, to.y - center.y, toZ),
          ];
          return new THREE.BufferGeometry().setFromPoints(points);
        }, [from, to, center, fromZ, toZ]);
        return (
          <line key={idx}>
            <primitive object={geometry} attach="geometry" />
            <primitive object={new THREE.LineBasicMaterial({ color: 0xff9800, linewidth: 10 })} />
          </line>
        );
      })}
      <OrbitControls minDistance={20} maxDistance={2000} />
    </Canvas>
  );
};

const GraphPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [objects, setObjects] = useState<any[]>([]); // типизировать при необходимости
  const [floors, setFloors] = useState<any[]>([]); // Новый стейт для этажей
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getBuildings().then((res) => setBuildings(res.buildings));
  }, []);

  useEffect(() => {
    if (!selectedBuilding) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.getGraphNodes(selectedBuilding),
      api.getConnections(selectedBuilding),
      api.getObjects(selectedBuilding),
      api.getFloors(selectedBuilding), // Новый запрос этажей
    ])
      .then(([nodesRes, connRes, objectsRes, floorsRes]) => {
        setNodes(nodesRes.nodes);
        setConnections(connRes.connections);
        // Собираем все объекты всех этажей в один массив
        const allObjects = objectsRes.objects.floors.flatMap((f: any) => f.objects);
        setObjects(allObjects);
        // Сортируем этажи по номеру
        const sortedFloors = [...floorsRes.floors].sort((a, b) => {
          // Используем ту же функцию, что и в Graph3D
          function extract(f: any) {
            const str = f.name || f.alias || '';
            const match = str.match(/\d+/);
            if (match) return parseInt(match[0], 10);
            if (/first/i.test(str)) return 1;
            if (/second/i.test(str)) return 2;
            if (/third/i.test(str)) return 3;
            if (/fourth/i.test(str)) return 4;
            return 0;
          }
          return extract(a) - extract(b);
        });
        setFloors(sortedFloors);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedBuilding]);

  return (
    <div>
      <h1>3D Граф связей строения</h1>
      <div style={{ marginBottom: 16 }}>
        <label>
          Выберите строение:{' '}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
          >
            <option value="">-- выберите --</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && nodes.length > 0 && connections.length > 0 && (
        <Graph3D nodes={nodes} connections={connections} objects={objects} floors={floors} />
      )}
      {!loading && !error && selectedBuilding && nodes.length === 0 && (
        <div>Нет данных для отображения.</div>
      )}
    </div>
  );
};

export default GraphPage; 