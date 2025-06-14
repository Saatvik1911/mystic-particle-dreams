
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentSection: 'hero' | 'projects' | 'about';
  onNavigate: {
    navigateToHome: () => void;
    navigateToProjects: () => void;
    navigateToAbout?: () => void;
  };
}

const Navigation = ({ currentSection, onNavigate }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAboutNavigation = () => {
    if (currentSection === 'projects' && onNavigate.navigateToAbout) {
      // Special transition for projects to about
      setIsTransitioning(true);
      
      // Create overlay for smooth transition
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: black;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        pointer-events: none;
      `;
      document.body.appendChild(overlay);
      
      // Fade to black
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
      });
      
      // Navigate after fade completes
      setTimeout(() => {
        onNavigate.navigateToAbout();
        // Remove overlay after navigation
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(overlay);
            setIsTransitioning(false);
          }, 300);
        }, 100);
      }, 300);
    } else if (onNavigate.navigateToAbout) {
      onNavigate.navigateToAbout();
    }
  };

  const navItems = [
    { name: 'Home', action: onNavigate.navigateToHome, isActive: currentSection === 'hero' },
    { name: 'Work', action: onNavigate.navigateToProjects, isActive: currentSection === 'projects' },
    { name: 'About', action: handleAboutNavigation, isActive: currentSection === 'about' }
  ];

  const handleResumeClick = () => {
    // Open resume in new window/tab - user can replace with actual resume URL
    window.open('#', '_blank');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/90 backdrop-blur-lg border-b border-slate-800' 
          : 'bg-transparent'
      } ${isTransitioning ? 'pointer-events-none' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center py-4 relative">
          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <motion.button
                key={item.name}
                onClick={item.action || (() => {})}
                whileHover={{ y: -2 }}
                className={`transition-colors duration-300 relative group ${
                  item.isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
                disabled={isTransitioning}
              >
                {item.name}
                <span className={`absolute bottom-0 left-0 h-px bg-purple-400 transition-all duration-300 ${
                  item.isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </motion.button>
            ))}
          </div>

          {/* Logo - Positioned absolutely to left */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute left-0 text-2xl font-bold text-white cursor-pointer"
            onClick={onNavigate.navigateToHome}
          >
            SA
          </motion.div>

          {/* Resume Button - Positioned absolutely to right on desktop */}
          <div className="absolute right-0 hidden md:block">
            <Button
              onClick={handleResumeClick}
              variant="outline"
              className="bg-transparent border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white transition-all duration-300"
              disabled={isTransitioning}
            >
              Resume
            </Button>
          </div>

          {/* Mobile Menu Button - Positioned absolutely to right on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden absolute right-0 text-white focus:outline-none"
            disabled={isTransitioning}
          >
            <div className="space-y-1">
              <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800 pt-4 pb-6"
          >
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  if (item.action) item.action();
                  setIsMobileMenuOpen(false);
                }}
                className={`block py-2 transition-colors duration-300 text-center w-full ${
                  item.isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
                disabled={isTransitioning}
              >
                {item.name}
              </button>
            ))}
            {/* Resume button in mobile menu */}
            <div className="pt-4">
              <Button
                onClick={() => {
                  handleResumeClick();
                  setIsMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full bg-transparent border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white transition-all duration-300"
                disabled={isTransitioning}
              >
                Resume
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;
