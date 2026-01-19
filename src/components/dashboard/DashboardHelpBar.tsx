import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, X } from 'lucide-react';

interface DashboardHelpBarProps {
  onClose: () => void;
}

const DashboardHelpBar: React.FC<DashboardHelpBarProps> = ({ onClose }) => {
  return (
    <div className="bg-brand-blue text-white py-3 px-4 relative z-[60]">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs md:text-sm text-center">
        <HelpCircle className="w-4 h-4 flex-shrink-0" />
        <p>
          <span>Ficou com dúvidas? Acesse a </span>
          {/* ✅ CORREÇÃO: Uso de Link para navegação interna rápida */}
          <Link
            to="/academia"
            className="font-black underline hover:text-blue-200 transition-colors uppercase tracking-tight"
          >
            Academia TribeBuild
          </Link>
          <span> para tutoriais detalhados!</span>
        </p>
      </div>
      <button
        onClick={onClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        aria-label="Fechar barra de ajuda"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default DashboardHelpBar;