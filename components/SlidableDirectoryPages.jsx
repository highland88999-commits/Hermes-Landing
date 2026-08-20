import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// The multiverse node atmospheric video feeds
const BACKGROUND_VIDEOS = [
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
      // Fetch only approved links from Supabase
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
      console.error('Error fetching and grouping directory links:', err.message);
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

  if (loading) return <div className="text-center text-cyan-400 p-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse">Initializing Multiverse Nodes...</div>;
  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;
  if (categories.length === 0) return <div className="text-center text-gray-400 p-10">No active nodes found in the network.</div>;

  const currentCategory = categories[currentIndex];
  const linksInCategory = categorizedData[currentCategory] || [];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center">
      
      {/* PAGE / CATEGORY HEADER */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold tracking-widest text-cyan-300 uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
          {currentCategory.replace('_', ' ')}
        </h2>
        <span className="text-xs text-gray-400">
          Node Page {currentIndex + 1} of {categories.length}
        </span>
      </div>

      {/* SLIDABLE CONTAINER (Cards for the current category page) */}
      <div className="w-full min-h-[300px] bg-gray-900/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-md shadow-2xl transition-all duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {linksInCategory.map((link, index) => {
            // Cyclically assign a video from the array based on the index
            const bgVideo = BACKGROUND_VIDEOS[index % BACKGROUND_VIDEOS.length];

            return (
              <a
                key={link.id || link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex flex-col p-4 bg-black/60 border border-gray-800 rounded-xl hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-500 group overflow-hidden h-32 justify-end"
              >
                {/* Background Video Layer with Bloom and Pulse */}
                <video
                  src={bgVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen animate-[pulse_4s_ease-in-out_infinite] group-hover:opacity-60 group-hover:scale-110 transition-all duration-700 z-0"
                />

                {/* Gradient overlay to preserve text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>

                {/* Text Content */}
                <div className="relative z-20 flex flex-col">
                  <span className="text-md font-semibold text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.6)] group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.9)] truncate transition-all duration-300">
                    {link.platform_designation || link.root_domain || link.url}
                  </span>
                  <span className="text-xs text-gray-400 truncate mt-1 group-hover:text-cyan-100 transition-colors duration-300">
                    {link.url}
                  </span>
                </div>
              </a>
            );
          })}

        </div>
      </div>

      {/* NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between w-full mt-6 px-4">
        <button
          onClick={prevSlide}
          className="px-4 py-2 bg-gray-800 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-950 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all text-sm tracking-wider"
        >
          &laquo; PREV NODE
        </button>
        
        <span className="text-xs text-cyan-400 tracking-widest uppercase animate-pulse drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
          Swipe / Navigate
        </span>

        <button
          onClick={nextSlide}
          className="px-4 py-2 bg-gray-800 border border-cyan-500/40 text-cyan-400 rounded-lg hover:bg-cyan-950 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all text-sm tracking-wider"
        >
          NEXT NODE &raquo;
        </button>
      </div>

    </div>
  );
}
