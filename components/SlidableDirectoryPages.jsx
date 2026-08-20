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
      console.error("Error fetching multiverse nodes:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeLinks = activeCategory === 'Home' 
    ? links 
    : links.filter(link => link.category === activeCategory);

  const handleBackgroundClick = () => {
    setUiVisible(!uiVisible);
  };

  const preventHide = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="relative z-20 w-full min-h-screen flex flex-col items-center pt-32 pb-24 px-4 cursor-crosshair overflow-y-auto"
      onClick={handleBackgroundClick}
    >
      {/* Main UI Wrapper with Visibility Transition */}
      <div 
        className={`w-full max-w-2xl flex flex-col items-center transition-opacity duration-500 ${uiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        
        {/* Horizontal Category Scroller */}
        {categories.length > 1 && (
          <div 
            className="w-full max-w-xl mb-6 overflow-x-auto flex gap-3 pb-2 scrollbar-hide border-b border-cyan-500/20 px-2"
            onClick={preventHide}
          >
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                  activeCategory === cat 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.3)]' 
                    : 'bg-black/60 border-cyan-500/20 text-gray-400 hover:border-cyan-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Vertical Stacked Cards List */}
        <div 
          className="flex flex-col gap-4 w-full"
          onClick={preventHide}
        >
          {loading ? (
            <div className="text-center text-cyan-400 tracking-widest text-xs animate-pulse py-12">
              INITIALIZING MULTIVERSE NODES...
            </div>
          ) : activeLinks.length > 0 ? (
            activeLinks.map((node) => (
              <a
                key={node.id}
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full bg-black/70 backdrop-blur-md border border-cyan-500/30 rounded-xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]"
              >
                {/* Cyberpunk Accent Strip */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-600 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                
                <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-1 group-hover:text-cyan-300 transition-colors">
                  {node.title || node.platform_name || 'Untitled Node'}
                </h3>
                
                <p className="text-[11px] text-gray-400 font-mono truncate">
                  {node.url}
                </p>
                
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-cyan-500/50 group-hover:text-cyan-400 transition-colors text-xs">
                  <i className="fas fa-external-link-alt"></i>
                </div>
              </a>
            ))
          ) : (
            <div className="text-center text-gray-500 tracking-widest text-xs py-12 border border-dashed border-cyan-500/20 rounded-xl bg-black/40">
              NO ACTIVE NODES FOUND IN {activeCategory.toUpperCase()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
