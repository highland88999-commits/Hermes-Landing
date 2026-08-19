// components/MallDirectory.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function MallDirectory() {
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDirectoryLinks();
  }, []);

  const fetchDirectoryLinks = async () => {
    try {
      setLoading(true);
      // Fetch only approved links from the directory
      const { data, error } = await supabase
        .from('links_directory')
        .select('*')
        .eq('payment_status', 'approved')
        .order('category', { ascending: true });

      if (error) throw error;

      setLinks(data);

      // Extract unique categories for the carousel, prepending 'All'
      const uniqueCategories = ['All', ...new Set(data.map(link => link.category))];
      setCategories(uniqueCategories);
      
    } catch (err) {
      console.error('Error fetching mall directory:', err.message);
      setError('Failed to load the directory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter links based on the active category
  const filteredLinks = activeCategory === 'All' 
    ? links 
    : links.filter(link => link.category === activeCategory);

  if (loading) return <div className="text-center p-10">Loading Mall Directory...</div>;
  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      
      {/* CATEGORY CAROUSEL */}
      <div className="flex overflow-x-auto gap-4 pb-4 mb-8 border-b border-gray-700 custom-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              activeCategory === category
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* MALL LINKS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredLinks.length > 0 ? (
          filteredLinks.map((link) => (
            <a
              key={link.id || link.root_domain}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500 hover:shadow-2xl transition-all duration-300 group"
            >
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400">
                {linkHere is the service file to initialize the Supabase client and handle the data fetching for your mall UI. 

You can create this as `supabaseClient.js` (or `src/lib/supabase.js` depending on your folder structure). It initializes the connection and provides a dedicated function to query the `links_directory` table based on the active category.

### `supabaseClient.js`

```javascript
import { createClient } from '@supabase/supabase-js';

// Access environment variables depending on your build tool (Next.js vs Vite)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches directory links for the mall UI based on the selected category.
 * 
 * @param {string} category - The active category string (e.g., 'apparel', 'electronics'). 
 *                            Pass 'all' or null to fetch the entire directory.
 * @returns {Promise<Array|null>} Array of link objects or null if an error occurs.
 */
export async function fetchDirectoryLinks(category) {
  try {
    let query = supabase.from('links_directory').select('*');

    // Filter by category if a specific one is provided
    if (category && category.toLowerCase() !== 'all') {
      query = query.eq('category', category);
    }

    // Sort the links (adjust 'created_at' to whatever column makes sense for your UI)
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching links_directory:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in fetchDirectoryLinks:', err);
    return null;
  }
}
