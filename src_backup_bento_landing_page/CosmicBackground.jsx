import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../services/soundFx';

/**
 * Premium Dark-Mode Canvas Engine:
 * - Deep midnight blue (#050b1a -> #020617) to pitch-black (#000000).
 * - Clean, subtle star field made of tiny, crisp white pinprick dots.
 * - Periodic ultra-thin, sharp white lines simulating realistic shooting stars (< 0.7s lifetime).
 * - Zero blurry purple nebulae, zero AI-generated cosmic dust, zero glowing orbs.
 * - Mathematically sharp, fast, and high-performance.
 */
export default function CosmicBackground() {
  const canvasRef = useRef(null);
  const astronautRef = useRef(null);
  const [isTapped, setIsTapped] = useState(false);

  const astronautState = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.76 : 850,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.18 : 200,
    vx: 0.55,
    vy: 0.28,
    angle: -12,
    spin: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvasSize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      initStarfield();
    };

    // Mathematically distributed crisp white pinprick stars
    let stars = [];
    const STAR_COUNT = 140;

    const initStarfield = () => {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          // Ultra-tiny pinprick dots: 0.4px to 0.85px radius
          radius: Math.random() * 0.45 + 0.4,
          // Crisp, steady opacity: 0.25 to 0.75
          alpha: Math.random() * 0.5 + 0.25,
          // Very gentle, imperceptible celestial drift
          vx: (Math.random() - 0.5) * 0.04,
          vy: (Math.random() - 0.5) * 0.04
        });
      }
    };

    setupCanvasSize();
    window.addEventListener('resize', setupCanvasSize);

    // Realistic Shooting Star System: ultra-thin, sharp white line, disappears in < 1 second
    let shootingStars = [];
    let lastMeteorTime = performance.now();
    let nextMeteorDelay = 3500 + Math.random() * 2000; // fires every 3.5s - 5.5s

    const spawnShootingStar = (time) => {
      lastMeteorTime = time;
      nextMeteorDelay = 3200 + Math.random() * 2400;

      // Diagonal trajectory from top/left across screen (angle ~ 36° - 42°)
      const angle = (Math.PI / 5) + (Math.random() - 0.5) * 0.12;
      const startX = Math.random() * (width * 0.85);
      const startY = Math.random() * (height * 0.35);

      shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 80 + 70, // 70px - 150px
        speed: Math.random() * 12 + 24,  // Fast: 24 - 36px per frame
        angle: angle,
        life: 1.0,
        decay: 0.038 // 1.0 / 0.038 ≈ 26 frames = ~430ms total lifetime (< 0.5 seconds!)
      });
    };

    let tick = 0;

    const render = (time) => {
      tick += 0.006;

      // Periodically trigger sharp realistic shooting star
      if (time - lastMeteorTime > nextMeteorDelay) {
        spawnShootingStar(time);
      }

      // Clear frame cleanly
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Clean Subtle Pinprick Star Field (No blur, no fuzzy glow, razor sharp)
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Slow smooth celestial drift
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Ultra-Thin Sharp Shooting Stars with Elegant Linear Fade Trail
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        // Elegant gradient fade trail from crisp pure white head to zero opacity tail
        const trailGrad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        trailGrad.addColorStop(0, `rgba(255, 255, 255, ${ss.life * 0.95})`);
        trailGrad.addColorStop(0.3, `rgba(255, 255, 255, ${ss.life * 0.6})`);
        trailGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 1.0; // Ultra-thin, sharp 1px line
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Advance meteor along trajectory
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life -= ss.decay;

        // Immediately purge once faded (< 1 second)
        if (ss.life <= 0) {
          shootingStars.splice(i, 1);
        }
      }

      // 3. Free-Floating Astronaut Zero-G Physics (Smoothly floating across deep space)
      const a = astronautState.current;
      a.x += a.vx;
      a.y += a.vy;

      const swayY = Math.sin(tick * 2.4) * 4.5;
      const swayAngle = Math.sin(tick * 1.5) * 8;
      const currentAngle = a.angle + swayAngle + a.spin;

      if (Math.abs(a.spin) > 0.05) {
        a.spin *= 0.95;
      }

      const padX = 60;
      const padY = 50;
      if (a.x < padX) {
        a.vx = Math.abs(a.vx) * 0.96 + 0.08;
        a.angle = -6;
      } else if (a.x > width - padX - 80) {
        a.vx = -Math.abs(a.vx) * 0.96 - 0.08;
        a.angle = -20;
      }

      if (a.y < padY) {
        a.vy = Math.abs(a.vy) * 0.96 + 0.08;
      } else if (a.y > height - padY - 80) {
        a.vy = -Math.abs(a.vy) * 0.96 - 0.08;
      }

      // Subtle random steering drift
      if (Math.random() < 0.012) {
        a.vx += (Math.random() - 0.5) * 0.12;
        a.vy += (Math.random() - 0.5) * 0.12;
        const spd = Math.hypot(a.vx, a.vy);
        if (spd > 1.1) {
          a.vx = (a.vx / spd) * 1.1;
          a.vy = (a.vy / spd) * 1.1;
        } else if (spd < 0.3) {
          a.vx = (a.vx / (spd || 1)) * 0.45;
          a.vy = (a.vy / (spd || 1)) * 0.45;
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
      window.removeEventListener('resize', setupCanvasSize);
    };
  }, []);

  const handleAstronautBoost = (e) => {
    e.stopPropagation();
    soundFx.playPass();
    setIsTapped(true);
    const a = astronautState.current;
    a.vx = (Math.random() - 0.5) * 3.2;
    a.vy = (Math.random() - 0.5) * 3.2;
    a.spin = Math.random() > 0.5 ? 360 : -360;

    setTimeout(() => {
      setIsTapped(false);
    }, 2000);
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        // Deep midnight blue transitioning mathematically into pitch-black void
        background: 'radial-gradient(130% 120% at 50% 0%, #050b1a 0%, #020617 40%, #000000 100%)'
      }}
    >
      {/* Precision 60fps Starfield & Shooting Star Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* ================= FREE-FLOATING ZERO-G ASTRONAUT ROAMING FREELY ================= */}
      <div
        ref={astronautRef}
        onClick={handleAstronautBoost}
        className="absolute top-0 left-0 pointer-events-auto cursor-pointer will-change-transform z-10 group"
        style={{
          transform: 'translate3d(100px, 100px, 0px) rotate(-12deg)'
        }}
        title="Zero-G Astronaut • Click for thruster impulse!"
      >
        <div className="relative flex flex-col items-center">
          
          {/* ================= INTERACTIVE "YOU TAP ME!" CALLOUT ABOVE HELMET ================= */}
          <div className="absolute -top-10 flex flex-col items-center pointer-events-none whitespace-nowrap z-20">
            <div 
              className={`px-2.5 py-0.5 rounded-full bg-[#030712]/90 border ${
                isTapped 
                  ? 'border-amber-400 text-amber-300 ring-1 ring-amber-400/50 scale-105' 
                  : 'border-white/20 text-slate-200 group-hover:border-cyan-400 group-hover:text-cyan-300'
              } text-[9px] font-sans font-semibold tracking-wider shadow-sm flex items-center gap-1.5 transition-all duration-200 backdrop-blur-md`}
            >
              <span>{isTapped ? 'ZERO-G BOOST' : 'YOU TAP ME'}</span>
              <span className="text-[10px]">{isTapped ? '⚡' : '👆'}</span>
            </div>
            {/* Minimalist chevron pointing to astronaut */}
            <div 
              className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] ${
                isTapped ? 'border-t-amber-400' : 'border-t-white/20 group-hover:border-t-cyan-400'
              } transition-colors`}
            />
          </div>

          {/* Micro Space Tether Line */}
          <svg className="absolute -top-10 -right-7 w-16 h-16 pointer-events-none opacity-20">
            <path
              d="M 6 48 Q 24 20, 48 4"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          </svg>

          {/* Pixel-Art Floating Astronaut Sprite */}
          <img
            src="/sprites/astronaut_floating.png"
            alt="Floating Astronaut"
            style={{ width: '56px', height: '56px', maxWidth: '56px', maxHeight: '56px' }}
            className="object-contain pixelated drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform"
          />

          {/* Clean Status Pill */}
          <div className="mt-1 px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[8px] font-mono font-medium text-slate-400 whitespace-nowrap backdrop-blur-sm opacity-60 group-hover:opacity-100 transition-opacity">
            ZERO-G DRIFT
          </div>
        </div>
      </div>
    </div>
  );
}
