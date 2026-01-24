import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Edit2, Trash2, X, Upload, HelpCircle, Link as LinkIcon, AlertCircle, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';

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
  _count?: { modules: number };
}

export default function ProductsPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Para saber se é edição

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

  useEffect(() => { if (appId) fetchProducts(); }, [appId]);

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
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  // Abrir Modal para Criar
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '', offer_type: 'main', release_type: 'immediate',
      release_value: '', platform_product_id: '', checkout_url: '', image: null
    });
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEdit = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation(); // Não abrir o card
    setEditingProduct(product);
    setFormData({
      name: product.name,
      offer_type: product.offer_type,
      release_type: product.release_type,
      release_value: product.release_value || '',
      platform_product_id: product.platform_product_id || '',
      checkout_url: product.checkout_url || '',
      image: product.image_url
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name) return alert('Nome é obrigatório');

    setIsSubmitting(true);
    try {
      const payload = {
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
      };

      if (editingProduct) {
        // Update
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }

      await fetchProducts();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Tem certeza? Isso apagará todas as aulas deste produto.')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in font-['inter']">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Produtos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie o catálogo do seu aplicativo.</p>
        </div>
        <Button onClick={handleOpenCreate} size="lg" className="shadow-lg shadow-brand-blue/20">
          <Plus className="w-5 h-5 mr-2" /> Novo Produto
        </Button>
      </div>

      {/* Busca */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all text-slate-900 dark:text-white shadow-sm"
        />
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 gap-4">
        {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
          <div
            key={product.id}
            // ✅ Clique no CARD leva para GESTÃO DE CONTEÚDO (Módulos/Aulas)
            onClick={() => navigate(`/dashboard/apps/${appId}/products/${product.id}`)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-6 hover:border-brand-blue/50 hover:shadow-lg transition-all cursor-pointer group"
          >
            {/* Imagem */}
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
              {product.image_url ? (
                <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <Package className="w-8 h-8 text-slate-400" />
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">{product.name}</h3>
                <Badge type={product.offer_type} />
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>{product._count?.modules || 0} Módulos</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>{product.release_type === 'immediate' ? 'Liberação Imediata' : product.release_type === 'days' ? `${product.release_value} dias após compra` : `Em ${product.release_value}`}</span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-100 dark:border-slate-800">
              {/* ✅ Clique no LÁPIS abre MODAL DE EDIÇÃO */}
              <button
                onClick={(e) => handleOpenEdit(e, product)}
                className="p-3 text-slate-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                title="Configurações do Produto"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => handleDelete(e, product.id)}
                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                title="Excluir Produto"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL DE CRIAÇÃO/EDIÇÃO (Espaçoso & Z-Index) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col max-h-[90vh] animate-scale-up">

            {/* Header Fixo */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0 z-10">
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                  {editingProduct ? 'Editar Produto' : 'Novo Conteúdo'}
                </h3>
                <p className="text-slate-500 text-sm mt-1">Preencha as informações do produto.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Corpo com Scrollbar Personalizada */}
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900">

              {/* Capa */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-slate-50 dark:bg-slate-900/50 group relative overflow-hidden"
                >
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform mb-2" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Capa</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <span className="text-xs text-slate-400 mt-3">Recomendado: 500x500px</span>
              </div>

              {/* Nome */}
              <div>
                <Label>Nome do Conteúdo *</Label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-blue/20 outline-none text-base font-medium text-slate-900 dark:text-white transition-all"
                  placeholder="Ex: Comunidade Premium"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo Liberação */}
                <div>
                  <Label>Tipo de Liberação</Label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-base text-slate-700 dark:text-slate-300 appearance-none cursor-pointer"
                    value={formData.release_type}
                    onChange={e => setFormData({ ...formData, release_type: e.target.value as any })}
                  >
                    <option value="immediate">Liberação Imediata</option>
                    <option value="days">Dias após a Compra</option>
                    <option value="date">Data Exata</option>
                  </select>
                </div>

                {/* Tipo Oferta */}
                <div>
                  <Label>Tipo de Oferta</Label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-base text-slate-700 dark:text-slate-300 appearance-none cursor-pointer"
                    value={formData.offer_type}
                    onChange={e => setFormData({ ...formData, offer_type: e.target.value as any })}
                  >
                    <option value="main">Produto Principal</option>
                    <option value="bonus">Bônus</option>
                    <option value="order_bump">Order Bump</option>
                    <option value="upsell">Upsell / Downsell</option>
                  </select>
                </div>
              </div>

              {/* Inputs Condicionais */}
              {formData.release_type === 'days' && (
                <div>
                  <Label>Quantos dias após a compra?</Label>
                  <input type="number" placeholder="Ex: 7" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-base"
                    value={formData.release_value} onChange={e => setFormData({ ...formData, release_value: e.target.value })} />
                </div>
              )}
              {formData.release_type === 'date' && (
                <div>
                  <Label>Data de Liberação</Label>
                  <input type="date" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-base"
                    value={formData.release_value} onChange={e => setFormData({ ...formData, release_value: e.target.value })} />
                </div>
              )}
              {(formData.offer_type === 'order_bump' || formData.offer_type === 'upsell') && (
                <div>
                  <Label>Link de Checkout</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="text" className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-base"
                      placeholder="https://pay.kiwify.com.br/..." value={formData.checkout_url} onChange={e => setFormData({ ...formData, checkout_url: e.target.value })} />
                  </div>
                </div>
              )}

              {/* IDs da Plataforma */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <Label>IDs na Plataforma (Webhook)</Label>
                  <span className="text-brand-blue text-xs font-bold cursor-pointer hover:underline flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Como pegar ID?
                  </span>
                </div>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-blue/20 outline-none font-mono text-sm text-slate-600 dark:text-slate-400"
                  placeholder="Cole o ID do produto aqui (Ex: kiwify_123)"
                  value={formData.platform_product_id}
                  onChange={e => setFormData({ ...formData, platform_product_id: e.target.value })}
                />
                <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-brand-blue shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Este ID conecta o pagamento à liberação automática. Cole o ID que aparece na URL ou Webhook da sua plataforma.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer Fixo */}
            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 bg-white dark:bg-slate-900 shrink-0 z-10">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-500">Cancelar</Button>
              <Button onClick={handleSaveProduct} isLoading={isSubmitting} className="px-8 shadow-xl shadow-brand-blue/20">
                {editingProduct ? 'Salvar Alterações' : 'Criar Conteúdo'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Pequeno componente para o Label
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">{children}</label>
);

// Badge de Tipo
const Badge = ({ type }: { type: string }) => {
  const config: any = {
    main: { label: 'Principal', bg: 'bg-blue-500', text: 'text-white' },
    bonus: { label: 'Bônus', bg: 'bg-emerald-500', text: 'text-white' },
    order_bump: { label: 'Order Bump', bg: 'bg-purple-500', text: 'text-white' },
    upsell: { label: 'Upsell', bg: 'bg-orange-500', text: 'text-white' }
  };
  const style = config[type] || config.main;
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${style.bg} ${style.text} bg-opacity-10 text-opacity-100 border border-current`}>
      {style.label}
    </span>
  );
};