
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import ProjectsSection from '../components/ProjectsSection';

const Projects = () => {
  const navigate = useNavigate();

  const handleNavigateToHome = () => {
    navigate('/');
  };

  const handleNavigateToProjects = () => {
    window.scrollTo(0, 0);
  };

  const handleNavigateToAbout = () => {
    navigate('/about');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <Navigation 
        currentSection="projects" 
        onNavigate={{ 
          navigateToHome: handleNavigateToHome, 
          navigateToProjects: handleNavigateToProjects,
          navigateToAbout: handleNavigateToAbout
        }} 
      />
      <div className="w-full h-full flex items-center justify-center">
        <ProjectsSection />
      </div>
    </div>
  );
};

export default Projects;
