import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Package, GripVertical, Edit3, Trash2, ChevronDown,
  ChevronUp, Video, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import CreateProductModal from '../../components/modals/CreateProductModal';
import { cn } from '../../lib/utils';

// Configuração visual dos tipos de oferta
const offerTypeConfig: Record<string, { label: string, colorClasses: string }> = {
  main: { label: 'Produto Principal', colorClasses: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  bonus: { label: 'Bônus', colorClasses: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  order_bump: { label: 'Order Bump', colorClasses: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  upsell: { label: 'Upsell / Downsell', colorClasses: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' }
};

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { appSlug } = useParams<{ appSlug: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Helper para verificar UUID
  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // 1. Busca Robusta do App (ID ou Slug)
      let appId = null;
      let query = supabase.from('apps').select('id');

      if (appSlug && isUUID(appSlug)) {
        query = query.eq('id', appSlug);
      } else if (appSlug) {
        query = query.eq('slug', appSlug);
      }

      const { data: appData, error: appError } = await query.single();

      if (appError || !appData) throw new Error("App não encontrado.");
      appId = appData.id;

      // 2. Busca produtos filtrados pelo App ID encontrado
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          modules (
            *,
            lessons (*)
          )
        `)
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [appSlug]);

  if (loading) return (
    <div className="flex items-center justify-center p-20 h-[50vh]">
      <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
    </div>
  );

  return (
    <div className="space-y-8 font-sans pb-32 animate-fade-in max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button onClick={() => navigate('/dashboard/apps')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-sm font-bold mb-3 transition-all">
            <ArrowLeft className="w-4 h-4" /> Voltar para Apps
          </button>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Produtos do Seu App</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base mt-2 leading-relaxed max-w-2xl">
            Gerencie os produtos e conteúdos do seu app. Arraste os itens para reordená-los conforme sua preferência.
          </p>
        </div>
        <Button onClick={() => setIsProductModalOpen(true)} size="lg" leftIcon={Plus} className="shadow-lg shadow-blue-500/20 font-bold px-6">
          Novo Produto
        </Button>
      </div>

      {/* Listagem */}
      <div className="space-y-6">
        {products.length === 0 ? (
          // ✅ Estado Vazio Melhorado (Bordas arredondadas corrigidas)
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm animate-scale-in">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum produto criado</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-md mx-auto">
              Comece criando seu primeiro produto (curso, mentoria, ebook) para organizar seu conteúdo.
            </p>
            <Button onClick={() => setIsProductModalOpen(true)} size="lg" leftIcon={Plus} className="font-bold">
              Criar Primeiro Produto
            </Button>
          </div>
        ) : (
          products.map((product) => {
            const offerConfig = offerTypeConfig[product.offer_type] || offerTypeConfig['main'];
            const isExpanded = expandedProducts.includes(product.id);

            return (
              <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                {/* Card Principal */}
                <div className="p-6 flex items-center gap-5">
                  <div className="flex items-center gap-4">
                    <button className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                      <GripVertical className="w-5 h-5" />
                    </button>
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex-shrink-0">
                      {product.thumbnail_url ? (
                        <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{product.name}</h3>
                      {/* Tags */}
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold truncate max-w-[100px] hidden sm:inline-block border border-slate-200 dark:border-slate-700">
                        {product.id.split('-')[0]}...
                      </span>
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", offerConfig.colorClasses)}>
                        {offerConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {product.modules?.length === 0 ? 'Nenhum conteúdo cadastrado' : `${product.modules?.length} módulos · ${product.modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0)} aulas`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hidden sm:block">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hidden sm:block">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setExpandedProducts(prev => isExpanded ? prev.filter(id => id !== product.id) : [...prev, product.id])}
                      className={cn(
                        "p-2.5 rounded-xl transition-all ml-2",
                        isExpanded ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                    </button>
                  </div>
                </div>

                {/* Área de Conteúdo */}
                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-8 animate-slide-up">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Conteúdo</h4>
                      <Button size="sm" leftIcon={Plus} className="font-bold text-xs px-4 py-2.5 shadow-sm">
                        Novo Conteúdo
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {product.modules && product.modules.length > 0 ? (
                        product.modules.map((module: any) => (
                          <div key={module.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white">{module.name}</h5>
                              </div>
                              <button className="text-[11px] font-bold text-brand-blue uppercase hover:underline flex items-center gap-1">
                                <Plus size={14} /> Aula
                              </button>
                            </div>

                            <div className="p-2 space-y-1">
                              {module.lessons && module.lessons.length > 0 ? (
                                module.lessons.map((lesson: any) => (
                                  <div key={lesson.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group/lesson px-4">
                                    <GripVertical className="w-3.5 h-3.5 text-slate-200 opacity-0 group-hover/lesson:opacity-100 transition-opacity cursor-grab" />
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-brand-blue">
                                      <Video size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1 truncate">{lesson.name}</span>
                                    <div className="flex items-center gap-2 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                      <button className="p-1.5 text-slate-400 hover:text-brand-blue rounded"><Edit3 size={16} /></button>
                                      <button className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 size={16} /></button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400 italic p-4 text-center">Nenhuma aula neste módulo.</p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                          <p className="text-sm text-slate-500 font-medium mb-3">Nenhum conteúdo cadastrado</p>
                          <Button size="sm" variant="outline" leftIcon={Plus} className="font-bold text-xs">
                            Criar Primeiro Módulo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <CreateProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={() => {
          fetchProducts();
          setIsProductModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProductsPage;