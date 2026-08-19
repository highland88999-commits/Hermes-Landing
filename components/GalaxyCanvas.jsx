import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GalaxyCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const galaxyColors = [0x00ffff, 0xbc13fe, 0xff00ff, 0x00ff00, 0xffaa00, 0xff0000];
    let colorIndex = 0;
    const targetColor = new THREE.Color(galaxyColors[0]);

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 25000; i++) {
      vertices.push(
        THREE.MathUtils.randFloatSpread(6000),
        THREE.MathUtils.randFloatSpread(6000),
        THREE.MathUtils.randFloatSpread(6000)
      );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0x00ffff, size: 1.2, transparent: true, opacity: 0.7 });
    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    scene.add(new THREE.PointLight(0x00ffff, 4, 4000));
    scene.add(new THREE.AmbientLight(0x111111));
    camera.position.z = 1200;

    const colorInterval = setInterval(() => {
      colorIndex = (colorIndex + 1) % galaxyColors.length;
      targetColor.setHex(galaxyColors[colorIndex]);
    }, 10000);

    let animationFrameId;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;
      material.color.lerp(targetColor, 0.015);
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(colorInterval);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="galaxy-canvas" />;
}
