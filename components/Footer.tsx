import React from 'react';
import TribeBuildLogo from './TribeBuildLogo';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-center justify-center gap-8">
          
          {/* 1. Logo Centralizada */}
          <div className="scale-110">
            <TribeBuildLogo />
          </div>

          {/* 2. Links de Navegação (Centralização Mobile Garantida) */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center px-4">
            <Link 
              to="/" 
              onClick={scrollToTop}
              className="text-sm font-medium text-slate-600 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue transition-colors whitespace-nowrap"
            >
              Termos de Uso
            </Link>
            <Link 
              to="/" 
              onClick={scrollToTop}
              className="text-sm font-medium text-slate-600 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue transition-colors whitespace-nowrap"
            >
              Política de Privacidade
            </Link>
            <Link 
              to="/" 
              onClick={scrollToTop}
              className="text-sm font-medium text-slate-600 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue transition-colors whitespace-nowrap"
            >
              Cookies
            </Link>
            <a 
              href="https://wa.me/5561982199922" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-600 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue transition-colors whitespace-nowrap flex items-center gap-1"
            >
              Central de Ajuda
            </a>
          </nav>

          {/* 3. Copyright */}
          <div className="text-center px-4">
            <p className="text-slate-400 dark:text-slate-500 text-xs">
              © {currentYear} TribeBuild Tecnologia Ltda. Todos os direitos reservados.
            </p>
          </div>
          
        </div>

      </div>
    </footer>
  );
};

export default Footer;