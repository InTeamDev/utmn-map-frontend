import React, { useEffect, useRef, useMemo } from 'react';
import styles from './TransitionEffect.module.css';

interface TransitionEffectProps {
  onAnimationComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  speed: number;
  alpha: number;
  vx: number;
  vy: number;
}

const TransitionEffect: React.FC<TransitionEffectProps> = ({ onAnimationComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const createParticles = useMemo(() => (width: number, height: number): Particle[] => {
    const particles: Particle[] = [];
    const particleCount = 50; // Уменьшаем количество частиц

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const targetX = Math.random() * width;
      const targetY = Math.random() * height;
      const angle = Math.atan2(targetY - y, targetX - x);
      const speed = Math.random() * 1.5 + 0.5;
      
      particles.push({
        x,
        y,
        targetX,
        targetY,
        size: Math.random() * 2 + 1, // Уменьшаем размер частиц
        speed,
        alpha: 1,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(pixelRatio, pixelRatio);

    particlesRef.current = createParticles(window.innerWidth, window.innerHeight);
    let startTime = performance.now();

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / 600, 1); // Уменьшаем время анимации

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let allParticlesComplete = true;

      for (const particle of particlesRef.current) {
        // Плавное движение с использованием velocity
        particle.x += particle.vx * (deltaTime / 16); // Нормализация для 60fps
        particle.y += particle.vy * (deltaTime / 16);
        particle.alpha = Math.max(0, 1 - progress);

        if (particle.alpha > 0) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 123, 255, ${particle.alpha})`;
          ctx.fill();
        }

        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          allParticlesComplete = false;
        }
      }

      if (progress >= 1 || allParticlesComplete) {
        cancelAnimationFrame(animationFrameRef.current!);
        onAnimationComplete();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [createParticles, onAnimationComplete]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default React.memo(TransitionEffect); 