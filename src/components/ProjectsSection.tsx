import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProjectsSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let mainParticles: THREE.Points, starfield: THREE.Points, flowParticles: THREE.Points;
    let initialPositions: Float32Array, flowPositions: Float32Array;

    const mouse = new THREE.Vector2(10000, 10000);
    let cameraRotation = { x: 0.1, y: 0 };
    let cameraDistance = 300;

    const animationSettings = {
      speed: 0.5,
      interactionRadius: 120,
      repelStrength: 2.0,
      returnSpeed: 0.02,
      time: 0,
      flowSpeed: 0.6,
      flowAmplitude: 20,
      noiseScale: 0.002,
      mistOpacity: 0.7,
      particleDensity: 15
    };

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, antialias: true, alpha: true });
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

    function createFlowParticles() {
      const flowGeometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const flowCount = 200;
      
      for (let i = 0; i < flowCount; i++) {
        const x = (Math.random() - 0.5) * 800;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 150;
        
        positions.push(x, y, z);
        
        const distanceFromCenter = Math.abs(x) / 400;
        const brightness = (0.3 + Math.random() * 0.2) * (1 - distanceFromCenter * 0.5);
        const color = new THREE.Color();
        color.setRGB(brightness * 0.9, brightness * 0.6, brightness);
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
        opacity: 0.3 
      });
      
      flowParticles = new THREE.Points(flowGeometry, flowMaterial);
      scene.add(flowParticles);
    }

    function createNebulaSystem() {
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const sizes = [];
      const particleCount = animationSettings.particleDensity * 2000;
      
      for (let i = 0; i < particleCount; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        const r = Math.random();
        
        // Horizontal ellipsoid - wider and flatter
        const a = 500; // Width
        const b = 150; // Depth  
        const c = 40;  // Height (much flatter)
        
        const radiusVariation = 0.6 + Math.random() * 0.7;
        
        const x = a * radiusVariation * Math.sin(v) * Math.cos(u) * r;
        const y = c * radiusVariation * Math.sin(v) * Math.sin(u) * r;
        const z = b * radiusVariation * Math.cos(v) * r;
        
        positions.push(x, y, z);
        
        // Much more dispersed color with very gradual transition
        const distanceFromCenter = Math.sqrt(x*x + y*y + z*z);
        const maxDistance = Math.sqrt(a*a + b*b + c*c);
        const distanceFactor = 1 - (distanceFromCenter / maxDistance);
        
        // Much larger and more dispersed core radius (95% of area)
        const coreRadius = Math.min(a, b, c) * 0.95;
        const distanceFromCore = Math.sqrt(x*x + y*y + z*z);
        
        // Use a very soft falloff function for extremely gradual transition
        const coreInfluence = Math.max(0, 1 - Math.pow(distanceFromCore / coreRadius, 0.15));
        
        const baseBrightness = 0.25 + Math.random() * 0.15;
        const brightness = baseBrightness * (0.3 + distanceFactor * 0.7);
        
        const color = new THREE.Color();
        
        // Create a much more gradual transition from purple to grey
        const purpleIntensity = coreInfluence * 0.6;
        const greyBase = brightness * (0.7 + purpleIntensity * 0.3);
        
        color.setRGB(
          greyBase + purpleIntensity * brightness * 0.25,
          greyBase + purpleIntensity * brightness * 0.1,
          greyBase + purpleIntensity * brightness * 0.4
        );
        
        colors.push(color.r, color.g, color.b);
        
        const size = 0.8 + Math.random() * 1.0 + distanceFactor * 0.6;
        sizes.push(size);
      }
      
      initialPositions = new Float32Array(positions);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
      
      const material = new THREE.ShaderMaterial({
        uniforms: {
          opacity: { value: animationSettings.mistOpacity }
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float opacity;
          varying vec3 vColor;
          
          void main() {
            float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
            float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
            alpha *= opacity;
            alpha *= (0.7 + 0.3 * exp(-distanceToCenter * 3.0));
            
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
      animationSettings.time += 0.016;
      
      // Very slow auto-rotation
      const rotationLimit = 0.1;
      const oscillationSpeed = 0.0003;
      cameraRotation.y = Math.sin(animationSettings.time * oscillationSpeed) * rotationLimit;
      
      updateCameraPosition();
      
      // Animate nebula particles
      if (mainParticles) {
        const positions = mainParticles.geometry.attributes.position.array as Float32Array;
        
        for (let i = 0; i < positions.length; i += 3) {
          const originalX = initialPositions[i];
          const originalY = initialPositions[i + 1];
          const originalZ = initialPositions[i + 2];
          
          const noiseX = Math.sin(animationSettings.time * animationSettings.flowSpeed + originalX * animationSettings.noiseScale) * animationSettings.flowAmplitude * 0.4;
          const noiseY = Math.cos(animationSettings.time * animationSettings.flowSpeed + originalY * animationSettings.noiseScale) * animationSettings.flowAmplitude * 0.6;
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
            targetZ += (Math.random() - 0.5) * pushDistance * 0.4;
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
        
        for (let i = 0; i < positions.length; i += 3) {
          const originalX = flowPositions[i];
          const originalY = flowPositions[i + 1];
          const originalZ = flowPositions[i + 2];
          
          const time = animationSettings.time * animationSettings.flowSpeed * 0.2;
          const flowX = Math.sin(time + originalX * 0.0008) * animationSettings.flowAmplitude * 0.8;
          const flowY = Math.cos(time + originalY * 0.002) * animationSettings.flowAmplitude * 0.6;
          const flowZ = Math.sin(time + originalZ * 0.0015) * animationSettings.flowAmplitude * 0.4;
          
          positions[i] = originalX + flowX;
          positions[i + 1] = originalY + flowY;
          positions[i + 2] = originalZ + flowZ;
        }
        
        flowParticles.geometry.attributes.position.needsUpdate = true;
      }
      
      if (starfield) {
        starfield.rotation.y += 0.0002;
        starfield.rotation.x += 0.00008;
      }
      
      renderer.render(scene, camera);
    }

    function setupEventListeners() {
      function onMouseMove(event: MouseEvent) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const vec = new THREE.Vector3(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -(((event.clientY - rect.top) / rect.height) * 2 - 1),
          0.5
        );
        vec.unproject(camera);
        const dir = vec.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        mouse.x = pos.x;
        mouse.y = pos.y;
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

  const projects = [
    {
      id: 1,
      title: "Project One",
      subtitle: "Coming Soon",
      description: "Project covers will be uploaded here",
      placeholder: true
    },
    {
      id: 2,
      title: "Project Two", 
      subtitle: "Coming Soon",
      description: "Project covers will be uploaded here",
      placeholder: true
    },
    {
      id: 3,
      title: "Project Three",
      subtitle: "Coming Soon", 
      description: "Project covers will be uploaded here",
      placeholder: true
    },
    {
      id: 4,
      title: "Project Four",
      subtitle: "Coming Soon",
      description: "Project covers will be uploaded here", 
      placeholder: true
    }
  ];

  return (
    <section id="projects" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #000005 0%, #000008 50%, #00000a 100%)' }}
      />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6 font-space">
            Selected Work
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto mb-6"></div>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-mono">
            Crafting digital experiences that solve real problems
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {projects.map((project, index) => (
                <CarouselItem key={project.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer h-full"
                  >
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-purple-400/50 transition-all duration-300 h-full flex flex-col">
                      <div className="relative overflow-hidden h-64 bg-slate-700/30 flex items-center justify-center">
                        <div className="text-slate-500 text-center">
                          <div className="w-16 h-16 bg-slate-600/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl">📁</span>
                          </div>
                          <p className="text-sm">Cover Image</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300 font-space">
                          {project.title}
                        </h3>
                        <p className="text-purple-400 text-sm font-medium mb-3 font-mono">
                          {project.subtitle}
                        </p>
                        <p className="text-slate-400 leading-relaxed flex-1">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-12 bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50" />
            <CarouselNext className="hidden sm:flex -right-12 bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50" />
          </Carousel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-slate-400 pointer-events-none"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2 font-mono">Swipe or use arrows to navigate</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
