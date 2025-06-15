
import React from 'react';
import Navigation from '../components/Navigation';
import AboutSection from '../components/AboutSection';

const About = () => {
  const handleNavigateToHome = () => {
    window.location.href = '/';
  };

  const handleNavigateToProjects = () => {
    window.location.href = '/projects';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation 
        currentSection="about" 
        onNavigate={{ 
          navigateToHome: handleNavigateToHome, 
          navigateToProjects: handleNavigateToProjects 
        }} 
      />
      <AboutSection />
    </div>
  );
};

export default About;
