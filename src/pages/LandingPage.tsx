
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import NeuralBackground from '../components/NeuralBackground';
import HeroSection from '../components/sections/HeroSection';
import DemoAppsSection from '../components/sections/DemoAppsSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import IntegrationsSection from '../components/sections/IntegrationsSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import PricingSection from '../components/sections/PricingSection';
import FAQSection from '../components/sections/FAQSection';
import CTASection from '../components/sections/CTASection';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    navigate('/register');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors relative">
      {/* Neural Background Global - Fixed, cobre toda a página */}
      <NeuralBackground 
        particleCount={100}
        connectionDistance={150}
        mouseConnectionDistance={180}
        baseSpeed={0.6}
      />

      {/* Conteúdo acima do canvas */}
      <div className="relative z-10">
        <Navbar />
        
        <main>
          {/* Hero Section - sem overlay extra */}
          <HeroSection onCTAClick={handleCTAClick} />

          {/* Demo Apps Section */}
          <DemoAppsSection />

          {/* Features Grid */}
          <FeaturesSection />

          {/* Integrations Carousel */}
          <IntegrationsSection />

          {/* Results / Testimonials Section */}
          <TestimonialsSection />

          {/* Pricing Section */}
          <PricingSection />

          {/* FAQ Section */}
          <FAQSection />

          {/* Final CTA Section */}
          <CTASection />
        </main>

        <Footer />
      </div>

      <WhatsAppButton />
    </div>
  );
};

export default LandingPage;
