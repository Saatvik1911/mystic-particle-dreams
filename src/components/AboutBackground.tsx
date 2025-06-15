import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface AboutBackgroundProps {
  isActive: boolean;
}

const AboutBackground = ({ isActive }: AboutBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

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
    let cameraRotation = {
      x: 0.1,
      y: 0
    };
    let cameraDistance = 300;

    // Camera transition
    let targetCameraY = isActive ? Math.PI / 2 : 0;
    let isTransitioning = true;
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
        const a = 400;
        const b = 100;
        const c = 60;

        const radiusVariation = 0.7 + Math.random() * 0.6;
        const x = a * radiusVariation * Math.sin(v) * Math.cos(u) * r;
        const y = c * radiusVariation * Math.sin(v) * Math.sin(u) * r;
        const z = b * radiusVariation * Math.cos(v) * r;
        positions.push(x, y, z);
        const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
        const maxDistance = Math.sqrt(a * a + b * b + c * c);
        const distanceFactor = 1 - distanceFromCenter / maxDistance;

        const coreRadius = Math.min(a, b, c) * 0.8;
        const distanceFromCore = Math.sqrt(x * x + y * y + z * z);
        const isInCore = distanceFromCore < coreRadius;
        const baseBrightness = 0.3 + Math.random() * 0.2;
        const brightness = baseBrightness * (0.4 + distanceFactor * 0.6);
        const color = new THREE.Color();
        if (isInCore) {
          const coreIntensity = Math.max(0, 1 - distanceFromCore / coreRadius);
          const purpleIntensity = coreIntensity * 0.4;
          color.setRGB(brightness * (0.6 + purpleIntensity * 0.3), brightness * (0.3 + purpleIntensity * 0.2), brightness * (0.7 + purpleIntensity * 0.2));
        } else {
          const coreInfluence = Math.max(0, 1 - (distanceFromCore - coreRadius) / (maxDistance - coreRadius));
          const reflectionIntensity = coreInfluence * 0.1;
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

      // Handle camera transition for page navigation
      if (isTransitioning) {
        const transitionSpeed = 0.02;
        const diff = targetCameraY - cameraRotation.y;
        if (Math.abs(diff) < 0.01) {
          cameraRotation.y = targetCameraY;
          isTransitioning = false;
        } else {
          cameraRotation.y += diff * transitionSpeed;
        }
        updateCameraPosition();
      }

      // Handle shooting stars
      shootingStarTimer += deltaTime;
      if (shootingStarTimer >= shootingStarInterval) {
        createShootingStar();
        shootingStarTimer = 0;
      }
      updateShootingStars(deltaTime);

      // Limited auto-rotate camera
      if (!isTransitioning) {
        const rotationLimit = 0.174;
        const oscillationSpeed = 0.0005;
        cameraRotation.y += Math.sin(animationSettings.time * oscillationSpeed) * rotationLimit * 0.01;
        updateCameraPosition();
      }

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
        const colors = flowParticles.geometry.attributes.color.array as Float32BufferAttribute;
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
  }, [isActive]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0" 
      style={{
        background: 'linear-gradient(135deg, #000001 0%, #000003 50%, #000005 100%)'
      }} 
    />
  );
};

export default AboutBackground;
