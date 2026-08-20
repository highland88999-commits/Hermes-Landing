"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SlidableDirectoryPages() {
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Home');
  const [loading, setLoading] = useState(true);
  
  // Controls the UI hide/show mechanic
  const [uiVisible, setUiVisible] = useState(true);

  useEffect(() => {
    fetchApprovedNodes();
  }, []);

  const fetchApprovedNodes = async () => {
    try {
      setLoading(true);
      // Fetch only paid/approved nodes from your database
      const { data, error } = await supabase
        .from('links_directory')
        .select('*')
        .eq('payment_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const fetchedLinks = data || [];
      setLinks(fetchedLinks);

      // Extract unique categories for the horizontal top scroller
      const uniqueCategories = ['Home', ...new Set(fetchedLinks.map(link => link.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error("Error fetching multiverse nodes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter links for the currently active category
  const activeLinks = activeCategory === 'Home' 
    ? links 
    : links.filter(link => link.category === activeCategory);

  // Toggle UI visibility when clicking the background
  const handleBackgroundClick = () => {
    setUiVisible(!uiVisible);
  };

  // Prevent background click from firing when interacting with UI elements
  const preventHide = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="relative min-h-[85vh] w-full cursor-crosshair"
      onClick={handleBackgroundClick}
    >
      {/* UI Wrapper with Fade Transition */}
      <div 
        className={`transition-opacity duration-500 w-full h-full flex flex-col items-center ${uiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        
        {/* Horizontal Category Scroller (Rests under nav) */}
        <div 
          className="w-full max-w-4xl px-4 py-4 mb-8 overflow-x-auto flex gap-4 snap-x scrollbar-hide border-b border-cyan-500/20"
          onClick={preventHide}
        >
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`snap-center shrink-0 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                activeCategory === cat 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.3)]' 
                  : 'bg-black/40 border-cyan-500/20 text-gray-400 hover:border-cyan-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Vertical Cards List */}
        <div 
          className="flex flex-col gap-6 w-full max-w-2xl px-4 pb-32 overflow-y-auto"
          onClick={preventHide}
        >
          {loading ? (
            <div className="text-center text-cyan-400 tracking-widest text-sm animate-pulse">
              INITIALIZING MULTIVERSE NODES...
            </div>
          ) : activeLinks.length > 0 ? (
            activeLinks.map((node) => (
              <a
                key={node.id}
                href={node.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-6 overflow-hidden transition-all duration-400 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]"
              >
                {/* Cyberpunk Accent Line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-600 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <h3 className="text-lg font-bold text-white tracking-widest uppercase mb-2 group-hover:text-cyan-300 transition-colors">
                  {node.title || node.platform_name}
                </h3>
                
                <p className="text-xs text-gray-400 font-mono truncate">
                  {node.url}
                </p>
                
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-cyan-500/50 group-hover:text-cyan-400 transition-colors">
                  <i className="fas fa-external-link-alt"></i>
                </div>
              </a>
            ))
          ) : (
            <div className="text-center text-gray-500 tracking-widest text-sm p-10 border border-dashed border-gray-700 rounded-lg">
              NO ACTIVE NODES FOUND IN {activeCategory.toUpperCase()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
