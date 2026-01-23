import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Package, GripVertical, Edit3, Trash2, ChevronDown,
  ChevronUp, Video, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
// Certifique-se de que criou o arquivo CreateProductModal.tsx na pasta components/modals
import CreateProductModal from '../../components/modals/CreateProductModal';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // 1. Carregamento Real do Banco de Dados
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Busca hierárquica: Produtos -> Módulos -> Aulas
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          modules (
            *,
            lessons (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
    </div>
  );

  return (
    <div className="space-y-8 font-sans pb-20 animate-fade-in">
      {/* Header com correção de navegação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-widest mb-2 transition-all">
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Produtos & Conteúdo</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie a entrega de valor da sua tribo.</p>
        </div>
        <Button onClick={() => setIsProductModalOpen(true)} size="sm" leftIcon={Plus}>Novo Produto</Button>
      </div>

      {/* Listagem de Produtos Otimizada para Mobile */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhum produto encontrado.</p>
            <button onClick={() => setIsProductModalOpen(true)} className="text-brand-blue text-sm font-bold mt-2 hover:underline">
              Crie seu primeiro produto
            </button>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {product.thumbnail_url ? (
                    <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 dark:text-white text-base truncate uppercase">{product.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {product.modules?.length || 0} Módulos vinculados
                  </p>
                </div>

                {/* ✅ AÇÕES SEMPRE VISÍVEIS (Correção do Touch Mobile) */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button className="p-3 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedProducts(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id])}
                    className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl active:scale-90"
                  >
                    {expandedProducts.includes(product.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Conteúdo Expandido (Módulos e Aulas Reais) */}
              {expandedProducts.includes(product.id) && (
                <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-slide-up">
                  {product.modules && product.modules.length > 0 ? (
                    product.modules.map((module: any) => (
                      <div key={module.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <GripVertical className="w-3 h-3 text-slate-300" /> {module.name}
                          </h4>
                          <button className="text-[10px] font-black text-brand-blue uppercase hover:underline">Adicionar Aula</button>
                        </div>

                        {/* Listagem de Aulas do Módulo */}
                        <div className="space-y-2">
                          {module.lessons && module.lessons.length > 0 ? (
                            module.lessons.map((lesson: any) => (
                              <div key={lesson.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                                <Video size={14} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{lesson.name}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-400 italic pl-5">Nenhuma aula neste módulo.</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-slate-400 mb-2">Este produto ainda não tem módulos.</p>
                      <Button size="sm" variant="outline" className="text-xs">Criar Primeiro Módulo</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ✅ INJEÇÃO DO MODAL MODULAR: A lógica pesada fica isolada aqui dentro */}
      <CreateProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={() => {
          fetchProducts(); // Recarrega a lista automaticamente após criar
          setIsProductModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProductsPage;