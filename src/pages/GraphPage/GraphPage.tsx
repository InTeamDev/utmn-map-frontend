import React, { useEffect, useState } from 'react';
import { api } from '../../services/public.api';
import { Building } from '../../services/interfaces/building';
import { Node, Connection } from '../../services/interfaces/route';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const sphereColor = '#1976d2';
const lineColor = '#ff9800';

const Graph3D = ({ nodes, connections }: { nodes: Node[]; connections: Connection[] }) => {
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

  return (
    <Canvas camera={{ position: [0, 0, 100], fov: 60, near: 0.1, far: 5000 }} style={{ height: 600, background: '#f5f5f5' }}>
      <primitive object={new THREE.AmbientLight(0xffffff, 0.7)} />
      <primitive object={new THREE.PointLight(0xffffff, 0.8)} position={[100, 100, 100]} />
      {/* Диагностический куб в центре */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5, 5, 5]} />
        <meshStandardMaterial color={0x00ff00} />
      </mesh>
      {/* Вершины */}
      {nodes.map((node) => {
        console.log('render node', node);
        return (
          <mesh key={node.id} position={[node.x - center.x, node.y - center.y, (node.type === 'door' ? 10 : 0)]}>
            <sphereGeometry args={[5, 24, 24]} />
            <meshStandardMaterial color={0xff0000} />
          </mesh>
        );
      })}
      {/* Связи */}
      {connections.map((conn, idx) => {
        const from = nodeMap.get(conn.from_id);
        const to = nodeMap.get(conn.to_id);
        if (!from || !to) return null;
        // Создаём geometry через useMemo
        const geometry = React.useMemo(() => {
          const points = [
            new THREE.Vector3(from.x - center.x, from.y - center.y, from.type === 'door' ? 10 : 0),
            new THREE.Vector3(to.x - center.x, to.y - center.y, to.type === 'door' ? 10 : 0),
          ];
          return new THREE.BufferGeometry().setFromPoints(points);
        }, [from, to, center]);
        return (
          <line key={idx}>
            <primitive object={geometry} attach="geometry" />
            <primitive object={new THREE.LineBasicMaterial({ color: 0xff9800 })} />
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
    ])
      .then(([nodesRes, connRes]) => {
        setNodes(nodesRes.nodes);
        setConnections(connRes.connections);
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
      {/* Диагностика: вывод координат узлов */}
      {nodes.length > 0 && (
        <div style={{ maxHeight: 120, overflow: 'auto', fontSize: 12, background: '#eee', marginBottom: 8 }}>
          <b>Координаты узлов:</b>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {nodes.map((n) => (
              <li key={n.id}>{n.id}: x={n.x}, y={n.y}, type={n.type}</li>
            ))}
          </ul>
        </div>
      )}
      {loading && <div>Загрузка...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && nodes.length > 0 && connections.length > 0 && (
        <Graph3D nodes={nodes} connections={connections} />
      )}
      {!loading && !error && selectedBuilding && nodes.length === 0 && (
        <div>Нет данных для отображения.</div>
      )}
    </div>
  );
};

export default GraphPage; 