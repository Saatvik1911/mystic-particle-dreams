import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import ProjectsSection from '../components/ProjectsSection';
import ProcessSection from '../components/ProcessSection';
import Footer from '../components/Footer';

const Index = () => {
  const [currentSection, setCurrentSection] = useState<'hero' | 'projects' | 'process' | 'about'>('hero');
  const navigate = useNavigate();
  const location = useLocation();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (!section) return;

    let targetRef: React.RefObject<HTMLDivElement> | null = null;
    if (section === 'hero') targetRef = heroRef;
    if (section === 'projects') targetRef = projectsRef;
    if (section === 'process') targetRef = processRef;

    if (targetRef) {
      setTimeout(() => scrollToSection(targetRef!), 100);
    }
  }, [location.search]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollLeft > 50);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = [
      { id: 'hero', ref: heroRef },
      { id: 'projects', ref: projectsRef },
      { id: 'process', ref: processRef },
    ];
    
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentSection(entry.target.id as any);
          }
        });
      },
      { root: container, threshold: 0.5 }
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
    if (ref.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: ref.current.offsetLeft,
        behavior: 'smooth',
      });
    }
  };

  const navigateToAbout = () => {
    navigate('/about');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <Navigation 
        currentSection={currentSection} 
        onNavigate={{ 
          navigateToHome: () => scrollToSection(heroRef), 
          navigateToProjects: () => scrollToSection(projectsRef),
          navigateToProcess: () => scrollToSection(processRef),
          navigateToAbout
        }} 
      />
      
      <div 
        ref={scrollContainerRef} 
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div id="hero" ref={heroRef} className="w-screen h-full flex-shrink-0 snap-start">
          <HeroSection onNavigateToProjects={() => scrollToSection(projectsRef)} />
        </div>
        <div id="projects" ref={projectsRef} className="w-screen h-full flex-shrink-0 snap-start flex items-center justify-center">
          <ProjectsSection />
        </div>
        <div id="process" ref={processRef} className="w-screen h-full flex-shrink-0 snap-start flex items-center justify-center bg-slate-900">
          <ProcessSection />
        </div>
        <div id="footer" ref={footerRef} className="w-screen h-full flex-shrink-0 snap-start flex items-center justify-center">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
