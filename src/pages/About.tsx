
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

  const handleNavigateToProcess = () => {
    navigate('/?section=process');
  };

  const handleNavigateToAbout = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation 
        currentSection="about" 
        onNavigate={{ 
          navigateToHome: handleNavigateToHome, 
          navigateToProjects: handleNavigateToProjects,
          navigateToProcess: handleNavigateToProcess,
          navigateToAbout: handleNavigateToAbout
        }} 
      />
      <div className="pt-24 pb-12">
        <AboutSection isActive={true} />
      </div>
    </div>
  );
};

export default About;
