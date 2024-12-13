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
  const [lastDistance, setLastDistance] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<number>();
  const positionRef = useRef(position);
  const scaleRef = useRef(scale);

  // Обновляем refs при изменении состояния
  useEffect(() => {
    positionRef.current = position;
    scaleRef.current = scale;
  }, [position, scale]);

  const updateTransform = useCallback(() => {
    if (imageRef.current) {
      imageRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) scale(${scaleRef.current})`;
    }
  }, []);

  const scheduleUpdate = useCallback(
    (newPosition?: { x: number; y: number }, newScale?: number) => {
      if (newPosition) positionRef.current = newPosition;
      if (newScale !== undefined) scaleRef.current = newScale;

      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        updateTransform();
        setPosition(positionRef.current);
        if (newScale !== undefined) setScale(newScale);
      });
    },
    [updateTransform],
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const image = imageRef.current;
      if (!image) return;

      const rect = image.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(scaleRef.current + delta, 1), 4);

      const scaleChange = newScale - scaleRef.current;
      const newPosition = {
        x: positionRef.current.x - mouseX * scaleChange,
        y: positionRef.current.y - mouseY * scaleChange,
      };

      scheduleUpdate(newPosition, newScale);
    },
    [scheduleUpdate],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!panning) return;

      const newPosition = {
        x: e.clientX - startPoint.x,
        y: e.clientY - startPoint.y,
      };

      scheduleUpdate(newPosition);
    },
    [panning, startPoint, scheduleUpdate],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!panning) return;

      if (e.touches.length === 2 && lastDistance !== null) {
        const distance = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY,
        );

        const delta = (distance - lastDistance) * 0.01;
        const newScale = Math.min(Math.max(scaleRef.current + delta, 1), 4);

        scheduleUpdate(undefined, newScale);
        setLastDistance(distance);
      } else if (e.touches.length === 1) {
        scheduleUpdate({
          x: e.touches[0].clientX - startPoint.x,
          y: e.touches[0].clientY - startPoint.y,
        });
      }
    },
    [panning, lastDistance, startPoint, scheduleUpdate],
  );

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    image.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      image.removeEventListener("wheel", handleWheel);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [handleWheel]);

  return (
    <div className={styles.imageWrapper}>
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
        onTouchStart={(e) => {
          e.preventDefault();
          setPanning(true);
          if (e.touches.length === 2) {
            setLastDistance(
              Math.hypot(
                e.touches[1].clientX - e.touches[0].clientX,
                e.touches[1].clientY - e.touches[0].clientY,
              ),
            );
          } else if (e.touches.length === 1) {
            setStartPoint({
              x: e.touches[0].clientX - positionRef.current.x,
              y: e.touches[0].clientY - positionRef.current.y,
            });
          }
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          setPanning(false);
          setLastDistance(null);
        }}
      />
    </div>
  );
};

export default memo(ImageCard);
