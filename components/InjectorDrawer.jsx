"use client";

import React, { useState } from 'react';

export default function InjectorDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'about_home'
  });
  const [loading, setLoading] = useState(false);

  const toggleDrawer = () => setIsOpen(!isOpen);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id.replace('node', '').toLowerCase()]: e.target.value });
  };

  const initiateUplink = async (gateway) => {
    const { name, url, category } = formData;

    if (!name || !url) {
      return alert("⚠️ MULTIVERSE ERROR: Designation and Protocol required.");
    }

    try { 
      new URL(url); 
    } catch (e) { 
      return alert("⚠️ Invalid URL. Must include https://"); 
    }

    if (gateway === 'stripe') {
      try {
        setLoading(true);
        document.body.style.cursor = 'wait';
        
        // Route securely to your Next.js backend
        const response = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: name, url, category }) // Mapped 'name' to 'title' for your backend
        });

        const data = await response.json();
        document.body.style.cursor = 'default';
        setLoading(false);

        if (!response.ok) {
          return alert("⚠️ " + (data.error || "Uplink rejected by server."));
        }

        window.location.href = data.url;

      } catch (err) {
        document.body.style.cursor = 'default';
        setLoading(false);
        return alert("⚠️ ERROR: Backend server unreachable. " + err.message);
      }
      
    } else if (gateway === 'crypto') {
      const cryptoBase = "https://nowpayments.io/payment/?iid=5516780859";
      const metadata = { title: name, url, category };
      const packedData = encodeURIComponent(JSON.stringify(metadata));
      
      window.open(`${cryptoBase}&order_description=${packedData}`, '_blank');
      
      setFormData({ name: '', url: '', category: 'about_home' });
      setIsOpen(false);
    }
  };

  return (
    <div id="injector-drawer" className="injector-drawer">
      <div className={`injector-content ${isOpen ? 'open' : ''}`} id="injector-content">
        
        {/* VIDEO BACKGROUND */}
        <div className="video-background">
          <video autoPlay loop muted playsInline className="vid-layer vid-1" src="https://files.catbox.moe/hlgmn4.mov" />
          <video autoPlay loop muted playsInline className="vid-layer vid-2" src="https://files.catbox.moe/pkzibl.mp4" />
        </div>

        <div className="terminal-header">ESTABLISH MULTIVERSE NODE [$2.00]</div>
        
        <div className="input-matrix">
          <input 
            type="text" 
            id="nodeName" 
            placeholder="PLATFORM DESIGNATION (e.g. eBay)" 
            autoComplete="off"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={loading}
          />
          <input 
            type="url" 
            id="nodeUrl" 
            placeholder="SECURE PROTOCOL (HTTPS://...)" 
            autoComplete="off"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            disabled={loading}
          />
          <select 
            id="nodeCategory" 
            className="cyber-select"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={loading}
          >
            <option value="about_home">Home</option>
            <option value="core">Multiverse Core</option>
            <option value="featured">Olympus Featured</option>
            <option value="real_estate">Real Estate & Property</option>
            <option value="investment">Investment Portfolios</option>
            <option value="banking">Banking & Accounts</option>
            <option value="renewed">A Renewed World</option>
            <option value="adult_gaming">Adults & Gaming</option>
            <option value="tcg">Trading Card Games</option>
            <option value="afterlife">Afterlife & Beyond</option>
            <option value="abyssal">Abyssal & Aquatic</option>
            <option value="tech">The Tech Stack</option>
            <option value="spatial_web">3D Constructs & Engines</option>
            <option value="web3">Decentralized Ops</option>
            <option value="employment">Employment & Careers</option>
            <option value="motor_pool">Garage & Mechanics</option>
            <option value="industrial">Heavy Industry & Blueprints</option>
            <option value="hardware">Hardware & Auctions</option>
            <option value="mobile">Mobile & Comms</option>
            <option value="apparel">Elite Apparel</option>
            <option value="shoes">Footwear & Kicks</option>
            <option value="jewelry">Jewelry Vault</option>
            <option value="watches">Horology & Watches</option>
            <option value="beauty">Health & Aesthetics</option>
            <option value="home_goods">Home & Habitat</option>
            <option value="pets">Pet Companions</option>
            <option value="leisure">Leisure & Attractions</option>
            <option value="food">Global Food Ops</option>
            <option value="logistics">Supply Chain & Logistics</option>
            <option value="travel">Global Atlas</option>
            <option value="finance">Crypto & Fintech</option>
            <option value="black_market">The Underground</option>
            <option value="audio_synth">Audio & Synth-Waves</option>
            <option value="entertainment">Media & Entertainment</option>
            <option value="kids">Kids Zone</option>
            <option value="archives">Archives & Academics</option>
            <option value="add_petition">Add Petition</option>
          </select>
        </div>

        <div className="gateway-matrix">
          <button className="cyber-btn stripe-btn" onClick={() => initiateUplink('stripe')} disabled={loading}>
            <i className="fa-brands fa-stripe-s"></i> {loading ? 'PROCESSING...' : 'STRIPE'}
          </button>
          <button className="cyber-btn crypto-btn" onClick={() => initiateUplink('crypto')} disabled={loading}>
            <i className="fa-brands fa-bitcoin"></i> CRYPTO
          </button>
        </div>
      </div>
      
      <div className="drawer-toggle" onClick={toggleDrawer}>
        INJECT NODE <i className={`fa-solid ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} id="drawer-icon"></i>
      </div>
    </div>
  );
}
