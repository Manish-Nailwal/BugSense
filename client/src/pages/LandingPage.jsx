import React from 'react';
import HeroSection from '../features/landing/HeroSection';
import SocraticMockup from '../features/landing/SocraticMockup';
import FeaturesSection from '../features/landing/FeaturesSection';
import FocusGrowthBlock from '../features/landing/FocusGrowthBlock';
import Footer from '../features/landing/Footer';

const LandingPage = () => {
  return (
    <div className="w-full bg-white dark:bg-[#09090b] transition-colors duration-500 flex flex-col pt-0">
      {/* Glow effects for dark mode */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[500px] bg-zinc-100 dark:bg-zinc-950/20 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Composed Sections */}
      <HeroSection />
      
      <SocraticMockup />
      
      <FeaturesSection />
      
      <FocusGrowthBlock />
      
      <Footer />
    </div>
  );
};

export default LandingPage;
