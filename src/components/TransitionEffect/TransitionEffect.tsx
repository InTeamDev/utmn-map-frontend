import React, { useEffect, useRef } from 'react';
import styles from './TransitionEffect.module.css';

interface TransitionEffectProps {
  onAnimationComplete: () => void;
}

const TransitionEffect: React.FC<TransitionEffectProps> = ({ onAnimationComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  interface Particle {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    size: number;
    speed: number;
    alpha: number;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Устанавливаем размер canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Создаем частицы
    const particles: Particle[] = [];
    const particleCount = 200;

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const targetX = Math.random() * canvas.width;
      const targetY = Math.random() * canvas.height;
      
      particles.push({
        x,
        y,
        targetX,
        targetY,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
        alpha: 1
      });
    }

    particlesRef.current = particles;

    let animationFrame: number;
    let startTime = Date.now();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / 1000, 1); // 1 секунда на анимацию

      let allParticlesReachedTarget = true;

      particles.forEach(particle => {
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        
        particle.x += dx * 0.05 * particle.speed;
        particle.y += dy * 0.05 * particle.speed;
        particle.alpha = Math.max(0, 1 - progress);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 123, 255, ${particle.alpha})`;
        ctx.fill();

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          allParticlesReachedTarget = false;
        }
      });

      if (progress >= 1 && allParticlesReachedTarget) {
        cancelAnimationFrame(animationFrame);
        onAnimationComplete();
      } else {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [onAnimationComplete]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default TransitionEffect; 