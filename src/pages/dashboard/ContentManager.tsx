import React, { useState } from 'react';
import {
  Plus,
  Files,
  Video,
  BookOpen,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Tipos
interface ContentItem {
  id: string;
  title: string;
  type: 'ebook' | 'video' | 'course' | 'post';
  app: string;
  price: string;
  sales: number;
  status: 'published' | 'draft';
}

// Mock Data
const mockContent: ContentItem[] = [
  { id: '1', title: 'Ebook: O Guia do Mindset', type: 'ebook', app: 'Mentalidade Venc.', price: 'R$ 47,00', sales: 1240, status: 'published' },
  { id: '2', title: 'Aula 01: Primeiros Passos', type: 'video', app: 'Mkt Expert', price: 'Gratuito', sales: 0, status: 'published' },
  { id: '3', title: 'Curso Completo Copywriting', type: 'course', app: 'Mkt Expert', price: 'R$ 297,00', sales: 856, status: 'published' },
  { id: '4', title: 'Checklist da Alta Performance', type: 'ebook', app: 'Mentalidade Venc.', price: 'Gratuito', sales: 3400, status: 'draft' },
  { id: '5', title: 'Como criar sua tribo (Post)', type: 'post', app: 'Mkt Expert', price: '-', sales: 0, status: 'published' },
];

const ContentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'feed'>('products');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ebook': return BookOpen;
      case 'video': return Video;
      case 'course': return Files;
      default: return Files;
    }
  };

  const renderTypeBadge = (type: string) => {
    const styles = {
      ebook: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
      video: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      course: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
      post: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    };
    // @ts-ignore
    return <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border", styles[type])}>{type}</span>;
  };

  return (
    <div className="space-y-8 font-['Outfit'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gerenciar Conteúdo</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Biblioteca de cursos, arquivos e publicações.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" leftIcon={Plus} className="text-xs font-bold uppercase tracking-wide">
            Novo Conteúdo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            "px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
            activeTab === 'products'
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
        >
          Produtos Digitais
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={cn(
            "px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
            activeTab === 'feed'
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
        >
          Feed & Blog
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar conteúdo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conteúdo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">App Vinculado</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockContent.map((item) => {
                const Icon = getIcon(item.type);
                return (
                  <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{item.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                            {item.status === 'published' ? 'Publicado' : 'Rascunho'} • {item.sales} vendas
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderTypeBadge(item.type)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                        {item.app}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{item.price}</span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {menuOpenId === item.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                            <div className="absolute right-8 top-0 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-20 animate-slide-up origin-top-right overflow-hidden">
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <Eye className="w-3.5 h-3.5" /> Visualizar
                              </button>
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <Edit3 className="w-3.5 h-3.5" /> Editar
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" /> Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Table */}
      <div className="flex items-center justify-center pt-4">
        <button className="text-xs font-bold text-brand-blue hover:underline">Ver todo o histórico</button>
      </div>

    </div>
  );
};

export default ContentManager;