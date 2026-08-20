"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import SlidableDirectoryPages from '../components/SlidableDirectoryPages';
import InjectorDrawer from '../components/InjectorDrawer';

// Dynamically import the Three.js canvas to prevent Server-Side Rendering (SSR) errors
const GalaxyCanvas = dynamic(() => import('../components/GalaxyCanvas'), { ssr: false });

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-black text-white overflow-x-hidden">
      
      {/* Multiverse Video Background Blend */}
      <div id="bg-video-container" className="fixed inset-0 pointer-events-none z-0">
        <video 
          className="bg-video base-video absolute inset-0 w-full h-full object-cover opacity-40" 
          src="https://files.catbox.moe/gmgn0b.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
        />
        <video 
          className="bg-video blend-video absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen" 
          src="https://files.catbox.moe/vg5h14.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
        />
      </div>

      {/* 3D Particle Canvas */}
      <GalaxyCanvas />

      {/* Main Slidable Multiverse Interface */}
      <div className="relative z-[100] pt-32 pb-24 min-h-screen pointer-events-auto">
        <SlidableDirectoryPages />
      </div>

      {/* Cyber Footer & Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 flex justify-between items-center px-6 py-3 bg-black/80 backdrop-blur-md border-t border-cyan-500/20 text-xs tracking-widest text-cyan-400 pointer-events-auto">
        <div className="visit-count">
          SYSTEM UPLINK: <span className="text-green-400 font-bold animate-pulse">STABLE</span>
        </div>
        <div className="hidden sm:block text-gray-500 uppercase">
          Multiverse Node Matrix v2.4
        </div>
      </footer>

      {/* Injector Slide-Out Component (Self-Managing) */}
      <InjectorDrawer />

    </main>
  );
}
