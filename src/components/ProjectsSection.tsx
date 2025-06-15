
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface ProjectsSectionProps {
  // No props needed now
}

const ProjectsSection = ({}: ProjectsSectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let mainParticles: THREE.Points, starfield: THREE.Points, flowParticles: THREE.Points;
    let initialPositions: Float32Array, flowPositions: Float32Array;
    let shootingStars: THREE.Points[] = [];
    const mouse = new THREE.Vector2(10000, 10000);

    let isDragging = false;
    let previousMousePosition = {
      x: 0,
      y: 0
    };
    let cameraDistance = 300;
    let cameraRotation = { x: 0, y: 0 };

    // Camera transition logic removed
    const animationSettings = {
      speed: 1.0,
      interactionRadius: 180,
      repelStrength: 3.0,
      returnSpeed: 0.025,
      time: 0,
      flowSpeed: 0.8,
      flowAmplitude: 25,
      noiseScale: 0.002,
      mistOpacity: 0.85,
      particleDensity: 25
    };
    let shootingStarTimer = 0;
    const shootingStarInterval = 8000;

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        antialias: true,
        alpha: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000005, 1);
      updateCameraPosition();
      createStarfield();
      createNebulaSystem();
      createFlowParticles();
      setupEventListeners();
      animate();
    }

    function createStarfield() {
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = [];
      const starColors = [];
      const starCount = 6000;
      for (let i = 0; i < starCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starPositions.push(x, y, z);
        const color = new THREE.Color();
        const brightness = 0.3 + Math.random() * 0.4;
        color.setRGB(brightness * 0.95, brightness * 0.9, brightness);
        starColors.push(color.r, color.g, color.b);
      }
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
      const starMaterial = new THREE.PointsMaterial({
        size: 0.8,
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
      const trailLength = 25;
      const startPos = new THREE.Vector3((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 2000);
      const direction = new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 2).normalize();
      for (let i = 0; i < trailLength; i++) {
        const pos = startPos.clone().add(direction.clone().multiplyScalar(i * -6));
        positions.push(pos.x, pos.y, pos.z);
        const brightness = (trailLength - i) / trailLength;
        colors.push(brightness * 0.95, brightness * 0.85, brightness);
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({
        size: 4,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
      });
      const shootingStar = new THREE.Points(geometry, material);
      shootingStar.userData = {
        direction: direction,
        speed: 6 + Math.random() * 4,
        life: 4000,
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
      const flowCount = 400;
      for (let i = 0; i < flowCount; i++) {
        const x = (Math.random() - 0.5) * 600;
        const y = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 120;
        positions.push(x, y, z);
        const distanceFromCenter = Math.abs(x) / 300;
        const brightness = (0.4 + Math.random() * 0.3) * (1 - distanceFromCenter * 0.5);
        const color = new THREE.Color();
        color.setRGB(brightness * 0.95, brightness * 0.7, brightness);
        colors.push(color.r, color.g, color.b);
      }
      flowPositions = new Float32Array(positions);
      flowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
      flowGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      const flowMaterial = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.4
      });
      flowParticles = new THREE.Points(flowGeometry, flowMaterial);
      scene.add(flowParticles);
    }

    function createNebulaSystem() {
      if (mainParticles) {
        scene.remove(mainParticles);
        mainParticles.geometry.dispose();
        mainParticles.material.dispose();
      }
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const sizes = [];
      const particleCount = animationSettings.particleDensity * 4000;
      for (let i = 0; i < particleCount; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        const r = Math.random();
        const a = 400; // Major axis (horizontal width)
        const b = 100; // Depth  
        const c = 60; // Minor axis (vertical height)

        const radiusVariation = 0.7 + Math.random() * 0.6;
        const x = a * radiusVariation * Math.sin(v) * Math.cos(u) * r;
        const y = c * radiusVariation * Math.sin(v) * Math.sin(u) * r;
        const z = b * radiusVariation * Math.cos(v) * r;
        positions.push(x, y, z);
        const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
        const maxDistance = Math.sqrt(a * a + b * b + c * c);
        const distanceFactor = 1 - distanceFromCenter / maxDistance;

        // Increased and more dispersed purple core - reduced from 60% to 80% for more dispersion
        const coreRadius = Math.min(a, b, c) * 0.8; // 80% of smallest dimension for more dispersion
        const distanceFromCore = Math.sqrt(x * x + y * y + z * z);
        const isInCore = distanceFromCore < coreRadius;
        const baseBrightness = 0.3 + Math.random() * 0.2;
        const brightness = baseBrightness * (0.4 + distanceFactor * 0.6);
        const color = new THREE.Color();
        if (isInCore) {
          // More dispersed purple core with gradual falloff
          const coreIntensity = Math.max(0, 1 - distanceFromCore / coreRadius); // Gradual falloff
          const purpleIntensity = coreIntensity * 0.4; // Reduced intensity for subtlety

          color.setRGB(brightness * (0.6 + purpleIntensity * 0.3), brightness * (0.3 + purpleIntensity * 0.2), brightness * (0.7 + purpleIntensity * 0.2));
        } else {
          // Grey particles with very subtle purple reflection
          const coreInfluence = Math.max(0, 1 - (distanceFromCore - coreRadius) / (maxDistance - coreRadius));
          const reflectionIntensity = coreInfluence * 0.1; // Much subtler reflection
          const greyBase = brightness * 0.7;
          color.setRGB(greyBase + reflectionIntensity * brightness * 0.1, greyBase + reflectionIntensity * brightness * 0.05, greyBase + reflectionIntensity * brightness * 0.15);
        }
        colors.push(color.r, color.g, color.b);
        const size = 1.0 + Math.random() * 1.2 + distanceFactor * 0.8;
        sizes.push(size);
      }
      initialPositions = new Float32Array(positions);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
      const material = new THREE.ShaderMaterial({
        uniforms: {
          opacity: {
            value: animationSettings.mistOpacity
          }
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          varying float vSize;
          
          void main() {
            vColor = color;
            vSize = size;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float opacity;
          varying vec3 vColor;
          varying float vSize;
          
          void main() {
            float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
            float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
            alpha *= opacity;
            
            alpha *= (0.8 + 0.4 * exp(-distanceToCenter * 4.0));
            
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true
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

      // Handle shooting stars
      shootingStarTimer += deltaTime;
      if (shootingStarTimer >= shootingStarInterval) {
        createShootingStar();
        shootingStarTimer = 0;
      }
      updateShootingStars(deltaTime);

      // Limited auto-rotate camera
      const rotationLimit = 0.174;
      const oscillationSpeed = 0.0005;
      cameraRotation.y = Math.sin(animationSettings.time * oscillationSpeed) * rotationLimit;
      updateCameraPosition();

      // Animate nebula particles
      if (mainParticles) {
        const positions = mainParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          const originalX = initialPositions[i];
          const originalY = initialPositions[i + 1];
          const originalZ = initialPositions[i + 2];
          const noiseX = Math.sin(animationSettings.time * animationSettings.flowSpeed + originalX * animationSettings.noiseScale) * animationSettings.flowAmplitude * 0.6;
          const noiseY = Math.cos(animationSettings.time * animationSettings.flowSpeed + originalY * animationSettings.noiseScale) * animationSettings.flowAmplitude * 0.8;
          const noiseZ = Math.sin(animationSettings.time * animationSettings.flowSpeed + originalZ * animationSettings.noiseScale) * animationSettings.flowAmplitude * 0.4;
          let targetX = originalX + noiseX;
          let targetY = originalY + noiseY;
          let targetZ = originalZ + noiseZ;
          const distance = Math.sqrt((targetX - mouse.x) ** 2 + (targetY - mouse.y) ** 2);
          if (distance < animationSettings.interactionRadius) {
            const force = (animationSettings.interactionRadius - distance) / animationSettings.interactionRadius;
            const angle = Math.atan2(targetY - mouse.y, targetX - mouse.x);
            const pushDistance = force * animationSettings.repelStrength * 80;
            targetX += Math.cos(angle) * pushDistance;
            targetY += Math.sin(angle) * pushDistance;
            targetZ += (Math.random() - 0.5) * pushDistance * 0.6;
          }
          positions[i] += (targetX - positions[i]) * animationSettings.returnSpeed;
          positions[i + 1] += (targetY - positions[i + 1]) * animationSettings.returnSpeed;
          positions[i + 2] += (targetZ - positions[i + 2]) * animationSettings.returnSpeed;
        }
        mainParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Animate flow particles
      if (flowParticles) {
        const positions = flowParticles.geometry.attributes.position.array as Float32Array;
        const colors = flowParticles.geometry.attributes.color.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          const originalX = flowPositions[i];
          const originalY = flowPositions[i + 1];
          const originalZ = flowPositions[i + 2];
          const time = animationSettings.time * animationSettings.flowSpeed * 0.3;
          const flowX = Math.sin(time + originalX * 0.001) * animationSettings.flowAmplitude * 1.2;
          const flowY = Math.cos(time + originalY * 0.003) * animationSettings.flowAmplitude * 0.8;
          const flowZ = Math.sin(time + originalZ * 0.002) * animationSettings.flowAmplitude * 0.6;
          positions[i] = originalX + flowX;
          positions[i + 1] = originalY + flowY;
          positions[i + 2] = originalZ + flowZ;
          const colorIndex = Math.floor(i / 3) * 3;
          const distanceFromCenter = Math.abs(originalX) / 300;
          const baseBrightness = 0.4 + Math.sin(time + originalX * 0.001) * 0.15;
          const brightness = baseBrightness * (1 - distanceFromCenter * 0.5);
          colors[colorIndex] = brightness * 0.95;
          colors[colorIndex + 1] = brightness * 0.7;
          colors[colorIndex + 2] = brightness;
        }
        flowParticles.geometry.attributes.position.needsUpdate = true;
        flowParticles.geometry.attributes.color.needsUpdate = true;
      }
      if (starfield) {
        starfield.rotation.y += 0.0003;
        starfield.rotation.x += 0.0001;
      }
      renderer.render(scene, camera);
    }

    function setupEventListeners() {
      function onMouseMove(event: MouseEvent) {
        const vec = new THREE.Vector3(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
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
          cameraRotation.y += deltaMove.x * 0.01;
          cameraRotation.x += deltaMove.y * 0.01;
          cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.x));
          updateCameraPosition();
          previousMousePosition = {
            x: event.clientX,
            y: event.clientY
          };
        }
      }
      function onMouseDown(event: MouseEvent) {
        isDragging = true;
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      }
      function onMouseUp() {
        isDragging = false;
      }
      function onWheel(event: WheelEvent) {
        event.preventDefault();
        cameraDistance += event.deltaY * 0.1;
        cameraDistance = Math.max(150, Math.min(800, cameraDistance));
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

  const projects = [{
    id: 1,
    title: "Eqo",
    subtitle: "Revolutionary location based social network",
    description: "Revolutionizing Social Media: Tackling the paradox of digital connection while battling loneliness in social media.",
    image: "/lovable-uploads/844636d3-a0c8-407c-9745-b243f178a387.png",
    tags: ["UI", "UX", "Research", "Gamification", "Social Media"],
    color: "from-orange-500 to-pink-500"
  }, {
    id: 2,
    title: "Safa-E",
    subtitle: "Bronze Winners Globally in SSDC 2022",
    description: "Service design for E-Rickshaw Drivers. Exhaustive design rooted in shared value, studying stakeholder journeys and business trends.",
    image: "/lovable-uploads/fa90fb7e-7d9b-4095-8ad1-6fb1ca6e0080.png",
    tags: ["UI", "UX", "Service", "Research"],
    color: "from-blue-500 to-cyan-500"
  }, {
    id: 3,
    title: "Annex",
    subtitle: "Smart collaboration platform",
    description: "Smart collaboration platform for semi-formal communications in professional environments to boost work productivity.",
    image: "/lovable-uploads/585acf27-0ab1-4a71-a343-ac5b8bf95d7e.png",
    tags: ["UI", "UX", "Design Sprint", "Research"],
    color: "from-green-500 to-teal-500"
  }];

  return (
    <section className="relative py-24 flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{
        background: 'linear-gradient(135deg, #000001 0%, #000003 50%, #000005 100%)'
      }} />
      
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center px-12 lg:px-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }} 
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6 font-space">
            Featured Projects
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 justify-items-center">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer"
            >
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 w-80 h-96 flex flex-col">
                {/* Image section - consistent height for all cards */}
                <div className="relative overflow-hidden h-44 flex-shrink-0">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                
                {/* Content section - flexible height */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-purple-400 text-xs font-medium mb-2">
                    {project.subtitle}
                  </p>
                  <p className="text-slate-400 mb-3 leading-relaxed text-xs flex-grow">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-700/50 backdrop-blur-sm text-slate-300 text-xs rounded-full border border-slate-600/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }} 
          className="text-center mt-16"
        >
          <button className="px-4 py-2 border border-purple-500/50 text-purple-400 rounded-full hover:bg-purple-500/20 hover:text-white transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
            View All Projects
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
