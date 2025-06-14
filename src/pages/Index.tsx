
import React from 'react';
import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import ProjectsSection from '../components/ProjectsSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="grid grid-cols-2 min-h-screen">
        <div className="col-span-1">
          <HeroSection />
        </div>
        <div className="col-span-1">
          <ProjectsSection />
        </div>
      </div>
    </div>
  );
};

export default Index;
