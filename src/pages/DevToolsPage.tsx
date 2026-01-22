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
  ChevronRight,
  Terminal,
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';

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
      description: 'Visão geral, arquitetura, rotas e credenciais mestre.',
      prompt: 'Leia o arquivo /src/docs/PROJECT_CONTEXT.md para entender o contexto completo do projeto TribeBuild.'
    },
    {
      id: 'design',
      title: 'Design System',
      path: '/src/docs/DESIGN_SYSTEM.md',
      icon: Palette,
      color: 'purple',
      description: 'Cores, tipografia, componentes e guia de estilo Enterprise.',
      prompt: 'Leia o arquivo /src/docs/DESIGN_SYSTEM.md para entender o sistema de design do TribeBuild.'
    },
    {
      id: 'changelog',
      title: 'Changelog',
      path: '/src/docs/CHANGELOG.md',
      icon: History,
      color: 'green',
      description: 'Histórico detalhado de versões e atualizações.',
      prompt: 'Leia o arquivo /src/docs/CHANGELOG.md para ver o histórico de atualizações.'
    },
    {
      id: 'todo',
      title: 'Pendências',
      path: '/src/docs/TODO.md',
      icon: CheckSquare,
      color: 'amber',
      description: 'Roadmap técnico e tarefas pendentes por prioridade.',
      prompt: 'Leia o arquivo /src/docs/TODO.md para ver as pendências do projeto.'
    }
  ];

  const quickInfo = {
    version: 'v5.2 (Enterprise)',
    lastUpdate: 'Janeiro 2026',
    stack: 'React + TS + Vite',
    database: 'Supabase (Ativo)',
    auth: 'Supabase Auth',
    ui: 'Tailwind + Lucide'
  };

  const credentials = [
    { label: 'Super Admin', url: '/#/admin/login', email: 'admin@tribebuild.com', password: 'admin123' },
    { label: 'Produtor Teste', url: '/#/login', email: 'produtor@teste.com', password: 'password123' },
    { label: 'PWA Aluno', url: '/#/app/demo/login', email: 'aluno@teste.com', password: 'password123' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Outfit'] p-6 md:p-12 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

        {/* Header Profissional */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:rotate-12">
              <Terminal className="w-6 h-6 text-white dark:text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Console de Desenvolvedor</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">Ambiente de debug e contexto técnico.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 rounded-lg border border-brand-blue/20">
            <Cpu className="w-4 h-4 text-brand-blue" />
            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">Environment: Dev</span>
          </div>
        </div>

        {/* Alerta de Contexto IA */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex gap-4 items-start animate-slide-up">
          <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-amber-900 dark:text-amber-200 font-bold mb-1 uppercase tracking-tight text-xs">Atenção (Contexto de IA)</p>
            <p className="text-amber-700 dark:text-amber-400 font-medium">
              Para garantir que o modelo de IA entenda este projeto, certifique-se de que ele leu o arquivo <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1.5 py-0.5 rounded font-mono text-xs">/src/docs/PROJECT_CONTEXT.md</code>.
            </p>
          </div>
        </div>

        {/* Grid de Status Rápido */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-slide-up" style={{ animationDelay: '50ms' }}>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-brand-coral" /> Status da Build
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(quickInfo).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <span className="text-slate-400 uppercase text-[9px] font-bold tracking-widest">{key}</span>
                <p className="text-slate-900 dark:text-slate-200 font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Documentação */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
            <FileText className="w-4 h-4 text-brand-blue" /> Documentação do Sistema
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {docs.map((doc, idx) => {
              const Icon = doc.icon;
              const isExpanded = expandedSection === doc.id;

              return (
                <div
                  key={doc.id}
                  className={cn(
                    "bg-white dark:bg-slate-900 rounded-xl border transition-all animate-slide-up overflow-hidden",
                    isExpanded ? "border-brand-blue ring-1 ring-brand-blue/10" : "border-slate-200 dark:border-slate-800"
                  )}
                  style={{ animationDelay: `${100 + (idx * 50)}ms` }}
                >
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : doc.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border",
                        doc.color === 'blue' && "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800",
                        doc.color === 'purple' && "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800",
                        doc.color === 'green' && "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-800",
                        doc.color === 'amber' && "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800",
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{doc.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{doc.description}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 animate-fade-in">
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Caminho do Arquivo</span>
                          <button
                            onClick={() => copyToClipboard(doc.path, doc.path)}
                            className="text-[10px] text-brand-blue font-bold flex items-center gap-1 hover:underline"
                          >
                            {copiedPath === doc.path ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedPath === doc.path ? 'COPIADO' : 'COPIAR'}
                          </button>
                        </div>
                        <code className="text-xs text-emerald-600 dark:text-emerald-400 font-mono break-all">{doc.path}</code>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Prompt para o Chat</span>
                          <button
                            onClick={() => copyToClipboard(doc.prompt, doc.prompt)}
                            className="text-[10px] text-brand-blue font-bold flex items-center gap-1 hover:underline"
                          >
                            {copiedPath === doc.prompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedPath === doc.prompt ? 'COPIADO' : 'COPIAR'}
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">"{doc.prompt}"</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid Inferior: Credenciais e Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Credenciais */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-coral" /> Contas de Teste
            </h2>
            <div className="space-y-3">
              {credentials.map((cred) => (
                <div key={cred.label} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between group">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">{cred.label}</span>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate mt-1">
                      {cred.email} / {cred.password}
                    </p>
                  </div>
                  <a
                    href={cred.url}
                    className="p-2 text-slate-400 hover:text-brand-blue hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all shadow-sm group-hover:translate-x-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Links Rápidos */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-slide-up" style={{ animationDelay: '350ms' }}>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" /> Infraestrutura
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {['hotmart', 'supabase', 'stripe', 'vercel', 'resend', 'kiwify'].map((service) => (
                <a
                  key={service}
                  href={`https://${service}.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:border-brand-blue hover:text-brand-blue transition-all text-center"
                >
                  {service}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center py-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            TribeBuild Internal System • Alpha Version
          </p>
        </div>

      </div>
    </div>
  );
}