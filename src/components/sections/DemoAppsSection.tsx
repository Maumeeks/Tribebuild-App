import React from 'react';
import { ExternalLink, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import ScrollReveal from '../ScrollReveal';

interface DemoApp {
  id: string;
  name: string;
  description: string;
  mockupImage?: string;
  appUrl: string;
  primaryColor: string;
  onlineCount: number;
}

interface DemoAppsSectionProps {
  apps?: DemoApp[];
}

const defaultDemoApps: DemoApp[] = [
  {
    id: 'tiktok-money',
    name: 'Método Milionário com TikTok',
    description: 'Curso completo de TikTok Shop e estratégias de viralização para escalar suas vendas online.',
    appUrl: 'https://demo1.tribebuild.com',
    primaryColor: '#FF6B6B', // Mantendo o Coral da sua marca (combina com o TikTok Pink)
    onlineCount: 342
  },
  {
    id: 'fitness',
    name: 'FitLife Pro',
    description: 'Plataforma de treinos e nutrição com comunidade ativa e acompanhamento personalizado.',
    appUrl: 'https://demo2.tribebuild.com',
    primaryColor: '#10B981', // Emerald
    onlineCount: 89
  }
];

// Mockup Phone Component - Redesigned
const MockupPhone: React.FC<{ color: string; name: string; isFloating?: boolean }> = ({
  color,
  name,
  isFloating = true
}) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={cn(
      "relative mx-auto w-[220px] lg:w-[240px]",
      isFloating && "animate-float"
    )}>
      {/* Phone Frame */}
      <div className="relative bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl shadow-black/50 ring-1 ring-white/10">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-20">
          <div className="absolute top-2 right-6 w-2 h-2 rounded-full bg-slate-800"></div>
        </div>

        {/* Screen */}
        <div className="relative w-full aspect-[9/19] bg-slate-800 rounded-[2rem] overflow-hidden">
          {/* Status Bar */}
          <div className="flex justify-between items-center px-6 py-2 text-[10px] font-medium text-slate-400">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-2 bg-slate-600 rounded-sm"></div>
            </div>
          </div>

          {/* App Header */}
          <div className="px-4 pt-2 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                style={{ backgroundColor: color }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{name}</p>
                <p className="text-[10px] text-slate-400">Área de Membros</p>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="px-4 space-y-3">
            <div
              className="h-24 rounded-2xl opacity-20"
              style={{ backgroundColor: color }}
            ></div>
            <div className="h-14 rounded-xl bg-slate-700/50 shadow-sm border border-white/5"></div>
            <div className="h-14 rounded-xl bg-slate-700/50 shadow-sm border border-white/5"></div>
          </div>

          {/* Bottom Nav */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex justify-around items-center py-3 bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/5">
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color + '30' }}></div>
              <div className="w-6 h-6 rounded-full bg-slate-700"></div>
              <div className="w-6 h-6 rounded-full bg-slate-700"></div>
              <div className="w-6 h-6 rounded-full bg-slate-700"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Buttons */}
      <div className="absolute top-20 -left-0.5 w-1 h-8 bg-slate-800 rounded-l"></div>
      <div className="absolute top-32 -left-0.5 w-1 h-12 bg-slate-800 rounded-l"></div>
      <div className="absolute top-28 -right-0.5 w-1 h-16 bg-slate-800 rounded-r"></div>
    </div>
  );
};

const DemoAppsSection: React.FC<DemoAppsSectionProps> = ({
  apps = defaultDemoApps
}) => {
  return (
    <section id="demo-apps" className="py-24 relative overflow-hidden transition-colors">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500"></div>

      {/* Glow sutil no topo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-transparent to-transparent dark:from-brand-blue/20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-500 font-display">Demos em Tempo Real</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Tudo que você precisa em um{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">só lugar</span>
          </h2>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Esqueça apps genéricos. Tenha uma plataforma completa que carrega sua marca e
            oferece a melhor experiência de consumo para seus clientes.
          </p>
        </ScrollReveal>

        {/* Demo Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {apps.map((app, index) => (
            <ScrollReveal
              key={app.id}
              delay={index * 150}
              className={cn(
                "group relative overflow-hidden",
                "bg-white dark:bg-[#0F172A]", // Cor de fundo mais escura
                "border border-slate-200 dark:border-slate-800",
                "rounded-[2.5rem] p-8 lg:p-10",
                "transition-all duration-500 ease-out",
                "hover:shadow-2xl hover:-translate-y-2 hover:border-brand-blue/30 dark:hover:border-brand-blue/30"
              )}
            >
              {/* Background Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-coral/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Live Badge */}
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
                  style={{
                    backgroundColor: app.primaryColor + '15',
                    borderColor: app.primaryColor + '30'
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: app.primaryColor }}
                    ></span>
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: app.primaryColor }}
                    ></span>
                  </span>
                  <span
                    className="text-[10px] font-black tracking-widest uppercase font-display"
                    style={{ color: app.primaryColor }}
                  >
                    Demo Live
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold font-display">{app.onlineCount} online</span>
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="relative z-10 flex justify-center mb-10 transform group-hover:scale-105 transition-transform duration-700">
                <MockupPhone
                  color={app.primaryColor}
                  name={app.name}
                  isFloating={true}
                />
              </div>

              {/* App Info */}
              <div className="relative z-10 text-center mb-8">
                <h3 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-3">
                  {app.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                  {app.description}
                </p>
              </div>

              {/* CTA Button */}
              <div className="relative z-10">
                <button
                  onClick={() => window.open(app.appUrl, '_blank')}
                  className={cn(
                    "w-full flex items-center justify-center gap-2",
                    "px-6 py-4 rounded-2xl",
                    "text-white font-bold font-display tracking-wide uppercase text-sm",
                    "transition-all duration-300",
                    "hover:-translate-y-1 hover:shadow-xl",
                    "active:scale-[0.98]"
                  )}
                  style={{
                    backgroundColor: app.primaryColor,
                    boxShadow: `0 10px 30px -10px ${app.primaryColor}50`
                  }}
                >
                  Acessar App Demo
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Trust Indicators */}
        <ScrollReveal delay={300} className="flex flex-wrap items-center justify-center gap-6 lg:gap-12 mt-20 pt-10 border-t border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 group">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider font-display">SSL Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider font-display">+1.2K Usuários</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <div className="p-1.5 rounded-lg bg-coral-500/10 text-brand-coral">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider font-display">Instalação Instantânea</span>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default DemoAppsSection;