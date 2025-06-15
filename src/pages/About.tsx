
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import AboutSection from '../components/AboutSection';

const About = () => {
  const navigate = useNavigate();

  const handleNavigateToHome = () => {
    navigate('/');
  };

  const handleNavigateToProjects = () => {
    navigate('/projects');
  };

  const handleNavigateToAbout = () => {
    navigate('/about');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation 
        currentSection="about" 
        onNavigate={{ 
          navigateToHome: handleNavigateToHome, 
          navigateToProjects: handleNavigateToProjects,
          navigateToAbout: handleNavigateToAbout
        }} 
      />
      <AboutSection />
    </div>
  );
};

export default About;
