import React from 'react';
import TribeBuildLogo from './TribeBuildLogo';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          {/* Coluna 1: Marca e Missão */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <TribeBuildLogo />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              A plataforma completa para infoprodutores transformarem cursos em aplicativos profissionais de alta conversão.
            </p>
          </div>

          {/* Coluna 2: Produto */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Produto</h4>
            <ul className="space-y-2">
              <li><a href="#funcionalidades" className="text-slate-500 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue text-sm transition-colors">Funcionalidades</a></li>
              <li><a href="#integracoes" className="text-slate-500 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue text-sm transition-colors">Integrações</a></li>
              <li><a href="#precos" className="text-slate-500 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue text-sm transition-colors">Planos</a></li>
              <li><Link to="/bonus" className="text-slate-500 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue text-sm transition-colors">Bônus Exclusivos</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Legal (Aqui entram seus links futuros) */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/termos" className="text-slate-500 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue text-sm transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacidade" className="text-slate-500 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue text-sm transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/cookies" className="text-slate-500 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue text-sm transition-colors">Cookies</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Suporte */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://wa.me/5561982199922" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-brand-blue dark:text-slate-400 dark:hover:text-brand-blue text-sm transition-colors flex items-center gap-2"
                >
                  Central de Ajuda
                </a>
              </li>
              <li><span className="text-slate-400 text-sm">suporte@tribebuild.pro</span></li>
            </ul>
          </div>
        </div>

        {/* Linha Divisória e Copyright */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 dark:text-slate-500 text-xs text-center md:text-left">
            © {currentYear} TribeBuild Tecnologia Ltda. Todos os direitos reservados. CNPJ: XX.XXX.XXX/0001-XX
          </p>
          <div className="flex gap-4">
            {/* Ícones sociais podem entrar aqui futuramente */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;