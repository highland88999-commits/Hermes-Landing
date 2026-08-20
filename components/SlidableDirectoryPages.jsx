"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const backgroundVideos = [
  "https://files.catbox.moe/mun0ip.mp4",
  "https://files.catbox.moe/6f9tkl.mp4",
  "https://files.catbox.moe/bdfbea.mp4",
  "https://files.catbox.moe/jbl8mg.mp4",
  "https://files.catbox.moe/3s2bct.mp4",
  "https://files.catbox.moe/7h1ksp.mp4",
  "https://files.catbox.moe/tmu4b3.mp4"
];

export default function SlidableDirectoryPages() {
  const [categorizedData, setCategorizedData] = useState({});
  const [categories, setCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAndGroupLinks();
  }, []);

  const fetchAndGroupLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('links_directory')
        .select('*')
        .eq('payment_status', 'approved')
        .order('category', { ascending: true });

      if (error) throw error;

      // Group links by their category
      const grouped = (data || []).reduce((acc, link) => {
        const cat = link.category || 'Uncategorized';
        if (!acc[cat]) {
          acc[cat] = [];
        }
        acc[cat].push(link);
        return acc;
      }, {});

      setCategorizedData(grouped);
      setCategories(Object.keys(grouped));
    } catch (err) {
      console.error('Error fetching directory links:', err.message);
      setError('Failed to load slidable directory pages.');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % categories.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + categories.length) % categories.length);
  };

  // URL formatter to prevent relative Next.js routing errors
  const formatUrl = (url) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  if (loading) return <div style={{ textAlign: 'center', color: '#00ffff', padding: '100px', letterSpacing: '2px' }}>INITIALIZING MULTIVERSE NODES...</div>;
  if (error) return <div style={{ color: '#ef4444', textAlign: 'center', padding: '100px' }}>{error}</div>;
  if (categories.length === 0) return <div style={{ textAlign: 'center', color: '#888', padding: '100px' }}>No active nodes found in the network.</div>;

  const currentCategory = categories[currentIndex];
  const linksInCategory = categorizedData[currentCategory] || [];

  return (
    <div style={{ 
      position: 'relative', zIndex: 50, width: '100%', minHeight: '100vh', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      paddingTop: '120px', paddingBottom: '96px' 
    }}>
      
      {/* 
        This style block handles the slow pulsing unreal bloom effect 
        without relying on Tailwind config files.
      */}
      <style>{`
        @keyframes unrealBloom {
          0% {
            opacity: 0.3;
            filter: brightness(1) contrast(1.2) blur(1px) drop-shadow(0 0 5px rgba(0,255,255,0.2));
          }
          100% {
            opacity: 0.65;
            filter: brightness(1.5) contrast(1.4) blur(0px) drop-shadow(0 0 20px rgba(0,255,255,0.6));
          }
        }
        .card-hover:hover {
          border-color: #00ffff !important;
          box-shadow: 0 0 25px rgba(0, 255, 255, 0.4) !important;
          transform: translateY(-2px);
        }
      `}</style>

      {/* PAGE / CATEGORY HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '30px', width: '100%' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '6px', color: '#00ffff', textTransform: 'uppercase', textShadow: '0 0 15px rgba(0,255,255,0.5)' }}>
          {currentCategory.replace('_', ' ')}
        </h2>
        <span style={{ fontSize: '12px', color: '#888', letterSpacing: '2px' }}>
          Node Page {currentIndex + 1} of {categories.length}
        </span>
      </div>

      {/* SLIDABLE CONTAINER (Cards for the current category page) */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: '20px', 
        width: '100%', maxWidth: '700px', padding: '0 20px' 
      }}>
        {linksInCategory.map((link, index) => (
          <a
            key={link.id || link.url}
            href={formatUrl(link.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover"
            style={{
              display: 'flex', flexDirection: 'column', position: 'relative', width: '100%',
              backgroundColor: 'rgba(5, 5, 5, 0.8)', borderRadius: '12px', padding: '24px',
              textDecoration: 'none', border: '1px solid rgba(0, 255, 255, 0.2)',
              transition: 'all 0.4s ease', overflow: 'hidden', minHeight: '110px',
              justifyContent: 'center'
            }}
          >
            {/* Background Video Layer */}
            <video
              autoPlay loop muted playsInline
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                objectFit: 'cover', zIndex: 0, pointerEvents: 'none',
                animation: 'unrealBloom 5s infinite alternate ease-in-out',
                mixBlendMode: 'screen'
              }}
            >
              <source src={backgroundVideos[index % backgroundVideos.length]} type="video/mp4" />
            </video>

            {/* Cyberpunk Accent Strip */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, #00ffff, #bc13fe)', zIndex: 1 }}></div>

            {/* Text Content (Z-index ensures it sits above the video) */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '2px', textShadow: '0 2px 5px rgba(0,0,0,0.9)' }}>
                {link.title || link.platform_name || link.platform_designation || link.root_domain || link.url}
              </span>
              
              <span style={{ fontSize: '11px', color: '#cccccc', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
                {link.url}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* NAVIGATION CONTROLS */}
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        width: '100%', maxWidth: '700px', padding: '30px 20px', marginTop: '10px'
      }}>
        <button
          onClick={prevSlide}
          style={{
            padding: '10px 20px', backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0, 255, 255, 0.4)',
            color: '#00ffff', borderRadius: '8px', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          &laquo; PREV
        </button>
        
        <span style={{ fontSize: '10px', color: '#00ffff', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.7 }}>
          Swipe / Navigate
        </span>

        <button
          onClick={nextSlide}
          style={{
            padding: '10px 20px', backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0, 255, 255, 0.4)',
            color: '#00ffff', borderRadius: '8px', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          NEXT &raquo;
        </button>
      </div>

    </div>
  );
}
