import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../services/soundFx';

/**
 * Authentic Deep-Space Astrophotography Background & Zero-G Physics.
 * Backed by genuine telescope long-exposure imagery (Milky Way dust, natural pinpoint stars, dark void).
 * Completely free of artificial twinkling stars, cartoon gradients, or synthetic "AI slop".
 * 
 * Selectable Atmosphere Modes:
 * - 'stargazing' / 'minimal': Clean, pure, serene telescope astrophotography void.
 * - 'meteor': Occasional realistic shooting star streaks slicing across deep space.
 * - 'nebula': Subtle dark indigo organic dust depth.
 */
export default function CosmicBackground({ 
  activeSector = 1,
  bgMode = 'stargazing' // 'stargazing' | 'nebula' | 'meteor' | 'minimal'
}) {
  const canvasRef = useRef(null);
  const astronautRef = useRef(null);
  const [isTapped, setIsTapped] = useState(false);

  const astronautState = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.72 : 800,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.22 : 250,
    vx: 0.65,
    vy: 0.35,
    angle: -14,
    spin: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let shootingStars = [];
    let lastShootingStarTime = 0;

    const maybeAddMeteor = (time) => {
      const interval = bgMode === 'meteor' ? 1800 : 7000;
      if (time - lastShootingStarTime > interval) {
        lastShootingStarTime = time;
        shootingStars.push({
          x: Math.random() * width * 0.85,
          y: Math.random() * height * 0.35,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 12 + 8,
          angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.2,
          life: 1,
          decay: 0.024
        });
      }
    };

    let tick = 0;

    const render = (time) => {
      tick += 0.008;

      // Only add shooting stars if meteors are active
      if (bgMode === 'meteor') {
        maybeAddMeteor(time);
      }

      // Clear canvas each frame so the authentic astrophotography photograph shines through completely clean
      ctx.clearRect(0, 0, width, height);

      // Render realistic shooting stars in meteor mode only
      if (bgMode === 'meteor') {
        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const ss = shootingStars[i];
          const tailX = ss.x - Math.cos(ss.angle) * ss.length;
          const tailY = ss.y - Math.sin(ss.angle) * ss.length;

          const sGrad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
          sGrad.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
          sGrad.addColorStop(0.35, `rgba(0, 240, 255, ${ss.life * 0.7})`);
          sGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

          ctx.strokeStyle = sGrad;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          ss.x += Math.cos(ss.angle) * ss.speed;
          ss.y += Math.sin(ss.angle) * ss.speed;
          ss.life -= ss.decay;

          if (ss.life <= 0) {
            shootingStars.splice(i, 1);
          }
        }
      }

      // Update Free-Floating Astronaut Zero-G Physics (Roaming smoothly across the background)
      const a = astronautState.current;
      a.x += a.vx;
      a.y += a.vy;

      // Buoyant zero-g swaying
      const swayY = Math.sin(tick * 2.2) * 5;
      const swayAngle = Math.sin(tick * 1.4) * 10;
      const currentAngle = a.angle + swayAngle + a.spin;

      if (Math.abs(a.spin) > 0.05) {
        a.spin *= 0.95;
      }

      // Soft boundary steering so astronaut wanders freely across the entire viewport
      const padX = 60;
      const padY = 50;
      if (a.x < padX) {
        a.vx = Math.abs(a.vx) * 0.96 + 0.1;
        a.angle = -8;
      } else if (a.x > width - padX - 80) {
        a.vx = -Math.abs(a.vx) * 0.96 - 0.1;
        a.angle = -22;
      }

      if (a.y < padY) {
        a.vy = Math.abs(a.vy) * 0.96 + 0.1;
      } else if (a.y > height - padY - 80) {
        a.vy = -Math.abs(a.vy) * 0.96 - 0.1;
      }

      // Subtle random steering drift
      if (Math.random() < 0.015) {
        a.vx += (Math.random() - 0.5) * 0.15;
        a.vy += (Math.random() - 0.5) * 0.15;
        const spd = Math.hypot(a.vx, a.vy);
        if (spd > 1.2) {
          a.vx = (a.vx / spd) * 1.2;
          a.vy = (a.vy / spd) * 1.2;
        } else if (spd < 0.35) {
          a.vx = (a.vx / (spd || 1)) * 0.5;
          a.vy = (a.vy / (spd || 1)) * 0.5;
        }
      }

      if (astronautRef.current) {
        astronautRef.current.style.transform = `translate3d(${a.x}px, ${a.y + swayY}px, 0px) rotate(${currentAngle}deg)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeSector, bgMode]);

  const handleAstronautBoost = (e) => {
    e.stopPropagation();
    soundFx.playPass();
    setIsTapped(true);
    const a = astronautState.current;
    a.vx = (Math.random() - 0.5) * 3.5;
    a.vy = (Math.random() - 0.5) * 3.5;
    a.spin = Math.random() > 0.5 ? 360 : -360;

    setTimeout(() => {
      setIsTapped(false);
    }, 2200);
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#030508]"
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(4, 6, 11, 0.25) 0%, rgba(3, 4, 7, 0.72) 100%), url('/backgrounds/deep_space_astrophotography.jpg')`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 60fps Deep Space Canvas (Clear of artificial twinkling dots) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* ================= FREE-FLOATING ZERO-G ASTRONAUT ROAMING FREELY ACROSS BACKGROUND ================= */}
      <div
        ref={astronautRef}
        onClick={handleAstronautBoost}
        className="absolute top-0 left-0 pointer-events-auto cursor-pointer will-change-transform z-10 group"
        style={{
          transform: 'translate3d(100px, 100px, 0px) rotate(-14deg)'
        }}
        title="Zero-G Astronaut • Click me for thruster burst!"
      >
        <div className="relative flex flex-col items-center">
          
          {/* ================= INTERACTIVE "YOU TAP ME!" BADGE STRICTLY ABOVE THE CHARACTER ================= */}
          <div className="absolute -top-10 flex flex-col items-center pointer-events-none whitespace-nowrap z-20">
            <div 
              className={`px-2.5 py-0.5 rounded-full bg-charcoal-950/95 border ${
                isTapped 
                  ? 'border-cosmic-amber text-cosmic-amber ring-2 ring-cosmic-amber/50 scale-110' 
                  : 'border-cosmic-cyan text-cosmic-cyan group-hover:border-cosmic-amber group-hover:text-cosmic-amber'
              } text-[8px] font-pixel shadow-[0_0_14px_rgba(0,240,255,0.45)] flex items-center gap-1 transition-all duration-200`}
            >
              <span>{isTapped ? '🚀 ZERO-G BOOST!' : 'YOU TAP ME!'}</span>
              <span className="text-[8px]">{isTapped ? '⚡' : '👆'}</span>
            </div>
            {/* Small downward arrowhead pointing directly to astronaut's helmet */}
            <div 
              className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] ${
                isTapped ? 'border-t-cosmic-amber' : 'border-t-cosmic-cyan group-hover:border-t-cosmic-amber'
              } transition-colors`}
            />
          </div>

          {/* Ambient Starlight Glow Aura */}
          <div className="absolute -inset-6 rounded-full bg-cosmic-cyan/15 blur-xl pointer-events-none group-hover:bg-cosmic-cyan/35 transition-colors animate-pulse-slow" />

          {/* Micro Space Tether Line */}
          <svg className="absolute -top-12 -right-8 w-20 h-20 pointer-events-none opacity-25">
            <path
              d="M 8 55 Q 28 25, 55 5"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
          </svg>

          {/* Pixel-Art Floating Astronaut Sprite */}
          <img
            src="/sprites/astronaut_floating.png"
            alt="Floating Astronaut"
            style={{ width: '64px', height: '64px', maxWidth: '64px', maxHeight: '64px' }}
            className="object-contain pixelated drop-shadow-[0_8px_24px_rgba(0,240,255,0.45)] group-hover:scale-110 transition-transform filter brightness-110"
          />

          {/* Subtle Zero-G Thruster Pulse */}
          <div className="absolute -bottom-1 -left-2 flex items-center gap-1 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-cosmic-cyan blur-[0.5px] animate-ping" />
          </div>

          {/* Telemetry Status Footer */}
          <div className="mt-1 px-1.5 py-0.2 rounded bg-charcoal-950/85 border border-charcoal-700 text-[7px] font-pixel text-slate-400 whitespace-nowrap shadow-sm opacity-60 group-hover:opacity-100 transition-opacity">
            DEEP-SPACE VOID
          </div>
        </div>
      </div>
    </div>
  );
}
