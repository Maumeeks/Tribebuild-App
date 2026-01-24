import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Edit2, Trash2, X, Upload, HelpCircle, Link as LinkIcon, AlertCircle, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';

// Tipagem completa baseada no Husky
interface Product {
  id: string;
  name: string;
  image_url: string | null;
  status: 'draft' | 'published';
  offer_type: 'main' | 'bonus' | 'order_bump' | 'upsell';
  release_type: 'immediate' | 'date' | 'days';
  release_value: string | null;
  platform_product_id: string | null;
  checkout_url: string | null;
  _count?: {
    modules: number;
  };
}

export default function ProductsPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulário
  const [formData, setFormData] = useState({
    name: '',
    offer_type: 'main' as Product['offer_type'],
    release_type: 'immediate' as Product['release_type'],
    release_value: '',
    platform_product_id: '',
    checkout_url: '',
    image: null as string | null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (appId) fetchProducts();
  }, [appId]);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, modules(count)')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map((p: any) => ({
        ...p,
        _count: { modules: p.modules[0]?.count || 0 }
      }));

      setProducts(formattedData);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = async () => {
    if (!formData.name) return alert('Nome é obrigatório');

    // Validação de liberação
    if (formData.release_type !== 'immediate' && !formData.release_value) {
      return alert('Defina a data ou dias para liberação');
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('products').insert([{
        app_id: appId,
        user_id: profile?.id,
        name: formData.name,
        offer_type: formData.offer_type,
        release_type: formData.release_type,
        release_value: formData.release_value,
        platform_product_id: formData.platform_product_id,
        checkout_url: formData.checkout_url,
        image_url: formData.image,
        status: 'published'
      }]).select().single();

      if (error) throw error;

      setProducts([data, ...products]);
      setIsModalOpen(false);
      resetForm();

    } catch (error) {
      console.error(error);
      alert('Erro ao criar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza? Isso apagará todas as aulas deste produto.')) return;
    try {
      await supabase.from('products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', offer_type: 'main', release_type: 'immediate',
      release_value: '', platform_product_id: '', checkout_url: '', image: null
    });
  };

  const getOfferLabel = (type: string) => {
    switch (type) {
      case 'main': return { label: 'Principal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'bonus': return { label: 'Bônus', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
      case 'order_bump': return { label: 'Order Bump', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
      case 'upsell': return { label: 'Upsell', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
      default: return { label: type, color: 'bg-slate-100 text-slate-500' };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in font-['inter']">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gerenciar Produtos</h1>
          <p className="text-slate-500 dark:text-slate-400">Crie e configure o acesso aos seus cursos.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Produto
        </Button>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all text-slate-900 dark:text-white"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4">
        {products.length === 0 && !loading && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-slate-500">Nenhum produto criado ainda.</p>
          </div>
        )}

        {products
          .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((product) => {
            const badge = getOfferLabel(product.offer_type);
            return (
              <div key={product.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-5 hover:border-brand-blue/50 transition-all group shadow-sm">

                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                  {product.image_url ? (
                    <img src={product.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{product.name}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{product._count?.modules || 0} Módulos</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span>Liberação: {product.release_type === 'immediate' ? 'Imediata' : product.release_type === 'days' ? `${product.release_value} dias` : `Em ${product.release_value}`}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* ✅ BOTÃO EDITAR (LÁPIS) CORRIGIDO */}
                  <button
                    onClick={() => navigate(`/dashboard/apps/${appId}/products/${product.id}`)}
                    className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Editar Conteúdo"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          })}
      </div>

      {/* --- MODAL COM Z-INDEX CORRIGIDO --- */}
      {isModalOpen && (
        // ✅ Z-INDEX 100 para ficar acima de qualquer navbar
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">

            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Novo Produto</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">

              {/* Upload */}
              <div className="flex flex-col items-center justify-center mb-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-slate-50 dark:bg-slate-900/50 group"
                >
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover rounded-2xl shadow-sm" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 group-hover:scale-110 transition-transform mb-2" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Logo</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm font-medium text-slate-900 dark:text-white"
                  placeholder="Ex: Comunidade Premium"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Tipo de Liberação */}
              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Tipo de Liberação <HelpCircle className="w-3 h-3 cursor-help text-slate-400" />
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer"
                    value={formData.release_type}
                    onChange={e => setFormData({ ...formData, release_type: e.target.value as any })}
                  >
                    <option value="immediate">Liberação Imediata</option>
                    <option value="days">Dias após a Compra</option>
                    <option value="date">Data Exata</option>
                  </select>
                </div>
              </div>

              {formData.release_type === 'days' && (
                <div className="animate-slide-up">
                  <input
                    type="number"
                    placeholder="Ex: 7 (dias)"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-900 dark:text-white"
                    value={formData.release_value}
                    onChange={e => setFormData({ ...formData, release_value: e.target.value })}
                  />
                </div>
              )}
              {formData.release_type === 'date' && (
                <div className="animate-slide-up">
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-900 dark:text-white"
                    value={formData.release_value}
                    onChange={e => setFormData({ ...formData, release_value: e.target.value })}
                  />
                </div>
              )}

              {/* Tipo de Oferta */}
              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Tipo de Oferta *
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer"
                  value={formData.offer_type}
                  onChange={e => setFormData({ ...formData, offer_type: e.target.value as any })}
                >
                  <option value="main">Produto Principal (Acesso Padrão)</option>
                  <option value="bonus">Bônus (Gratuito/Incluso)</option>
                  <option value="order_bump">Order Bump (Oferta Adicional)</option>
                  <option value="upsell">Upsell / Downsell (Oferta Extra)</option>
                </select>
              </div>

              {/* Link Checkout */}
              {(formData.offer_type === 'order_bump' || formData.offer_type === 'upsell') && (
                <div className="animate-slide-up">
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5">
                    Link de Checkout (Opcional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm text-slate-900 dark:text-white"
                      placeholder="https://pay.kiwify.com.br/..."
                      value={formData.checkout_url}
                      onChange={e => setFormData({ ...formData, checkout_url: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* IDs */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase mb-1.5 justify-between">
                  <span>IDs na Plataforma</span>
                  <span className="text-brand-blue text-[10px] cursor-pointer hover:underline flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Como pegar ID?
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-blue/20 outline-none font-mono text-sm text-slate-900 dark:text-white"
                    placeholder="Cole o ID do produto aqui"
                    value={formData.platform_product_id}
                    onChange={e => setFormData({ ...formData, platform_product_id: e.target.value })}
                  />
                  <button className="px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 font-bold text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">+</button>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950 shrink-0">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateProduct} isLoading={isSubmitting}>Criar Produto</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}