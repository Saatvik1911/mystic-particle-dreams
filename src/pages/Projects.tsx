
import React from 'react';
import Navigation from '../components/Navigation';
import ProjectsSection from '../components/ProjectsSection';

const Projects = () => {
  const handleNavigateToHome = () => {
    window.location.href = '/';
  };

  const handleNavigateToProjects = () => {
    // Already on projects page
  };

  return (
    <div className="min-h-screen">
      <Navigation 
        currentSection="projects" 
        onNavigate={{ 
          navigateToHome: handleNavigateToHome, 
          navigateToProjects: handleNavigateToProjects 
        }} 
      />
      <ProjectsSection />
    </div>
  );
};

export default Projects;
