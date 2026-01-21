import React from 'react';
import { Home, Search, Bell, User, Menu, Signal, Wifi, Battery } from 'lucide-react';

interface MockupMobileProps {
  primaryColor?: string;
  appName?: string;
  logoUrl?: string;
}

const MockupMobile: React.FC<MockupMobileProps> = ({
  primaryColor = '#2563EB',
  appName = 'Seu App',
  logoUrl
}) => {
  return (
    <div className="relative mx-auto">
      {/* --- MOLDURA DO TELEFONE (Estilo Moderno) --- */}
      <div className="relative border-slate-900 bg-slate-900 border-[10px] rounded-[3rem] h-[600px] w-[300px] shadow-2xl shadow-slate-900/40 overflow-hidden ring-1 ring-white/10">

        {/* Botões Laterais */}
        <div className="h-[32px] w-[3px] bg-slate-800 absolute -start-[13px] top-[72px] rounded-s-lg shadow-sm"></div>
        <div className="h-[46px] w-[3px] bg-slate-800 absolute -start-[13px] top-[124px] rounded-s-lg shadow-sm"></div>
        <div className="h-[64px] w-[3px] bg-slate-800 absolute -end-[13px] top-[142px] rounded-e-lg shadow-sm"></div>

        {/* --- TELA --- */}
        <div className="w-full h-full bg-slate-50 flex flex-col relative overflow-hidden rounded-[2.3rem]">

          {/* Status Bar (Fake) */}
          <div
            style={{ backgroundColor: primaryColor }}
            className="h-10 px-6 flex items-center justify-between text-white text-[10px] font-medium pt-2 select-none"
          >
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Dynamic Island / Notch Simulation */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black w-20 h-6 rounded-full z-20 flex items-center justify-center">
            <div className="w-12 h-2 rounded-full bg-slate-800/50"></div>
          </div>

          {/* App Header */}
          <div
            style={{ backgroundColor: primaryColor }}
            className="pt-2 pb-6 px-4 rounded-b-[2rem] shadow-lg relative z-10 flex flex-col items-center justify-center text-white transition-colors duration-300"
          >
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-3 p-1">
              {logoUrl ? (
                <img src={logoUrl} alt="App Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse"></div>
              )}
            </div>
            <h3 className="font-bold text-lg tracking-tight leading-none">{appName}</h3>
            <p className="text-[10px] opacity-80 mt-1">Bem-vindo(a)!</p>
          </div>

          {/* Content Area (Skeletons Modernos) */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar bg-slate-50">

            {/* Banner Skeleton */}
            <div className="h-32 w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-white opacity-50" />
              <div className="h-4 w-24 bg-slate-100 rounded-full mb-3"></div>
              <div className="h-2 w-32 bg-slate-50 rounded-full"></div>
            </div>

            {/* Grid Menu */}
            <div>
              <div className="h-3 w-16 bg-slate-200 rounded-full mb-3 ml-1"></div>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-[4/3] bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 p-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50"></div>
                    <div className="h-2 w-12 bg-slate-100 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* List Items */}
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded-full mb-2 ml-1"></div>
              {[1, 2].map(i => (
                <div key={i} className="h-16 w-full bg-white rounded-xl shadow-sm border border-slate-100 flex items-center px-3 gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50"></div>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 w-20 bg-slate-100 rounded-full"></div>
                    <div className="h-1.5 w-32 bg-slate-50 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Nav Mockup */}
          <div className="h-[70px] bg-white border-t border-slate-100 flex items-start justify-around pt-4 px-2 pb-6 relative z-20">
            <Home className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
            <Search className="w-6 h-6 text-slate-300" />
            <div className="w-10 h-10 bg-slate-900 rounded-full -mt-8 flex items-center justify-center shadow-lg border-4 border-slate-50">
              <Menu className="w-5 h-5 text-white" />
            </div>
            <Bell className="w-6 h-6 text-slate-300" />
            <User className="w-6 h-6 text-slate-300" />
          </div>

          {/* Home Indicator (iOS Style) */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-900/20 rounded-full z-30"></div>
        </div>

        {/* Screen Reflection (Glossy Effect) */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-[2.5rem]"></div>
      </div>
    </div>
  );
};

export default MockupMobile;