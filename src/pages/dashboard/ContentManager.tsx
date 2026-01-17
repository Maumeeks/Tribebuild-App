
import React, { useState } from 'react';
import { Plus, Files, Video, BookOpen, MoreVertical, Search, Filter } from 'lucide-react';
import Button from '../../components/Button';

const ContentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'feed'>('products');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-white">Gerenciar Conteúdo</h1>
          <p className="text-slate-500">Cursos, Ebooks, Vídeos e Posts</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" className="gap-2"><Search className="w-4 h-4" /> Buscar</Button>
           <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Conteúdo</Button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Produtos Digitais
        </button>
        <button 
          onClick={() => setActiveTab('feed')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Feed / Blog
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
             <Filter className="w-4 h-4 text-slate-400" />
             <span className="text-sm font-bold text-slate-500">Filtros: Todos os apps, Mais recentes</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Título</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">App</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Preço</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { title: 'Ebook: O Guia do Mindset', type: 'ebook', app: 'Mentalidade Venc.', price: 'R$ 47,00', icon: BookOpen },
                { title: 'Aula 01: Primeiros Passos', type: 'video', app: 'Mkt Expert', price: 'Free', icon: Video },
                { title: 'Curso Completo Copywriting', type: 'course', app: 'Mkt Expert', price: 'R$ 297,00', icon: Files },
                { title: 'Checklist da Alta Performance', type: 'ebook', app: 'Mentalidade Venc.', price: 'Free', icon: BookOpen },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white dark:text-white">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-slate-500 font-medium capitalize">{item.type}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-slate-900 dark:text-white font-bold">{item.app}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-slate-900 dark:text-white font-bold">{item.price}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-900 dark:text-white dark:text-white">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/50 text-center">
           <button className="text-sm font-bold text-blue-600 hover:underline">Ver todos os registros</button>
        </div>
      </div>
    </div>
  );
};

export default ContentManager;
