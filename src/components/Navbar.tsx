
import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import TribeBuildLogo from './TribeBuildLogo';
import ThemeToggle from './ThemeToggle';
import { cn } from '../lib/utils';

const menuItems = [
  { label: 'Início', href: '#inicio' },
  { label: 'Apps Demo', href: '#demo-apps' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Integrações', href: '#integracoes' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Preços', href: '#precos' },
  { label: 'FAQ', href: '#faq' },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    // If we are not on the landing page, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      // Delay to allow navigation before scrolling
      setTimeout(() => {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-brand-blue/10 dark:border-white/5 shadow-md py-3" 
          : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo TribeBuild */}
          <Link to="/" className="group">
            <TribeBuildLogo size="md" showText={true} />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-7">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-brand-coral transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-blue dark:bg-brand-coral transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" className="font-bold">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" rightIcon={ArrowRight} className="font-bold">
                COMECE AGORA
              </Button>
            </Link>
          </div>

          {/* Mobile: Theme Toggle + Hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-brand-coral transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800",
          isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 py-8 space-y-6">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.href)}
              className="block text-lg font-bold text-slate-700 dark:text-slate-200 hover:text-brand-blue dark:hover:text-brand-coral transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="grid grid-cols-1 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" className="w-full h-12">Login</Button>
            </Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
              <Button variant="primary" rightIcon={ArrowRight} className="w-full h-12">
                COMECE AGORA
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
