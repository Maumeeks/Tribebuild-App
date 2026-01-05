
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Package,
  GripVertical,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Music,
  Link as LinkIcon,
  File,
  Snowflake,
  X,
  Upload,
  HelpCircle,
  ExternalLink,
  Info,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Tipos
interface Content {
  id: string;
  name: string;
  type: 'video' | 'pdf' | 'audio' | 'link' | 'html' | 'file';
  url?: string;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  logo: string | null;
  releaseType: 'immediate' | 'days_after' | 'exact_date';
  releaseDays?: number;
  releaseDate?: string;
  offerType: 'main' | 'bonus' | 'order_bump' | 'upsell_downsell';
  platformIds: string[];
  salesPageUrl?: string;
  contents: Content[];
}

// Mock de dados iniciais
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Curso Completo de Marketing',
    logo: null,
    releaseType: 'immediate',
    offerType: 'main',
    platformIds: ['d9d7d950-3404-11ef-8ae5-fdd6e681bd5b'],
    contents: [
      { id: 'c1', name: 'Aula 1 - Introdução ao Mercado', type: 'video', url: 'https://youtube.com/...' },
      { id: 'c2', name: 'Aula 2 - Primeiros Passos Estratégicos', type: 'video', url: 'https://youtube.com/...' },
      { id: 'c3', name: 'Workbook de Planejamento (PDF)', type: 'pdf', url: 'https://drive.google.com/...' },
    ]
  },
  {
    id: '2',
    name: 'Bônus: Template de Alta Conversão',
    logo: null,
    releaseType: 'immediate',
    offerType: 'bonus',
    platformIds: [],
    contents: []
  }
];

// Configuração de tipos de oferta
const offerTypeConfig = {
  main: { label: 'Produto principal', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  bonus: { label: 'Bônus', color: 'bg-green-50 text-green-600 border-green-100' },
  order_bump: { label: 'Order Bump', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  upsell_downsell: { label: 'Upsell/Downsell', color: 'bg-orange-50 text-orange-600 border-orange-100' }
};

// Ícones por tipo de conteúdo
const contentTypeIcons = {
  video: Video,
  pdf: FileText,
  audio: Music,
  link: LinkIcon,
  html: FileText,
  file: File
};

const ProductsPage: React.FC = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [expandedProducts, setExpandedProducts] = useState<string[]>(['1']);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'product' | 'content'; id: string; productId?: string } | null>(null);

  // Estado do formulário de novo produto atualizado
  const [newProduct, setNewProduct] = useState({
    name: '',
    releaseType: 'immediate' as 'immediate' | 'days_after' | 'exact_date',
    releaseDays: '',
    releaseDate: '',
    offerType: 'main' as 'main' | 'bonus' | 'order_bump' | 'upsell_downsell',
    platformIds: [''], // Array de IDs
    salesPageUrl: ''
  });

  // Funções para gerenciar múltiplos IDs
  const addPlatformId = () => {
    setNewProduct({
      ...newProduct,
      platformIds: [...newProduct.platformIds, '']
    });
  };

  const removePlatformId = (index: number) => {
    if (newProduct.platformIds.length > 1) {
      setNewProduct({
        ...newProduct,
        platformIds: newProduct.platformIds.filter((_, i) => i !== index)
      });
    }
  };

  const updatePlatformId = (index: number, value: string) => {
    const updated = [...newProduct.platformIds];
    updated[index] = value;
    setNewProduct({ ...newProduct, platformIds: updated });
  };

  // Estado do formulário de novo conteúdo
  const [newContent, setNewContent] = useState({
    name: '',
    type: 'video' as Content['type'],
    url: '',
    description: ''
  });

  const toggleExpand = (productId: string) => {
    setExpandedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddProduct = () => {
    if (!newProduct.name) {
      alert('Digite o nome do produto');
      return;
    }

    if (newProduct.releaseType === 'days_after' && !newProduct.releaseDays) {
      alert('Digite o número de dias para liberação');
      return;
    }

    if (newProduct.releaseType === 'exact_date' && !newProduct.releaseDate) {
      alert('Selecione a data de liberação');
      return;
    }

    // Validação por tipo
    if (newProduct.offerType === 'main' && !newProduct.platformIds.some(id => id.trim())) {
      alert('Digite pelo menos um ID do produto para Produto Principal');
      return;
    }

    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name,
      logo: null,
      releaseType: newProduct.releaseType,
      releaseDays: newProduct.releaseDays ? parseInt(newProduct.releaseDays) : undefined,
      releaseDate: newProduct.releaseDate || undefined,
      offerType: newProduct.offerType,
      platformIds: newProduct.offerType === 'bonus' ? [] : newProduct.platformIds.filter(id => id.trim()),
      salesPageUrl: (newProduct.offerType === 'order_bump' || newProduct.offerType === 'upsell_downsell') ? newProduct.salesPageUrl : undefined,
      contents: []
    };

    setProducts([...products, product]);
    setNewProduct({ 
      name: '', 
      releaseType: 'immediate', 
      releaseDays: '', 
      releaseDate: '', 
      offerType: 'main', 
      platformIds: [''], 
      salesPageUrl: '' 
    });
    setIsProductModalOpen(false);
  };

  const handleAddContent = () => {
    if (!newContent.name || !selectedProductId) return;

    const content: Content = {
      id: Math.random().toString(36).substr(2, 9),
      name: newContent.name,
      type: newContent.type,
      url: newContent.url,
      description: newContent.description
    };

    setProducts(products.map(p =>
      p.id === selectedProductId
        ? { ...p, contents: [...p.contents, content] }
        : p
    ));

    setNewContent({ name: '', type: 'video', url: '', description: '' });
    setIsContentModalOpen(false);
    setSelectedProductId(null);
  };

  const openContentModal = (productId: string) => {
    setSelectedProductId(productId);
    setIsContentModalOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'product') {
      setProducts(products.filter(p => p.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'content' && itemToDelete.productId) {
      setProducts(products.map(p =>
        p.id === itemToDelete.productId
          ? { ...p, contents: p.contents.filter(c => c.id !== itemToDelete.id) }
          : p
      ));
    }

    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-10 font-['Inter']">
      {/* Header com Botão Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-slide-up">
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard/apps')}
            className="group inline-flex items-center gap-2 text-slate-400 hover:text-brand-blue font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-50 group-hover:text-brand-blue transition-colors">
                <ArrowLeft className="w-4 h-4" />
            </div>
            Voltar para Meus Apps
          </button>
          <h1 className="text-3xl font-black text-brand-blue tracking-tighter">Produtos do Seu App</h1>
          <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
            Gerencie os produtos e conteúdos do seu aplicativo. Arraste os itens para reordená-los conforme sua preferência de exibição para os alunos.
          </p>
        </div>
        <Button
          onClick={() => setIsProductModalOpen(true)}
          className="h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </Button>
      </div>

      {/* Grid de Produtos ou Estado Vazio */}
      {products.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-16 text-center shadow-sm animate-fade-in">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Snowflake className="w-10 h-10 text-brand-blue" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Você ainda não criou nenhum produto.
          </h3>
          <p className="text-slate-500 mb-10 max-w-md mx-auto font-medium leading-relaxed">
            Adicione cursos, mentorias ou bônus para começar a organizar o conteúdo premium do seu aplicativo.
          </p>
          <Button
            onClick={() => setIsProductModalOpen(true)}
            className="h-14 px-10 font-black uppercase tracking-widest text-xs"
          >
            <Plus className="w-5 h-5" />
            Criar meu primeiro produto
          </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header do Produto / Accordion Trigger */}
              <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                {/* Drag & Identity */}
                <div className="flex items-center gap-4 flex-1">
                    <button className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1">
                        <GripVertical className="w-5 h-5" />
                    </button>

                    {product.logo ? (
                    <img src={product.logo} alt={product.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                    ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                        <Package className="w-7 h-7 text-slate-400" />
                    </div>
                    )}

                    <div className="min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none">{product.name}</h3>
                        <div className="flex flex-col gap-1 mt-2">
                            <div className="flex flex-wrap items-center gap-3">
                                {product.platformIds.length > 0 && (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700 font-mono">
                                    {product.platformIds.length} ID{product.platformIds.length > 1 ? 's' : ''} vinculado{product.platformIds.length > 1 ? 's' : ''}
                                </span>
                                )}
                                <span className={cn(
                                    "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border",
                                    offerTypeConfig[product.offerType].color
                                )}>
                                    {offerTypeConfig[product.offerType].label}
                                </span>
                            </div>
                            {product.salesPageUrl && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                    <ExternalLink className="w-3 h-3" />
                                    <a href={product.salesPageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue truncate max-w-[240px]">
                                        {product.salesPageUrl}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ações do Produto */}
                <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                  <button className="p-3 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-xl transition-all" title="Editar informações do produto">
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete({ type: 'product', id: product.id });
                      setDeleteModalOpen(true);
                    }}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Remover produto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleExpand(product.id)}
                    className={cn(
                        "p-3 rounded-xl transition-all",
                        expandedProducts.includes(product.id) 
                            ? "bg-slate-900 text-white shadow-lg" 
                            : "bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    {expandedProducts.includes(product.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Conteúdos do Produto (Expandido) */}
              {expandedProducts.includes(product.id) && (
                <div className="border-t border-slate-50 p-8 bg-slate-50/30 animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Conteúdos Cadastrados</h4>
                    </div>
                    <button
                      onClick={() => openContentModal(product.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-brand-blue text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Novo Conteúdo
                    </button>
                  </div>

                  {product.contents.length === 0 ? (
                    <div className="text-center py-10 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 text-sm font-medium">Nenhum conteúdo adicionado a este produto ainda.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {product.contents.map((content) => {
                        const Icon = contentTypeIcons[content.type] || File;
                        return (
                          <div
                            key={content.id}
                            className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 hover:shadow-md transition-all"
                          >
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                              <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="block text-sm font-bold text-slate-700 truncate">{content.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{content.type}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                onClick={() => {
                                    setItemToDelete({ type: 'content', id: content.id, productId: product.id });
                                    setDeleteModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Novo Produto */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Novo Produto</h3>
                <p className="text-sm text-slate-400 font-medium">Categorize seu conteúdo premium</p>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Logo / Capa do Produto */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Logo / Capa do Produto</label>
                <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-10 text-center hover:border-brand-blue hover:bg-blue-50/30 transition-all cursor-pointer group">
                  <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3 group-hover:scale-110 group-hover:text-brand-blue transition-all" />
                  <p className="text-slate-900 dark:text-white font-black text-sm tracking-tight">Arraste ou clique para upload</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">Recomendado: 1:1 (Quadrado)</p>
                </div>
              </div>

              {/* Nome do Produto */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nome do Produto <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ex: Expert Digital Mastery"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                />
              </div>

              {/* Liberação e Tipo de Oferta */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Liberação
                    <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                  </label>
                  <select
                    value={newProduct.releaseType}
                    onChange={(e) => setNewProduct({ 
                      ...newProduct, 
                      releaseType: e.target.value as any,
                      releaseDays: '',
                      releaseDate: ''
                    })}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
                  >
                    <option value="immediate">Imediata</option>
                    <option value="days_after">Dias após compra</option>
                    <option value="exact_date">Data fixa</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Tipo de Oferta
                    <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                  </label>
                  <select
                    value={newProduct.offerType}
                    onChange={(e) => setNewProduct({ ...newProduct, offerType: e.target.value as any })}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
                  >
                    <option value="main">Principal</option>
                    <option value="bonus">Bônus</option>
                    <option value="order_bump">Order Bump</option>
                    <option value="upsell_downsell">Upsell/Downsell</option>
                  </select>
                </div>
              </div>

              {/* Dias após a compra */}
              {newProduct.releaseType === 'days_after' && (
                <div className="animate-fade-in">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Dias após a compra <span className="text-red-400">*</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProduct.releaseDays}
                    onChange={(e) => setNewProduct({ ...newProduct, releaseDays: e.target.value })}
                    placeholder="Ex: 7"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed">
                    O produto será liberado automaticamente após o número de dias especificado
                  </p>
                </div>
              )}

              {/* Data fixa */}
              {newProduct.releaseType === 'exact_date' && (
                <div className="animate-fade-in">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Data de liberação <span className="text-red-400">*</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                  </label>
                  <input
                    type="date"
                    value={newProduct.releaseDate}
                    onChange={(e) => setNewProduct({ ...newProduct, releaseDate: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold transition-all"
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed">
                    O produto será liberado na data especificada
                  </p>
                </div>
              )}

              {/* IDs do Produto na Plataforma */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    IDs do Produto na Plataforma
                    <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                  </label>
                  <a href="#" className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Como obter?
                  </a>
                </div>

                <div className="space-y-3">
                  {newProduct.platformIds.map((id, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                      <input
                        type="text"
                        value={id}
                        onChange={(e) => updatePlatformId(index, e.target.value)}
                        placeholder="Digite o ID do produto"
                        disabled={newProduct.offerType === 'bonus'}
                        className={cn(
                          "flex-1 px-5 py-4 border rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all",
                          newProduct.offerType === 'bonus' 
                            ? "bg-slate-100 dark:bg-slate-700 border-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-slate-50 dark:bg-slate-900 border-slate-100 text-slate-900 dark:text-white focus:border-brand-blue"
                        )}
                      />
                      {newProduct.platformIds.length > 1 && newProduct.offerType !== 'bonus' && (
                        <button
                          onClick={() => removePlatformId(index)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Remover ID"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      {index === newProduct.platformIds.length - 1 && newProduct.offerType !== 'bonus' && (
                        <button
                          onClick={addPlatformId}
                          className="p-3 text-brand-blue hover:bg-blue-50 rounded-xl transition-all border border-blue-100 bg-white shadow-sm"
                          title="Adicionar outro ID"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  {newProduct.offerType === 'bonus' 
                    ? 'Campo desabilitado para produtos do tipo Bônus (liberação vinculada ao item pai).'
                    : 'Este ID é usado para vincular vendas da Hotmart, Kiwify ou Eduzz ao acesso neste produto específico.'
                  }
                </p>
              </div>

              {/* URL da Página de Vendas (Upsell/Order Bump) */}
              {(newProduct.offerType === 'upsell_downsell' || newProduct.offerType === 'order_bump') && (
                <div className="animate-fade-in">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    URL da Página de Vendas <span className="text-red-400">*</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                  </label>
                  <input
                    type="url"
                    value={newProduct.salesPageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, salesPageUrl: e.target.value })}
                    placeholder="Ex: https://minhaloja.com.br/produto"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed">
                    Quando preenchido, o usuário será redirecionado para esta URL ao clicar no produto dentro do aplicativo.
                  </p>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 sticky bottom-0">
              <Button
                variant="ghost"
                onClick={() => setIsProductModalOpen(false)}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddProduct}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20"
              >
                Criar Produto Agora
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Conteúdo */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsContentModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Novo Conteúdo</h3>
                <p className="text-sm text-slate-400 font-medium">Adicione aulas ou materiais</p>
              </div>
              <button onClick={() => setIsContentModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Upload Capa */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Miniatura do Conteúdo</label>
                <div className="border-4 border-dashed border-slate-100 rounded-3xl p-10 text-center hover:border-brand-blue hover:bg-blue-50/30 transition-all cursor-pointer group">
                  <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3 group-hover:scale-110 group-hover:text-brand-blue transition-all" />
                  <p className="text-slate-900 dark:text-white font-black text-sm tracking-tight">Clique para carregar</p>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Título do Conteúdo <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newContent.name}
                  onChange={(e) => setNewContent({ ...newContent, name: e.target.value })}
                  placeholder="Ex: Aula 01 - O Começo de Tudo"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tipo de Entrega <span className="text-red-400">*</span></label>
                <select
                  value={newContent.type}
                  onChange={(e) => setNewContent({ ...newContent, type: e.target.value as any })}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
                >
                  <option value="video">Vídeo (YouTube/Vimeo/Vturb)</option>
                  <option value="pdf">PDF (Link do Google Drive)</option>
                  <option value="audio">Áudio (MP3/Spotify)</option>
                  <option value="link">Link Externo</option>
                  <option value="html">Código HTML</option>
                  <option value="file">Arquivo para Download</option>
                </select>
              </div>

              {/* URL */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Link do Conteúdo <span className="text-red-400">*</span></label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                        <LinkIcon className="w-5 h-5" />
                    </div>
                    <input
                    type="url"
                    value={newContent.url}
                    onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
                    />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Breve Descrição (Opcional)</label>
                <textarea
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  placeholder="O que o aluno vai aprender aqui?"
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:outline-none font-bold resize-none transition-all"
                />
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 sticky bottom-0">
              <Button
                variant="ghost"
                onClick={() => setIsContentModalOpen(false)}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddContent}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20"
              >
                Publicar Conteúdo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-slide-up overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
              Remover permanentemente?
            </h3>
            <p className="text-slate-500 text-center mb-10 font-medium leading-relaxed">
              Você está prestes a apagar um {itemToDelete?.type === 'product' ? 'produto inteiro' : 'conteúdo'}. Esta ação é <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">irreversível</span>.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 transition-all active:scale-95"
              >
                Sim, apagar permanentemente
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="w-full py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Cancelar e Manter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
