import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Plus, Package, GripVertical, Edit3, Trash2, ChevronDown,
  ChevronUp, Video, Loader2, FileText, Link as LinkIcon, Code
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import { cn } from '../../lib/utils';

// Importação dos Modais
import CreateProductModal from '../../components/modals/CreateProductModal';
import CreateModuleModal from '../../components/modals/CreateModuleModal';
import CreateLessonModal from '../../components/modals/CreateLessonModal';

const offerTypeConfig: Record<string, { label: string, colorClasses: string }> = {
  main: { label: 'Produto Principal', colorClasses: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  bonus: { label: 'Bônus', colorClasses: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  order_bump: { label: 'Order Bump', colorClasses: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  upsell: { label: 'Upsell / Downsell', colorClasses: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' }
};

const getIconForType = (type: string) => {
  if (['pdf', 'file'].includes(type)) return <FileText size={16} />;
  if (['link', 'website'].includes(type)) return <LinkIcon size={16} />;
  if (['html', 'text', 'video_panda'].includes(type)) return <Code size={16} />;
  return <Video size={16} />;
};

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const getAppIdentifier = () => {
    if (params.appSlug) return params.appSlug;
    const pathParts = location.pathname.split('/');
    const appsIndex = pathParts.indexOf('apps');
    if (appsIndex !== -1 && pathParts[appsIndex + 1]) return pathParts[appsIndex + 1];
    return null;
  };

  const appSlug = getAppIdentifier();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);

  // Estados dos Modais
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

  // Estados de Seleção e Edição
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Itens sendo editados
  const [moduleToEdit, setModuleToEdit] = useState<any>(null);
  const [lessonToEdit, setLessonToEdit] = useState<any>(null);

  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let appId = null;
      const cleanSlug = appSlug?.trim();

      if (!cleanSlug) throw new Error("App não identificado.");

      let query = supabase.from('apps').select('id');
      if (isUUID(cleanSlug)) query = query.eq('id', cleanSlug);
      else query = query.eq('slug', cleanSlug);

      const { data: appData, error: appError } = await query.single();
      if (appError || !appData) throw new Error("App não encontrado.");
      appId = appData.id;

      const { data, error } = await supabase
        .from('products')
        .select(`*, modules (*, lessons (*))`)
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sortedData = data?.map(product => ({
        ...product,
        modules: product.modules?.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
          .map((module: any) => ({
            ...module,
            lessons: module.lessons?.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
          }))
      }));

      setProducts(sortedData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appSlug) fetchProducts();
  }, [appSlug]);

  // --- Handlers de AÇÃO ---

  const handleDelete = async (type: 'products' | 'modules' | 'lessons', id: string) => {
    if (!window.confirm('Tem certeza? Essa ação não pode ser desfeita.')) return;
    try {
      const { error } = await supabase.from(type).delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  // Módulos
  const handleCreateModule = (productId: string) => {
    setSelectedProductId(productId);
    setModuleToEdit(null);
    setIsModuleModalOpen(true);
  };
  const handleEditModule = (module: any) => {
    setSelectedProductId(module.product_id);
    setModuleToEdit(module);
    setIsModuleModalOpen(true);
  };

  // Aulas
  const handleCreateLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setLessonToEdit(null);
    setIsLessonModalOpen(true);
  };
  const handleEditLesson = (lesson: any) => {
    setSelectedModuleId(lesson.module_id);
    setLessonToEdit(lesson);
    setIsLessonModalOpen(true);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-brand-blue" /></div>;

  return (
    <div className="space-y-8 font-sans pb-32 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button onClick={() => navigate('/dashboard/apps')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-sm font-bold mb-3 transition-all">
            <ArrowLeft className="w-4 h-4" /> Voltar para Apps
          </button>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Produtos do Seu App</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base mt-2">Gerencie produtos e conteúdos.</p>
        </div>
        <Button onClick={() => setIsProductModalOpen(true)} size="lg" leftIcon={Plus} className="shadow-lg shadow-blue-500/20 font-bold px-6">
          Novo Produto
        </Button>
      </div>

      {/* Listagem */}
      <div className="space-y-6">
        {products.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum produto criado</h3>
            <Button onClick={() => setIsProductModalOpen(true)} size="lg" leftIcon={Plus} className="font-bold">Criar Primeiro Produto</Button>
          </div>
        ) : (
          products.map((product) => {
            const offerConfig = offerTypeConfig[product.offer_type] || offerTypeConfig['main'];
            const isExpanded = expandedProducts.includes(product.id);

            return (
              <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="p-6 flex items-center gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {product.thumbnail_url ? <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-slate-400" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{product.name}</h3>
                      <span className={cn("px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider", offerConfig.colorClasses)}>{offerConfig.label}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {product.modules?.length === 0 ? 'Nenhum conteúdo' : `${product.modules?.length} módulos · ${product.modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0)} aulas`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDelete('products', product.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hidden sm:block">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => setExpandedProducts(prev => isExpanded ? prev.filter(id => id !== product.id) : [...prev, product.id])} className={cn("p-2.5 rounded-xl transition-all ml-2", isExpanded ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>
                      {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-8 animate-slide-up">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Conteúdo</h4>
                      <Button onClick={() => handleCreateModule(product.id)} size="sm" leftIcon={Plus} className="font-bold text-xs px-4 py-2.5 shadow-sm">
                        Novo Módulo
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {product.modules && product.modules.length > 0 ? (
                        product.modules.map((module: any) => (
                          <div key={module.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group/module">
                            <div className="p-4 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white">{module.name}</h5>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Botões de Módulo Ativos */}
                                <div className="flex items-center gap-1 mr-2 opacity-0 group-hover/module:opacity-100 transition-opacity">
                                  <button onClick={() => handleEditModule(module)} className="p-1.5 text-slate-400 hover:text-brand-blue rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit3 size={14} /></button>
                                  <button onClick={() => handleDelete('modules', module.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
                                </div>
                                <button onClick={() => handleCreateLesson(module.id)} className="text-[11px] font-bold text-brand-blue uppercase hover:underline flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900">
                                  <Plus size={12} /> Aula
                                </button>
                              </div>
                            </div>

                            <div className="p-2 space-y-1">
                              {module.lessons && module.lessons.length > 0 ? (
                                module.lessons.map((lesson: any) => (
                                  <div key={lesson.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group/lesson px-4">
                                    <div className="text-brand-blue dark:text-blue-400">
                                      {getIconForType(lesson.content_type)}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1 truncate">{lesson.name}</span>

                                    {/* Botões de Aula Ativos */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                      <button onClick={() => handleEditLesson(lesson)} className="p-1.5 text-slate-400 hover:text-brand-blue rounded hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-colors"><Edit3 size={14} /></button>
                                      <button onClick={() => handleDelete('lessons', lesson.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-colors"><Trash2 size={14} /></button>
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
                          <p className="text-sm text-slate-500 font-medium mb-3">Nenhum módulo criado</p>
                          <Button onClick={() => handleCreateModule(product.id)} size="sm" variant="outline" leftIcon={Plus} className="font-bold text-xs">
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

      <CreateProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSuccess={() => { fetchProducts(); setIsProductModalOpen(false); }} />

      {/* Modais recebendo dados de Edição */}
      <CreateModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        productId={selectedProductId}
        moduleToEdit={moduleToEdit}
        onSuccess={() => { fetchProducts(); setIsModuleModalOpen(false); }}
      />

      <CreateLessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        moduleId={selectedModuleId}
        lessonToEdit={lessonToEdit}
        onSuccess={() => { fetchProducts(); setIsLessonModalOpen(false); }}
      />
    </div>
  );
};

export default ProductsPage;