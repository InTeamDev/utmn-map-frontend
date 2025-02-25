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
      // Если два пальца, начинаем масштабирование
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );
      setInitialDistance(distance);
    } else if (e.touches.length === 1) {
      // Если один палец, начинаем перемещение
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
      const newScale = (distance / initialDistance) * scaleRef.current;
      setScale(newScale);
      scaleRef.current = newScale;
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
