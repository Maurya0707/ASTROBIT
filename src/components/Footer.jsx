import React from 'react';
import { ArrowUp } from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function Footer({ onNavigateSector }) {
  const scrollToTop = () => {
    soundFx.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SECTORS = [
    { id: 1, name: 'Terra' },
    { id: 2, name: 'Dune' },
    { id: 3, name: 'Magma' },
    { id: 4, name: 'Frost' },
    { id: 5, name: 'Kronos' },
    { id: 6, name: 'Cyber' },
  ];

  return (
    <footer className="relative z-20 w-full mt-auto bg-black/60 backdrop-blur-md border-t border-white/10 text-slate-400 select-none">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
        
        {/* Left: Branding with Astronaut Mascot Logo */}
        <div className="flex items-center gap-2">
          <img 
            src="/sprites/astronaut_idle.png" 
            alt="ASTROBIT Mascot" 
            onError={(e) => {
              if (!e.currentTarget.src.includes('astronaut_idle.png')) {
                e.currentTarget.src = '/sprites/astronaut_idle.png';
              }
            }}
            className="w-4 h-4 object-contain pixelated"
          />
          <span className="font-pixel text-[11px] text-white tracking-wider">ASTROBIT</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">C Programming Platform</span>
        </div>

        {/* Center: Sectors */}
        <div className="flex items-center gap-2.5 text-[11px]">
          <span className="text-slate-500 font-pixel text-[9px]">SECTORS:</span>
          {SECTORS.map((sec, idx) => (
            <React.Fragment key={sec.id}>
              <button
                onClick={() => onNavigateSector && onNavigateSector(sec.id)}
                className="hover:text-cyan-300 transition-colors"
              >
                {sec.name}
              </button>
              {idx < SECTORS.length - 1 && <span className="text-slate-700">•</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Right: Developer Credit & Scroll to Top */}
        <div className="flex items-center gap-3 text-[11px]">
          <span>
            Developed by <strong className="text-slate-200 font-bold">Aditya Maurya</strong>
          </span>
          <span className="text-slate-600">|</span>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-black/50 border border-white/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors font-pixel text-[9px]"
            title="Scroll to top"
          >
            <span>TOP</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Subtle Copyright Line */}
      <div className="border-t border-white/5 py-1.5 px-4 text-center text-[10px] text-slate-500 font-mono">
        © {new Date().getFullYear()} ASTROBIT. All rights reserved.
      </div>
    </footer>
  );
}
