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
  const [currentFloor, setCurrentFloor] = useState('Floor_First');
  const [route, setRoute] = useState<string | null>(null);
  const [locations, setLocations] = useState<{ [key: string]: string }>({});
  const [floorImage, setFloorImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const floors = {
    'Floor_Fourth': '4',
    'Floor_Third': '3',
    'Floor_Second': '2',
    'Floor_First': '1',
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Загружаем план первого этажа
        const blob = await api.getFloorPlan('Floor_First');
        const url = URL.createObjectURL(blob);
        setFloorImage(url);

        // Загружаем список локаций
        const locationsData = await api.getObjects();
        setLocations(locationsData);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    initializeData();
  }, []);

  const getLocationOptions = () => {
    return Object.entries(locations)
      .filter(([key]) => {
        return !key.includes('IDK') && !key.includes('Stairs');
      })
      .map(([key, value]) => {
        const floor = key.split('_')[1];
        
        // Заменяем специальные названия
        let label = value
          .replace(/Toilet[^(]*/g, 'Туалет') // Заменяем Toilet и всё после него до скобок на "Туалет"
          .replace('Gym', 'Спортзал')
          .replace('Kitchen', 'Кухня')
          .replace('Dining', 'Столовая')
          .replace('Wardrobe', 'Гардероб')
          .replace('First', '1')
          .replace('Second', '2')
          .replace('Third', '3')
          .replace('Fourth', '4');

        return {
          value: key,
          label,
          floor: parseInt(floor === 'First' ? '1' : 
                         floor === 'Second' ? '2' : 
                         floor === 'Third' ? '3' : '4')
        };
      })
      .sort((a, b) => {
        if (a.floor !== b.floor) {
          return a.floor - b.floor;
        }
        
        const numA = parseInt(a.label.match(/\d+/)?.[0] || '');
        const numB = parseInt(b.label.match(/\d+/)?.[0] || '');
        
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        
        return a.label.localeCompare(b.label);
      });
  };

  useEffect(() => {
    const updateRoute = async () => {
      try {
        const blob = await api.getFloorPlan(
          currentFloor, 
          from || undefined, 
          to || undefined
        );
        const url = URL.createObjectURL(blob);
        
        if (floorImage) {
          URL.revokeObjectURL(floorImage);
        }
        
        setFloorImage(url);
        if (from && to) {
          setRoute(`Маршрут от ${locations[from]} до ${locations[to]}`);
        } else {
          setRoute(null);
        }
      } catch (error) {
        console.error('Failed to update route:', error);
      }
    };

    updateRoute();
  }, [from, to, currentFloor, locations]);

  const handleFloorChange = async (floor: string) => {
    if (floor === currentFloor) return;
    
    setIsTransitioning(true);
    
    try {
      const blob = await api.getFloorPlan(
        floor, 
        from || undefined, 
        to || undefined
      );
      const url = URL.createObjectURL(blob);
      
      if (floorImage) {
        URL.revokeObjectURL(floorImage);
      }
      
      setFloorImage(url);
      setCurrentFloor(floor);
    } catch (error) {
      console.error('Failed to fetch floor plan:', error);
    } finally {
      setIsTransitioning(false);
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
            options={getLocationOptions()}
            placeholder="Откуда?"
            onChange={(val) => setFrom(val)}
          />
          <Dropdown
            options={getLocationOptions()}
            placeholder="Куда?"
            onChange={(val) => setTo(val)}
          />
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
