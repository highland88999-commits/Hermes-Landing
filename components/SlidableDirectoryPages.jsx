"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SlidableDirectoryPages() {
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Home');
  const [loading, setLoading] = useState(true);
  const [uiVisible, setUiVisible] = useState(true);

  useEffect(() => {
    fetchApprovedNodes();
  }, []);

  const fetchApprovedNodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('links_directory')
        .select('*')
        .eq('payment_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const fetchedLinks = data || [];
      setLinks(fetchedLinks);

      const uniqueCategories = ['Home', ...new Set(fetchedLinks.map(link => link.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error("Error fetching nodes:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeLinks = activeCategory === 'Home' 
    ? links 
    : links.filter(link => link.category === activeCategory);

  const handleBackgroundClick = () => setUiVisible(!uiVisible);
  const preventHide = (e) => e.stopPropagation();

  // URL formatter to prevent relative Next.js 404 routing errors
  const formatUrl = (url) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <div 
      className="relative cursor-crosshair overflow-y-auto"
      onClick={handleBackgroundClick}
      style={{ zIndex: 50, width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '128px', paddingBottom: '96px', paddingLeft: '16px', paddingRight: '16px' }} 
    >
      <div 
        style={{ 
          width: '100%', maxWidth: '672px', display: 'flex', flexDirection: 'column', alignItems: 'center',
          opacity: uiVisible ? 1 : 0, 
          pointerEvents: uiVisible ? 'auto' : 'none',
          transition: 'opacity 0.4s ease-in-out'
        }} 
      >
        
        {/* Horizontal Categories */}
        {categories.length > 1 && (
          <div 
            onClick={preventHide}
            style={{ width: '100%', maxWidth: '576px', display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '24px' }}
          >
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0, padding: '8px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer',
                  backgroundColor: activeCategory === cat ? 'rgba(0,255,255,0.15)' : 'rgba(0,0,0,0.6)',
                  color: activeCategory === cat ? '#00ffff' : '#aaaaaa',
                  border: activeCategory === cat ? '1px solid #00ffff' : '1px solid rgba(0,255,255,0.2)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Vertical Cards */}
        <div 
          onClick={preventHide}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', paddingBottom: '100px' }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', color: '#00ffff', padding: '40px', letterSpacing: '2px', fontSize: '12px' }}>
              INITIALIZING MULTIVERSE NODES...
            </div>
          ) : activeLinks.length > 0 ? (
            activeLinks.map((node) => (
              <a
                key={node.id}
                href={formatUrl(node.url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', position: 'relative', width: '100%', backgroundColor: 'rgba(5, 5, 5, 0.85)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 255, 255, 0.3)', borderRadius: '12px', padding: '20px', textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)', transition: 'all 0.3s ease', overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, #00ffff, #bc13fe)', opacity: 0.8 }}></div>
                
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '2px' }}>
                  {node.title || node.platform_name || 'Untitled Node'}
                </h3>
                
                <p style={{ fontSize: '11px', color: '#888888', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {node.url}
                </p>
              </a>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#666666', padding: '40px', border: '1px dashed rgba(0,255,255,0.2)', borderRadius: '12px', fontSize: '12px', letterSpacing: '2px' }}>
              NO ACTIVE NODES FOUND IN {activeCategory.toUpperCase()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
