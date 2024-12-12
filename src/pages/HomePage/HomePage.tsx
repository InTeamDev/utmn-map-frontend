import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import Dropdown from '../../components/DropDown/DropDown';
import ImageCard from '../../components/ImageCard/ImageCard';
import Button from '../../components/Button/Button';
import { api } from '../../services/api';
import TransitionEffect from '../../components/TransitionEffect/TransitionEffect';

const HomePage: React.FC = () => {
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [currentFloor, setCurrentFloor] = useState('Floor_Second');
  const [route, setRoute] = useState<string | null>(null);
  const [offices, setOffices] = useState<string[]>([]);
  const [floorImage, setFloorImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const floors = {
    'Floor_Fourth': '4',
    'Floor_Third': '3',
    'Floor_Second': '2',
    'Floor_First': '1',
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

  const handleFloorChange = async (floor: string) => {
    if (floor === currentFloor) return;
    
    setIsTransitioning(true);
    
    try {
      const blob = await api.getFloorPlan(floor);
      const url = URL.createObjectURL(blob);
      
      if (floorImage) {
        URL.revokeObjectURL(floorImage);
      }
      
      setFloorImage(url);
      setCurrentFloor(floor);
    } catch (error) {
      console.error('Failed to fetch floor plan:', error);
    }
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
  };

  // Очистка URL при размонтировании
  useEffect(() => {
    return () => {
      if (floorImage) URL.revokeObjectURL(floorImage);
    };
  }, [floorImage]);

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
          {Object.entries(floors).reverse().map(([apiFloor, displayText]) => (
            <Button 
              key={apiFloor}
              text={displayText}
              isActive={currentFloor === apiFloor}
              onClick={() => handleFloorChange(apiFloor)}
            />
          ))}
        </div>
        {floorImage && (
          <ImageCard
            src={floorImage}
            alt="Floor Plan"
          />
        )}
        {isTransitioning && (
          <TransitionEffect onAnimationComplete={handleTransitionComplete} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
