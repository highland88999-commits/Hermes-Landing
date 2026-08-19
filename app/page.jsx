"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MallDirectory from '../components/MallDirectory';
import InjectorDrawer from '../components/InjectorDrawer';
import { supabase } from '../lib/supabase';

// Dynamically import the Three.js canvas to prevent Server-Side Rendering (SSR) errors
const GalaxyCanvas = dynamic(() => import('../components/GalaxyCanvas'), { ssr: false });

export default function Home() {
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch approved nodes on mount
  useEffect(() => {
    const fetchLinks = async () => {
      const { data, error } = await supabase
        .from('links_directory')
        .select('*')
        .eq('payment_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Directory Uplink Error:", error.message);
        return;
      }

      if (data) {
        setLinks(data);
        // Extract unique categories dynamically from the database
        const uniqueCats = Array.from(new Set(data.map(item => item.category)))
          .map(cat => ({ id: cat, name: cat, icon: 'fa-folder' }));
        setCategories(uniqueCats);
      }
    };

    fetchLinks();
  }, []);

  // Filter logic for the UI grid
  const filteredLinks = links.filter(link => {
    const matchesCategory = activeCategory === 'ALL' || link.category === activeCategory;
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Multiverse Video Background Blend */}
      <div id="bg-video-container">
        <video className="bg-video base-video" src="https://files.catbox.moe/gmgn0b.mp4" autoPlay loop muted playsInline />
        <video className="bg-video blend-video" src="https://files.catbox.moe/vg5h14.mp4" autoPlay loop muted playsInline />
      </div>

      {/* 3D Particle Canvas */}
      <GalaxyCanvas />

      {/* Main Interface Master Node */}
      <MallDirectory
        categories={categories}
        items={filteredLinks}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectNode={(node) => window.open(node.url, '_blank')}
      />

      {/* Navigation Indicators & Cyber Footer */}
      <div className="swipe-indicator">
        <i className="fa-solid fa-angles-left"></i> SWIPE TO NAVIGATE <i className="fa-solid fa-angles-right"></i>
      </div>

      <footer className="cyber-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 20px', pointerEvents: 'auto' }}>
        <div className="visit-count">
          SYSTEM UPLINK: <span style={{ color: '#00ff00' }}>STABLE</span>
        </div>
      </footer>

      {/* Injector Slide-Out Component (Self-Managing) */}
      <InjectorDrawer />
    </>
  );
}
