
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import ProjectsSection from '../components/ProjectsSection';

const Index = () => {
  const [currentSection, setCurrentSection] = useState<'hero' | 'projects'>('hero');
  const navigate = useNavigate();

  const navigateToProjects = () => {
    setCurrentSection('projects');
  };

  const navigateToHome = () => {
    setCurrentSection('hero');
  };

  const navigateToAbout = () => {
    navigate('/about');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navigation 
        currentSection={currentSection} 
        onNavigate={{ 
          navigateToHome, 
          navigateToProjects,
          navigateToAbout 
        }} 
      />
      <div className="relative w-full h-screen">
        <HeroSection 
          isActive={currentSection === 'hero'} 
          onNavigateToProjects={navigateToProjects} 
        />
        <ProjectsSection 
          isActive={currentSection === 'projects'} 
          onNavigateToHome={navigateToHome} 
        />
      </div>
    </div>
  );
};

export default Index;
