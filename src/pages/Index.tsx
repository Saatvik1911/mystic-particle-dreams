
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import ProjectsSection from '../components/ProjectsSection';
import ProcessSection from '../components/ProcessSection';
import Footer from '../components/Footer';

const Index = () => {
  const [currentSection, setCurrentSection] = useState<'hero' | 'projects' | 'process' | 'about'>('hero');
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = [
      { id: 'hero', ref: heroRef },
      { id: 'projects', ref: projectsRef },
      { id: 'process', ref: processRef },
    ];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSection(entry.target.id as any);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    sections.forEach(section => {
      if (section.ref.current) {
        observer.observe(section.ref.current);
      }
    });

    return () => {
      sections.forEach(section => {
        if (section.ref.current) {
          observer.unobserve(section.ref.current);
        }
      });
    };
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navigateToAbout = () => {
    navigate('/about');
  };

  return (
    <div className="bg-background">
      <Navigation 
        currentSection={currentSection} 
        onNavigate={{ 
          navigateToHome: () => scrollToSection(heroRef), 
          navigateToProjects: () => scrollToSection(projectsRef),
          navigateToProcess: () => scrollToSection(processRef),
          navigateToAbout
        }} 
      />
      
      <div id="hero" ref={heroRef}>
        <HeroSection onNavigateToProjects={() => scrollToSection(projectsRef)} />
      </div>
      <div id="projects" ref={projectsRef}>
        <ProjectsSection />
      </div>
      <div id="process" ref={processRef}>
        <ProcessSection />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
