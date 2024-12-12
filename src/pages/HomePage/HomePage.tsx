import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import Dropdown from '../../components/DropDown/DropDown';
import ImageCard from '../../components/ImageCard/ImageCard';
import Button from '../../components/Button/Button';
import { api } from '../../services/api';

const HomePage: React.FC = () => {
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [currentFloor, setCurrentFloor] = useState('2');
  const [route, setRoute] = useState<string | null>(null);
  const [offices, setOffices] = useState<string[]>([]);

  const floorToPath = {
    '4': '/floors/4_этаж_шкн.svg',
    '3': '/floors/3_этаж_шкн.svg',
    '2': '/floors/2_этаж_шкн.svg',
    '1': '/floors/1_этаж_шкн.svg',
  };

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const objects = await api.getObjects();
        const processedOffices = objects
          .map(obj => {
            const match = obj.match(/Floor_(\w+)_Office_(\w+)/);
            if (!match) return null;
            
            const [_, floor, room] = match;
            
            // Skip IDK rooms
            if (room.startsWith('IDK')) return null;
            
            // Process special cases
            if (room.startsWith('Toilet')) {
              return `Туалет (${floor} этаж)`;
            }
            if (room.startsWith('Kitchen')) {
              return 'Столовая';
            }
            
            return room;
          })
          .filter((office): office is string => office !== null)
          .sort((a, b) => {
            // Convert to numbers for numerical sorting if possible
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return a.localeCompare(b);
          });

        setOffices(processedOffices);
      } catch (error) {
        console.error('Failed to fetch offices:', error);
      }
    };

    fetchOffices();
  }, []);

  const handleRouteCalculation = () => {
    if (from && to) {
      setRoute(`Маршрут от ${from} до ${to}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigationPanel}>
        <div className={styles.dropdownContainer}>
          <Dropdown
            options={offices}
            placeholder="Откуда?"
            onChange={(val) => setFrom(val)}
          />
          <Dropdown
            options={offices}
            placeholder="Куда?"
            onChange={(val) => setTo(val)}
          />
          <button 
            className={styles.findRouteButton}
            onClick={handleRouteCalculation}
            disabled={!from || !to}
          >
            Найти маршрут
          </button>
        </div>
        {route && <div className={styles.routeInfo}>{route}</div>}
      </div>
      <div className={styles.content}>
        <div className={styles.buttonContainer}>
          {Object.keys(floorToPath).reverse().map((text) => (
            <Button 
              key={text} 
              text={text} 
              isActive={currentFloor === text} 
              onClick={() => setCurrentFloor(text)}
            />
          ))}
        </div>
        <ImageCard
          src={floorToPath[currentFloor as keyof typeof floorToPath]}
          alt="Map Image"
        />
      </div>
    </div>
  );
};

export default HomePage;
