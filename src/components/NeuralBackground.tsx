
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface NeuralBackgroundProps {
  className?: string;
  particleCount?: number;
  connectionDistance?: number;
  mouseConnectionDistance?: number;
  baseSpeed?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

const NeuralBackground: React.FC<NeuralBackgroundProps> = ({
  className = '',
  particleCount = 100,
  connectionDistance = 150,
  mouseConnectionDistance = 180,
  baseSpeed = 0.6,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const animationRef = useRef<number>();
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    // Inicializar partículas
    const initParticles = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * baseSpeed,
          vy: (Math.random() - 0.5) * baseSpeed,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    // Animação
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = theme === 'dark';
      
      // Cores adaptativas ao tema (como no HTML original)
      const particleColor = isDark ? '200, 220, 255' : '30, 64, 175';
      const lineColor = isDark ? '255, 255, 255' : '37, 99, 235';
      const lineOpacityFactor = isDark ? 0.15 : 0.1;

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Atualizar posição
        p.x += p.vx;
        p.y += p.vy;

        // Bounce nas bordas
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Desenhar partícula
        ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Conexões entre partículas
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = 1 - dist / connectionDistance;
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity * lineOpacityFactor})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Conexão com o mouse (gradiente azul → coral como no original)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseConnectionDistance) {
            const opacity = 1 - dist / mouseConnectionDistance;

            // Gradiente azul → coral (como no HTML original)
            const gradient = ctx.createLinearGradient(p.x, p.y, mouse.x, mouse.y);
            
            const startColor = isDark ? 'rgba(37, 99, 235,' : 'rgba(30, 64, 175,';
            const endColor = isDark ? 'rgba(255, 107, 107,' : 'rgba(220, 38, 38,';

            gradient.addColorStop(0, startColor + opacity + ')');
            gradient.addColorStop(1, endColor + opacity + ')');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Event handlers globais (como no HTML original)
    const handleResize = () => {
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    // Setup
    initParticles();
    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, [theme, particleCount, connectionDistance, mouseConnectionDistance, baseSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default NeuralBackground;
