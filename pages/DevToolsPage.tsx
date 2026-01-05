import React, { useState } from 'react';
import { 
  FileText, 
  Palette, 
  History, 
  CheckSquare, 
  Copy, 
  Check,
  ExternalLink,
  Code,
  Database,
  Shield,
  Rocket,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

/**
 * Página de Desenvolvimento - Acesso Rápido
 * 
 * Esta página é ESCONDIDA e serve para:
 * 1. Novo chat Claude acessar contexto rapidamente
 * 2. Desenvolvedor ver status do projeto
 * 3. Checklist de pendências
 * 
 * Acesso: /#/dev
 */
export default function DevToolsPage() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('context');

  const copyToClipboard = (text: string, path: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const docs = [
    {
      id: 'context',
      title: 'Contexto do Projeto',
      path: '/src/docs/PROJECT_CONTEXT.md',
      icon: FileText,
      color: 'blue',
      description: 'Visão geral, arquitetura, rotas, credenciais',
      prompt: 'Leia o arquivo /src/docs/PROJECT_CONTEXT.md para entender o contexto completo do projeto TribeBuild.'
    },
    {
      id: 'design',
      title: 'Design System',
      path: '/src/docs/DESIGN_SYSTEM.md',
      icon: Palette,
      color: 'purple',
      description: 'Cores, tipografia, componentes, dark mode',
      prompt: 'Leia o arquivo /src/docs/DESIGN_SYSTEM.md para entender o sistema de design do TribeBuild.'
    },
    {
      id: 'changelog',
      title: 'Changelog',
      path: '/src/docs/CHANGELOG.md',
      icon: History,
      color: 'green',
      description: 'Histórico de todas as versões',
      prompt: 'Leia o arquivo /src/docs/CHANGELOG.md para ver o histórico de atualizações.'
    },
    {
      id: 'todo',
      title: 'Pendências',
      path: '/src/docs/TODO.md',
      icon: CheckSquare,
      color: 'amber',
      description: 'Lista de tarefas por prioridade',
      prompt: 'Leia o arquivo /src/docs/TODO.md para ver as pendências do projeto.'
    }
  ];

  const quickInfo = {
    version: 'v5',
    lastUpdate: 'Dezembro 2024',
    stack: 'React + TypeScript + Vite + Tailwind',
    backend: 'Supabase (planejado)',
    status: 'Frontend completo, backend pendente'
  };

  const credentials = [
    { label: 'Admin', url: '/#/admin/login', email: 'admin@tribebuild.com', password: 'admin123' },
    { label: 'Produtor', url: '/#/login', email: 'qualquer', password: 'qualquer' },
    { label: 'PWA', url: '/#/app/academia-fit/login', email: 'qualquer', password: 'qualquer' }
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center">
              <Code className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TribeBuild DevTools</h1>
              <p className="text-slate-400 text-sm">Página escondida para desenvolvimento</p>
            </div>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400 text-sm">
            <strong>⚠️ Para novo chat Claude:</strong> Peça para ler <code className="bg-amber-500/20 px-1.5 py-0.5 rounded">/src/docs/PROJECT_CONTEXT.md</code> primeiro.
          </div>
        </div>

        {/* Quick Info */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-6 border border-slate-800">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-brand-coral" />
            Status Rápido
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {Object.entries(quickInfo).map(([key, value]) => (
              <div key={key}>
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">{key}</span>
                <p className="text-white font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Documentação */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-blue" />
            Documentação
          </h2>
          
          {docs.map((doc) => {
            const Icon = doc.icon;
            const isExpanded = expandedSection === doc.id;
            
            return (
              <div 
                key={doc.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : doc.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[doc.color]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold">{doc.title}</h3>
                      <p className="text-slate-400 text-sm">{doc.description}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-slate-800 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs uppercase">Caminho</span>
                        <button
                          onClick={() => copyToClipboard(doc.path, doc.path)}
                          className="text-xs text-brand-blue hover:text-brand-coral flex items-center gap-1"
                        >
                          {copiedPath === doc.path ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedPath === doc.path ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <code className="text-sm text-green-400">{doc.path}</code>
                    </div>
                    
                    <div className="bg-slate-800 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs uppercase">Prompt para Claude</span>
                        <button
                          onClick={() => copyToClipboard(doc.prompt, doc.prompt)}
                          className="text-xs text-brand-blue hover:text-brand-coral flex items-center gap-1"
                        >
                          {copiedPath === doc.prompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedPath === doc.prompt ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <p className="text-sm text-slate-300">{doc.prompt}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Credenciais */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-6 border border-slate-800">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-coral" />
            Credenciais de Teste
          </h2>
          <div className="space-y-3">
            {credentials.map((cred) => (
              <div key={cred.label} className="bg-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-brand-blue font-bold">{cred.label}</span>
                  <p className="text-slate-400 text-sm">
                    {cred.email} / {cred.password}
                  </p>
                </div>
                <a 
                  href={cred.url}
                  className="text-xs bg-brand-blue/20 text-brand-blue px-3 py-1.5 rounded-lg hover:bg-brand-blue/30 flex items-center gap-1"
                >
                  Abrir <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Links Rápidos */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-500" />
            Links Úteis
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <a href="https://supabase.com" target="_blank" className="bg-slate-800 rounded-xl p-3 hover:bg-slate-700 transition-colors">
              Supabase →
            </a>
            <a href="https://vercel.com" target="_blank" className="bg-slate-800 rounded-xl p-3 hover:bg-slate-700 transition-colors">
              Vercel →
            </a>
            <a href="https://stripe.com" target="_blank" className="bg-slate-800 rounded-xl p-3 hover:bg-slate-700 transition-colors">
              Stripe →
            </a>
            <a href="https://resend.com" target="_blank" className="bg-slate-800 rounded-xl p-3 hover:bg-slate-700 transition-colors">
              Resend →
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-sm mt-10">
          Esta página não aparece na navegação. Acesso: <code>/#/dev</code>
        </p>

      </div>
    </div>
  );
}
