import React, { useState } from 'react';
import styles from './HomePage.module.css';
import Dropdown from '../../components/DropDown/DropDown';
import ImageCard from '../../components/ImageCard/ImageCard';
import Button from '../../components/Button/Button';

const HomePage: React.FC = () => {
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [currentFloor, setCurrentFloor] = useState('2');
  const [route, setRoute] = useState<string | null>(null);

  const floorToPath = {
    '4': '/floors/4_этаж_шкн.svg',
    '3': '/floors/3_этаж_шкн.svg',
    '2': '/floors/2_этаж_шкн.svg',
    '1': '/floors/1_этаж_шкн.svg',
  };

  const handleRouteCalculation = () => {
    if (from && to) {
      // Здесь будет логика расчета маршрута
      setRoute(`Маршрут от ${from} до ${to}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigationPanel}>
        <div className={styles.dropdownContainer}>
          <Dropdown
            options={['401', '402', '403']}
            placeholder="Откуда?"
            onChange={(val) => setFrom(val)}
          />
          <Dropdown
            options={['401', '402', '403']}
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
