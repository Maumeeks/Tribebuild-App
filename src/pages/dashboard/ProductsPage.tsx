import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  Upload,
  HelpCircle,
  ExternalLink,
  Info,
  Clock,
  Calendar,
  MoreHorizontal
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
  thumbnail?: string | null;
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
  main: { label: 'Principal', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30' },
  bonus: { label: 'Bônus', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' },
  order_bump: { label: 'Order Bump', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30' },
  upsell_downsell: { label: 'Upsell', color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30' }
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
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [expandedProducts, setExpandedProducts] = useState<string[]>(['1']);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'product' | 'content'; id: string; productId?: string } | null>(null);

  // Refs para Upload
  const productLogoInputRef = useRef<HTMLInputElement>(null);
  const contentThumbnailInputRef = useRef<HTMLInputElement>(null);

  // Estado do formulário de novo produto
  const [newProduct, setNewProduct] = useState({
    name: '',
    logo: null as string | null,
    releaseType: 'immediate' as 'immediate' | 'days_after' | 'exact_date',
    releaseDays: '',
    releaseDate: '',
    offerType: 'main' as 'main' | 'bonus' | 'order_bump' | 'upsell_downsell',
    platformIds: [''],
    salesPageUrl: ''
  });

  // Estado do formulário de novo conteúdo
  const [newContent, setNewContent] = useState({
    name: '',
    type: 'video' as Content['type'],
    url: '',
    description: '',
    thumbnail: null as string | null
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

  const toggleExpand = (productId: string) => {
    setExpandedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Upload Handlers
  const handleProductLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewContent(prev => ({ ...prev, thumbnail: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name) {
      alert('Digite o nome do produto');
      return;
    }

    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name,
      logo: newProduct.logo,
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
      logo: null,
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
      description: newContent.description,
    };

    setProducts(products.map(p =>
      p.id === selectedProductId
        ? { ...p, contents: [...p.contents, content] }
        : p
    ));

    setNewContent({ name: '', type: 'video', url: '', description: '', thumbnail: null });
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
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard/apps')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold uppercase tracking-wide mb-2 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Produtos & Conteúdo</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Organize cursos, módulos e aulas do seu app.</p>
        </div>
        <Button onClick={() => setIsProductModalOpen(true)} size="sm" leftIcon={Plus} className="text-xs font-bold uppercase tracking-wide">
          Novo Produto
        </Button>
      </div>

      {/* Grid de Produtos */}
      {products.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Nenhum produto criado</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto text-sm">Comece criando um curso ou material para organizar seu conteúdo.</p>
          <Button onClick={() => setIsProductModalOpen(true)} size="sm">Criar Primeiro Produto</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              {/* Header do Produto */}
              <div className="p-5 flex items-center gap-4">
                <button className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </button>

                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                  {product.logo ? (
                    <img src={product.logo} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{product.name}</h3>
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border", offerTypeConfig[product.offerType].color)}>
                      {offerTypeConfig[product.offerType].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><File className="w-3 h-3" /> {product.contents.length} conteúdos</span>
                    {product.platformIds.length > 0 && (
                      <span className="flex items-center gap-1"><Info className="w-3 h-3" /> {product.platformIds.length} IDs vinculados</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                  <button
                    onClick={() => { setItemToDelete({ type: 'product', id: product.id }); setDeleteModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleExpand(product.id)}
                    className={cn("p-2 rounded-lg transition-colors", expandedProducts.includes(product.id) ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}
                  >
                    {expandedProducts.includes(product.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Conteúdos (Expandido) */}
              {expandedProducts.includes(product.id) && (
                <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-5 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conteúdo do Produto</h4>
                    <button
                      onClick={() => openContentModal(product.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-blue-700 bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Aula
                    </button>
                  </div>

                  {product.contents.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      <p className="text-xs text-slate-400">Nenhum conteúdo adicionado.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {product.contents.map((content) => {
                        const Icon = contentTypeIcons[content.type] || File;
                        return (
                          <div key={content.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-300 dark:hover:border-slate-700 transition-colors group">
                            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{content.name}</p>
                              <p className="text-[10px] text-slate-400 uppercase">{content.type}</p>
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button
                                onClick={() => { setItemToDelete({ type: 'content', id: content.id, productId: product.id }); setDeleteModalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal: Novo Produto (Simplified) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Novo Produto</h3>
              <button onClick={() => setIsProductModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nome do Produto</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                  placeholder="Ex: Curso Master"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tipo de Oferta</label>
                  <select
                    value={newProduct.offerType}
                    onChange={(e) => setNewProduct({ ...newProduct, offerType: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none"
                  >
                    <option value="main">Principal</option>
                    <option value="bonus">Bônus</option>
                    <option value="upsell_downsell">Upsell</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Liberação</label>
                  <select
                    value={newProduct.releaseType}
                    onChange={(e) => setNewProduct({ ...newProduct, releaseType: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none"
                  >
                    <option value="immediate">Imediata</option>
                    <option value="days_after">Dias após</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button onClick={() => setIsProductModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                <button onClick={handleAddProduct} className="flex-1 py-2.5 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase hover:bg-blue-600 transition-colors shadow-md">Criar Produto</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Conteúdo (Simplified) */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsContentModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-slide-up border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adicionar Conteúdo</h3>
              <button onClick={() => setIsContentModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Título</label>
                <input
                  type="text"
                  value={newContent.name}
                  onChange={(e) => setNewContent({ ...newContent, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                  placeholder="Ex: Aula 01"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tipo</label>
                <select
                  value={newContent.type}
                  onChange={(e) => setNewContent({ ...newContent, type: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                >
                  <option value="video">Vídeo</option>
                  <option value="pdf">PDF</option>
                  <option value="link">Link</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Link / URL</label>
                <input
                  type="text"
                  value={newContent.url}
                  onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                  placeholder="https://..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button onClick={() => setIsContentModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">Cancelar</button>
                <button onClick={handleAddContent} className="flex-1 py-2.5 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase hover:bg-blue-600 shadow-md">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductsPage;