
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface HeroSectionProps {
  isActive: boolean;
  onNavigateToProjects: () => void;
}

const HeroSection = ({ isActive, onNavigateToProjects }: HeroSectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Separate useEffect for section changes
  useEffect(() => {
    if (window.heroSectionRef && window.heroSectionRef.current) {
      if (!isActive) {
        // Transition camera to the right (90 degrees)
        window.heroSectionRef.current.targetCameraY = Math.PI / 2;
        window.heroSectionRef.current.isTransitioning = true;
      } else {
        // Return camera to center
        window.heroSectionRef.current.targetCameraY = 0;
        window.heroSectionRef.current.isTransitioning = true;
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (!canvasRef.current) return;

    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let mainParticles: THREE.Points, starfield: THREE.Points, flowParticles: THREE.Points;
    let initialPositions: Float32Array, flowPositions: Float32Array;
    let shootingStars: THREE.Points[] = [];

    // Mouse and Camera Controls
    const mouse = new THREE.Vector2(10000, 10000);
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraRotation = { x: 0.1, y: 0 };
    let cameraDistance = 250;

    // Camera transition
    let targetCameraY = 0;
    let isTransitioning = false;

    // Store reference for external access
    window.heroSectionRef = {
      current: {
        targetCameraY: 0,
        isTransitioning: false
      }
    };

    // Animation Settings
    const animationSettings = {
      speed: 1.0,
      interactionRadius: 150,
      repelStrength: 2.5,
      returnSpeed: 0.02,
      time: 0,
      flowSpeed: 1.0,
      flowAmplitude: 20,
      noiseScale: 0.003,
      mistOpacity: 0.4
    };

    let shootingStarTimer = 0;
    const shootingStarInterval = 6000;

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000001, 1);

      updateCameraPosition();
      createStarfield();
      createMistSystem();
      createFlowParticles();
      setupEventListeners();
      animate();
    }

    function createStarfield() {
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = [];
      const starColors = [];
      const starCount = 4000;
      
      for (let i = 0; i < starCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starPositions.push(x, y, z);
        
        const color = new THREE.Color();
        const brightness = 0.3 + Math.random() * 0.3;
        color.setRGB(brightness * 0.9, brightness * 0.95, brightness);
        starColors.push(color.r, color.g, color.b);
      }
      
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
      
      const starMaterial = new THREE.PointsMaterial({ 
        size: 1, 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.6, 
        blending: THREE.AdditiveBlending 
      });
      
      starfield = new THREE.Points(starGeometry, starMaterial);
      scene.add(starfield);
    }

    function createShootingStar() {
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      
      const trailLength = 20;
      const startPos = new THREE.Vector3(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
      
      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      
      for (let i = 0; i < trailLength; i++) {
        const pos = startPos.clone().add(direction.clone().multiplyScalar(i * -5));
        positions.push(pos.x, pos.y, pos.z);
        
        const brightness = (trailLength - i) / trailLength;
        colors.push(brightness * 0.9, brightness * 0.95, brightness);
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
      });
      
      const shootingStar = new THREE.Points(geometry, material);
      shootingStar.userData = {
        direction: direction,
        speed: 5 + Math.random() * 5,
        life: 3000,
        age: 0
      };
      
      scene.add(shootingStar);
      shootingStars.push(shootingStar);
    }

    function updateShootingStars(deltaTime: number) {
      shootingStars.forEach((star, index) => {
        star.userData.age += deltaTime;
        
        if (star.userData.age > star.userData.life) {
          scene.remove(star);
          star.geometry.dispose();
          star.material.dispose();
          shootingStars.splice(index, 1);
          return;
        }
        
        star.position.add(star.userData.direction.clone().multiplyScalar(star.userData.speed));
        
        const lifeRatio = star.userData.age / star.userData.life;
        star.material.opacity = 1 - lifeRatio;
      });
    }

    function createFlowParticles() {
      const flowGeometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const flowCount = 300;
      const radius = 120;
      
      for (let i = 0; i < flowCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius + (Math.random() - 0.5) * 40;
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        positions.push(x, y, z);
        
        const brightness = 0.3 + Math.random() * 0.2;
        const color = new THREE.Color();
        color.setRGB(brightness * 0.9, brightness * 0.95, brightness);
        colors.push(color.r, color.g, color.b);
      }
      
      flowPositions = new Float32Array(positions);
      flowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
      flowGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const flowMaterial = new THREE.PointsMaterial({ 
        size: 1, 
        vertexColors: true, 
        blending: THREE.AdditiveBlending, 
        transparent: true, 
        opacity: 0.2 
      });
      
      flowParticles = new THREE.Points(flowGeometry, flowMaterial);
      scene.add(flowParticles);
    }

    function createMistSystem() {
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const particleCount = 8000;
      const radius = 80;
      
      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * (0.3 + Math.random() * 0.7);
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        positions.push(x, y, z);
        
        const brightness = 0.4 + Math.random() * 0.3;
        const color = new THREE.Color();
        color.setRGB(brightness * 0.85, brightness * 0.9, brightness);
        colors.push(color.r, color.g, color.b);
      }
      
      initialPositions = new Float32Array(positions);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const material = new THREE.PointsMaterial({ 
        size: 1,
        vertexColors: true, 
        blending: THREE.AdditiveBlending, 
        transparent: true, 
        opacity: animationSettings.mistOpacity 
      });
      
      mainParticles = new THREE.Points(geometry, material);
      scene.add(mainParticles);
    }

    function updateCameraPosition() {
      const x = cameraDistance * Math.sin(cameraRotation.x) * Math.cos(cameraRotation.y);
      const y = cameraDistance * Math.cos(cameraRotation.x);
      const z = cameraDistance * Math.sin(cameraRotation.x) * Math.sin(cameraRotation.y);
      
      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);
    }

    function animate() {
      requestAnimationFrame(animate);
      const deltaTime = 16;
      animationSettings.time += 0.016;
      
      // Handle camera transitions using global reference
      if (window.heroSectionRef?.current) {
        const targetCameraY = window.heroSectionRef.current.targetCameraY;
        const isTransitioning = window.heroSectionRef.current.isTransitioning;
        
        if (isTransitioning) {
          const transitionSpeed = 0.05;
          const diff = targetCameraY - cameraRotation.y;
          if (Math.abs(diff) > 0.01) {
            cameraRotation.y += diff * transitionSpeed;
          } else {
            cameraRotation.y = targetCameraY;
            window.heroSectionRef.current.isTransitioning = false;
          }
          updateCameraPosition();
        } else if (isActive) {
          // Only auto-rotate when active and not transitioning
          cameraRotation.y += 0.0002 * animationSettings.speed;
          updateCameraPosition();
        }
      }
      
      // Handle shooting stars
      shootingStarTimer += deltaTime;
      if (shootingStarTimer >= shootingStarInterval) {
        createShootingStar();
        shootingStarTimer = 0;
      }
      updateShootingStars(deltaTime);
      
      // Reduced auto-rotate camera
      cameraRotation.y += 0.0002 * animationSettings.speed;
      updateCameraPosition();
      
      // Animate mist particles
      if (mainParticles) {
        const positions = mainParticles.geometry.attributes.position.array as Float32Array;
        const colors = mainParticles.geometry.attributes.color.array as Float32Array;
        
        for (let i = 0; i < positions.length; i += 3) {
          const originalX = initialPositions[i];
          const originalY = initialPositions[i + 1];
          const originalZ = initialPositions[i + 2];
          
          const noiseX = Math.sin(animationSettings.time * animationSettings.flowSpeed + originalX * animationSettings.noiseScale) * animationSettings.flowAmplitude * 0.5;
          const noiseY = Math.cos(animationSettings.time * animationSettings.flowSpeed + originalY * animationSettings.noiseScale) * animationSettings.flowAmplitude * 0.5;
          const noiseZ = Math.sin(animationSettings.time * animationSettings.flowSpeed + originalZ * animationSettings.noiseScale) * animationSettings.flowAmplitude * 0.3;
          
          let targetX = originalX + noiseX;
          let targetY = originalY + noiseY;
          let targetZ = originalZ + noiseZ;
          
          const distance = Math.sqrt((targetX - mouse.x) ** 2 + (targetY - mouse.y) ** 2);
          if (distance < animationSettings.interactionRadius) {
            const force = (animationSettings.interactionRadius - distance) / animationSettings.interactionRadius;
            const angle = Math.atan2(targetY - mouse.y, targetX - mouse.x);
            const pushDistance = force * animationSettings.repelStrength * 60;
            targetX += Math.cos(angle) * pushDistance;
            targetY += Math.sin(angle) * pushDistance;
            targetZ += (Math.random() - 0.5) * pushDistance * 0.5;
          }
          
          positions[i] += (targetX - positions[i]) * animationSettings.returnSpeed;
          positions[i + 1] += (targetY - positions[i + 1]) * animationSettings.returnSpeed;
          positions[i + 2] += (targetZ - positions[i + 2]) * animationSettings.returnSpeed;
          
          const colorIndex = Math.floor(i / 3) * 3;
          const time = animationSettings.time * 0.3;
          const brightness = 0.4 + Math.sin(time + originalX * 0.005) * 0.15;
          colors[colorIndex] = brightness * 0.85;
          colors[colorIndex + 1] = brightness * 0.9;
          colors[colorIndex + 2] = brightness;
        }
        
        mainParticles.geometry.attributes.position.needsUpdate = true;
        mainParticles.geometry.attributes.color.needsUpdate = true;
      }
      
      // Animate flow particles
      if (flowParticles) {
        const positions = flowParticles.geometry.attributes.position.array as Float32Array;
        
        for (let i = 0; i < positions.length; i += 3) {
          const originalX = flowPositions[i];
          const originalY = flowPositions[i + 1];
          const originalZ = flowPositions[i + 2];
          
          const time = animationSettings.time * animationSettings.flowSpeed * 0.5;
          const flowX = Math.sin(time + originalX * 0.002) * animationSettings.flowAmplitude;
          const flowY = Math.cos(time + originalY * 0.002) * animationSettings.flowAmplitude;
          const flowZ = Math.sin(time + originalZ * 0.002) * animationSettings.flowAmplitude * 0.5;
          
          positions[i] = originalX + flowX;
          positions[i + 1] = originalY + flowY;
          positions[i + 2] = originalZ + flowZ;
        }
        
        flowParticles.geometry.attributes.position.needsUpdate = true;
      }
      
      if (starfield) {
        starfield.rotation.y += 0.0001;
        starfield.rotation.x += 0.00005;
      }
      
      renderer.render(scene, camera);
    }

    function setupEventListeners() {
      // Use window for mouse events to capture all mouse movement
      function onMouseMove(event: MouseEvent) {
        const vec = new THREE.Vector3(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1,
          0.5
        );
        vec.unproject(camera);
        const dir = vec.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        mouse.x = pos.x;
        mouse.y = pos.y;

        if (isDragging) {
          const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
          };
          cameraRotation.y += deltaMove.x * 0.005;
          cameraRotation.x += deltaMove.y * 0.005;
          cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.x));
          updateCameraPosition();
          previousMousePosition = { x: event.clientX, y: event.clientY };
        }
      }

      function onMouseDown(event: MouseEvent) {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
      }

      function onMouseUp() {
        isDragging = false;
      }

      function onWheel(event: WheelEvent) {
        event.preventDefault();
        cameraDistance += event.deltaY * 0.1;
        cameraDistance = Math.max(120, Math.min(400, cameraDistance));
        updateCameraPosition();
      }

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('wheel', onWheel);
      window.addEventListener('resize', onWindowResize);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('wheel', onWheel);
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
    <section className={`absolute inset-0 flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #000001 0%, #000003 50%, #000005 100%)' }}
      />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 30 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-medium text-white mb-2 tracking-wide font-space">
            Saatvik Agrawal
          </h1>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-3"></div>
          <p className="text-xs md:text-xs text-slate-300 mb-12 font-light font-mono tracking-wider">
            Product Designer & Manager crafting user-centered digital experiences
          </p>
        </motion.div>
      </div>

      {/* Button positioned absolutely to not affect text centering */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute z-10 pointer-events-auto"
        style={{ 
          left: '50%', 
          transform: 'translateX(-50%)', 
          top: 'calc(50% + 100px)' 
        }}
      >
        <button 
          className="px-8 py-3 bg-white text-black rounded-full hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium font-space"
          onClick={onNavigateToProjects}
        >
          View My Work
        </button>
      </motion.div>

      {/* Instruction text centered at the bottom of the screen */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-slate-400 z-10 pointer-events-none"
      >
        <div className="flex flex-col items-center">
          <span className="text-sm mb-2 font-mono">Move mouse to interact • Scroll horizontally to explore</span>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent animate-pulse"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
