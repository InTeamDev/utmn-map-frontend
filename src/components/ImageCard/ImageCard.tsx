import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import styles from "./ImageCard.module.css";

interface ImageCardProps {
  src: string;
  alt: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const positionRef = useRef(position);
  const scaleRef = useRef(scale);

  useEffect(() => {
    positionRef.current = position;
    scaleRef.current = scale;
  }, [position, scale]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Начало жеста масштабирования
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );
      setInitialDistance(distance);
      setInitialScale(scaleRef.current); // Запоминаем текущий масштаб
    } else if (e.touches.length === 1) {
      // Начало перемещения
      const touch = e.touches[0];
      setPanning(true);
      setStartPoint({
        x: touch.clientX - positionRef.current.x,
        y: touch.clientY - positionRef.current.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance !== null) {
      // Масштабирование
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );

      // Вычисляем новый масштаб
      const newScale = (distance / initialDistance) * initialScale;
      const clampedScale = Math.min(Math.max(newScale, 1), 4); // Ограничиваем масштаб

      // Вычисляем центр между двумя пальцами
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      // Корректируем позицию изображения относительно центра масштабирования
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const relativeX =
        (centerX - wrapperRect.left - positionRef.current.x) / scaleRef.current;
      const relativeY =
        (centerY - wrapperRect.top - positionRef.current.y) / scaleRef.current;

      const newPosition = {
        x: centerX - wrapperRect.left - relativeX * clampedScale,
        y: centerY - wrapperRect.top - relativeY * clampedScale,
      };

      // Обновляем состояние
      setScale(clampedScale);
      setPosition(newPosition);
      scaleRef.current = clampedScale;
      positionRef.current = newPosition;

      // Применяем трансформацию
      if (imageRef.current) {
        imageRef.current.style.transform = `translate(${newPosition.x}px, ${newPosition.y}px) scale(${clampedScale})`;
      }
    } else if (e.touches.length === 1 && panning) {
      // Перемещение
      const touch = e.touches[0];
      const newPosition = {
        x: touch.clientX - startPoint.x,
        y: touch.clientY - startPoint.y,
      };

      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        if (imageRef.current) {
          imageRef.current.style.transform =
            `translate(${newPosition.x}px, ` +
            `${newPosition.y}px) scale(${scaleRef.current})`;
        }
        setPosition(newPosition);
        positionRef.current = newPosition;
      });
    }
  };

  const handleTouchEnd = () => {
    setPanning(false);
    setInitialDistance(null);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const wrapper = wrapperRef.current;
    const image = imageRef.current;
    if (!wrapper || !image) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const mouseX = e.clientX - wrapperRect.left;
    const mouseY = e.clientY - wrapperRect.top;

    const relativeX = (mouseX - positionRef.current.x) / scaleRef.current;
    const relativeY = (mouseY - positionRef.current.y) / scaleRef.current;

    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(scaleRef.current + delta, 1), 4);

    const newPosition = {
      x: mouseX - relativeX * newScale,
      y: mouseY - relativeY * newScale,
    };

    setPosition(newPosition);
    setScale(newScale);
    positionRef.current = newPosition;
    scaleRef.current = newScale;

    if (imageRef.current) {
      imageRef.current.style.transform = `translate(${newPosition.x}px, ${newPosition.y}px) scale(${newScale})`;
    }
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      wrapper.removeEventListener("wheel", handleWheel);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [handleWheel]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!panning) return;

      const newPosition = {
        x: e.clientX - startPoint.x,
        y: e.clientY - startPoint.y,
      };

      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        if (imageRef.current) {
          imageRef.current.style.transform =
            `translate(${newPosition.x}px, ` +
            `${newPosition.y}px) scale(${scaleRef.current})`;
        }
        setPosition(newPosition);
        positionRef.current = newPosition;
      });
    },
    [panning, startPoint],
  );

  return (
    <div ref={wrapperRef} className={styles.imageWrapper}>
      <img
        ref={imageRef}
        className={styles.image}
        src={src}
        alt={alt}
        style={{
          willChange: "transform",
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          setPanning(true);
          setStartPoint({
            x: e.clientX - positionRef.current.x,
            y: e.clientY - positionRef.current.y,
          });
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setPanning(false)}
        onMouseLeave={() => setPanning(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

export default memo(ImageCard);
