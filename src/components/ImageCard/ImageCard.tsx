import React, { useState, useRef, useEffect } from 'react';
import styles from './ImageCard.module.css';

interface ImageCardProps {
  src: string;
  alt: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [lastDistance, setLastDistance] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Обработчик для колесика мыши (десктоп)
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    const image = imageRef.current;
    if (!image) return;

    const rect = image.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(scale + delta, 1), 4);
    
    const scaleChange = newScale - scale;
    const newPosition = {
      x: position.x - (mouseX * scaleChange),
      y: position.y - (mouseY * scaleChange)
    };

    setScale(newScale);
    setPosition(newPosition);
  };

  // Обработчик для touch событий (мобильные устройства)
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setPanning(true);

    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getDistanceBetweenTouches(e.touches);
      setLastDistance(distance);
    } else if (e.touches.length === 1) {
      // Pan
      setStartPoint({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!panning) return;

    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getDistanceBetweenTouches(e.touches);
      if (lastDistance) {
        const delta = (distance - lastDistance) * 0.01;
        const newScale = Math.min(Math.max(scale + delta, 1), 4);
        setScale(newScale);
      }
      setLastDistance(distance);
    } else if (e.touches.length === 1) {
      // Pan
      setPosition({
        x: e.touches[0].clientX - startPoint.x,
        y: e.touches[0].clientY - startPoint.y
      });
    }
  };

  const handleTouchEnd = () => {
    setPanning(false);
    setLastDistance(null);
  };

  // Вспомогательная функция для вычисления расстояния между точками касания
  const getDistanceBetweenTouches = (touches: React.TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  };

  // Обработчики для мыши (десктоп)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setPanning(true);
    setStartPoint({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!panning) return;

    setPosition({
      x: e.clientX - startPoint.x,
      y: e.clientY - startPoint.y
    });
  };

  const handleMouseUp = () => {
    setPanning(false);
  };

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    image.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      image.removeEventListener('wheel', handleWheel);
    };
  }, [scale, position]);

  return (
    <div className={styles.imageWrapper}>
      <img
        ref={imageRef}
        className={styles.image}
        src={src}
        alt={alt}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

export default ImageCard;
