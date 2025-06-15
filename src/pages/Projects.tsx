
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

  const handleNavigateToProcess = () => {
    navigate('/?section=process');
  };

  const handleNavigateToAbout = () => {
    navigate('/about');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <Navigation 
        currentSection="projects" 
        onNavigate={{ 
          navigateToHome: handleNavigateToHome, 
          navigateToProjects: handleNavigateToProjects,
          navigateToProcess: handleNavigateToProcess,
          navigateToAbout: handleNavigateToAbout
        }} 
      />
      <div className="w-full">
        <ProjectsSection />
      </div>
    </div>
  );
};

export default Projects;
