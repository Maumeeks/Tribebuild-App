
import React from 'react';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import TribeBuildLogo from './TribeBuildLogo';

const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-brand-blue/10 dark:border-white/5 pt-20 pb-10 transition-colors">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* Logo + Descrição */}
          <div className="mb-10 max-w-xl">
            <div className="flex items-center justify-center mb-6">
              <TribeBuildLogo size="lg" showText={true} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              A plataforma definitiva para criadores digitais transformarem seus infoprodutos em experiências mobile exclusivas. Sem código, sem complicações.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-10">
            <a href="#termos" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-coral transition-colors uppercase tracking-widest">
              Termos de Uso
            </a>
            <a href="#privacidade" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-coral transition-colors uppercase tracking-widest">
              Política de Privacidade
            </a>
            <a href="#cookies" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-coral transition-colors uppercase tracking-widest">
              Cookies
            </a>
            <a href="#suporte" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-coral transition-colors uppercase tracking-widest">
              Central de Ajuda
            </a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-5 mb-12">
            {[
              { icon: Instagram, href: 'https://instagram.com/tribebuild', label: 'Instagram' },
              { icon: Twitter, href: '#', label: 'Twitter' },
              { icon: Facebook, href: '#', label: 'Facebook' },
              { icon: Youtube, href: '#', label: 'Youtube' },
            ].map((social, idx) => (
              <a 
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-brand-blue dark:hover:text-brand-coral hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-300 group"
                aria-label={social.label}
              >
                <social.icon size={22} className="group-hover:scale-110 transition-transform" />
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mb-8"></div>

          {/* Copyright */}
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} TribeBuild SaaS. Desenvolvido com foco em alta performance para infoprodutores.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
