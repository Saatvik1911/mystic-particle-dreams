
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleViewWorkClick = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  };

  const handleContactClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let sphere: THREE.Mesh, particles: THREE.Points, starfield: THREE.Points;
    let particlePositions: Float32Array;

    const mouse = new THREE.Vector2();
    let cameraRotation = { x: 0, y: 0 };
    const cameraDistance = 15;

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000005, 1);

      createStarfield();
      createSphere();
      createParticles();
      setupEventListeners();
      animate();
    }

    function createStarfield() {
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = [];
      const starColors = [];
      const starCount = 3000;
      
      for (let i = 0; i < starCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starPositions.push(x, y, z);
        
        const color = new THREE.Color();
        const brightness = 0.2 + Math.random() * 0.3;
        color.setRGB(brightness * 0.9, brightness * 0.85, brightness);
        starColors.push(color.r, color.g, color.b);
      }
      
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
      
      const starMaterial = new THREE.PointsMaterial({ 
        size: 0.6, 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.4, 
        blending: THREE.AdditiveBlending 
      });
      
      starfield = new THREE.Points(starGeometry, starMaterial);
      scene.add(starfield);
    }

    function createSphere() {
      const geometry = new THREE.SphereGeometry(3, 64, 64);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x6366f1,
        transparent: true,
        opacity: 0.1,
        wireframe: true
      });
      sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
    }

    function createParticles() {
      const particleCount = 2000;
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      
      for (let i = 0; i < particleCount; i++) {
        const radius = 2.5 + Math.random() * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        positions.push(x, y, z);
        
        const distance = Math.sqrt(x*x + y*y + z*z);
        const normalizedDistance = (distance - 2.5) / 2;
        const intensity = 1 - normalizedDistance;
        
        colors.push(
          0.4 + intensity * 0.3,
          0.2 + intensity * 0.4,
          0.8 + intensity * 0.2
        );
      }
      
      particlePositions = new Float32Array(positions);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      particles = new THREE.Points(geometry, material);
      scene.add(particles);
    }

    function animate() {
      requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      if (sphere) {
        sphere.rotation.y += 0.005;
        sphere.rotation.x += 0.002;
      }
      
      if (particles) {
        const positions = particles.geometry.attributes.position.array as Float32Array;
        
        for (let i = 0; i < positions.length; i += 3) {
          const originalX = particlePositions[i];
          const originalY = particlePositions[i + 1];
          const originalZ = particlePositions[i + 2];
          
          const noise = Math.sin(time + originalX * 0.5) * 0.1;
          positions[i] = originalX + noise;
          positions[i + 1] = originalY + Math.cos(time + originalY * 0.5) * 0.1;
          positions[i + 2] = originalZ + Math.sin(time + originalZ * 0.5) * 0.1;
          
          const mouseDistance = Math.sqrt(
            (positions[i] - mouse.x * 5) ** 2 + 
            (positions[i + 1] - mouse.y * 5) ** 2
          );
          
          if (mouseDistance < 2) {
            const force = (2 - mouseDistance) / 2;
            const angle = Math.atan2(positions[i + 1] - mouse.y * 5, positions[i] - mouse.x * 5);
            positions[i] += Math.cos(angle) * force * 0.5;
            positions[i + 1] += Math.sin(angle) * force * 0.5;
          }
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y += 0.001;
      }
      
      if (starfield) {
        starfield.rotation.y += 0.0002;
      }
      
      camera.position.x = Math.sin(cameraRotation.y) * cameraDistance;
      camera.position.z = Math.cos(cameraRotation.y) * cameraDistance;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    }

    function setupEventListeners() {
      function onMouseMove(event: MouseEvent) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        cameraRotation.y += (mouse.x - cameraRotation.y) * 0.02;
        cameraRotation.x += (mouse.y - cameraRotation.x) * 0.02;
      }

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('resize', onWindowResize);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onWindowResize);
      };
    }

    init();

    return () => {
      if (renderer) {
        renderer.dispose();
      }
      if (scene) {
        scene.clear();
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #000005 0%, #000008 50%, #00000a 100%)' }}
      />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-medium text-white mb-4 tracking-wide font-space">
            Saatvik Agrawal
          </h1>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-4"></div>
          <p className="text-base md:text-lg text-slate-300 mb-8 font-light font-mono tracking-wider">
            Product Designer & Manager crafting user-centered digital experiences
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto mb-12"
          >
            <button 
              onClick={handleViewWorkClick}
              className="px-8 py-3 bg-white text-black rounded-full hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium font-space"
            >
              View My Work
            </button>
            <button 
              onClick={handleContactClick}
              className="px-8 py-3 border border-slate-400 text-slate-300 rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300 font-medium font-space"
            >
              Get In Touch
            </button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-slate-400 z-10 pointer-events-none"
      >
        <div className="flex flex-col items-center">
          <span className="text-sm mb-2 font-mono">Move mouse to interact • Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-400 to-transparent animate-pulse"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
