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

    if (location.pathname !== '/') {
      navigate('/');
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3 shadow-sm"
          : "bg-transparent border-b border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">

          {/* Logo TribeBuild - Usando Outfit por herança */}
          <Link to="/" className="group flex-shrink-0">
            <TribeBuildLogo size="md" showText={true} />
          </Link>

          {/* Desktop Menu - Usando font-light para contraste elegante */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className="text-[13px] font-bold text-slate-700 dark:text-slate-200 hover:text-brand-blue px-4 py-2 transition-all uppercase tracking-wide"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Buttons - Usando font-black (900) para impacto */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <Link to="/login">
              <Button
                variant="ghost"
                className="font-black text-[11px] uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="primary"
                rightIcon={ArrowRight}
                className="font-black text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-lg shadow-brand-blue/20"
              >
                Comece Agora
              </Button>
            </Link>
          </div>

          {/* Mobile UI */}
          <div className="lg:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 top-[70px] bottom-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ease-in-out z-40 border-t border-slate-100 dark:border-slate-800",
          isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col p-6 h-full overflow-y-auto">
          <nav className="space-y-2 mb-8">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className="block text-xl font-black text-slate-900 dark:text-white py-3 border-b border-slate-50 dark:border-slate-800/50 uppercase tracking-tighter"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-auto space-y-4 pb-8">
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block">
              <Button variant="outline" className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest border-slate-200 dark:border-slate-700">Login</Button>
            </Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block">
              <Button variant="primary" rightIcon={ArrowRight} className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl">
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;