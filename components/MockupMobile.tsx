
import React from 'react';

interface MockupMobileProps {
  primaryColor?: string;
  appName?: string;
  logoUrl?: string;
}

const MockupMobile: React.FC<MockupMobileProps> = ({
  primaryColor = 'brand-blue',
  appName = 'Meu App',
  logoUrl = 'https://picsum.photos/seed/applogo/200/200'
}) => {
  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-slate-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl overflow-hidden">
      <div className="h-[32px] w-[3px] bg-slate-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-slate-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-slate-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
      <div className="h-[64px] w-[3px] bg-slate-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
      
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white flex flex-col">
        {/* App Bar */}
        <div style={{ backgroundColor: primaryColor }} className="h-40 flex flex-col items-center justify-center p-4 text-white">
          <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-2xl shadow-lg mb-2" />
          <h3 className="font-bold text-lg">{appName}</h3>
        </div>

        {/* App Content Area */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
            <div className="h-4 w-24 bg-slate-100 rounded mb-2"></div>
            <div className="h-2 w-full bg-slate-50 rounded mb-1"></div>
            <div className="h-2 w-2/3 bg-slate-50 rounded"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             {[1,2,3,4].map(i => (
               <div key={i} className="aspect-square bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center p-2">
                 <div className="w-8 h-8 rounded-full bg-slate-50 mb-2"></div>
                 <div className="h-2 w-12 bg-slate-100 rounded"></div>
               </div>
             ))}
          </div>

          <div className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>

        {/* Bottom Nav */}
        <div className="h-16 bg-white border-t border-slate-100 flex items-center justify-around px-2">
          <div className="w-10 h-10 rounded-lg bg-blue-50"></div>
          <div className="w-10 h-10 rounded-lg bg-slate-50"></div>
          <div className="w-10 h-10 rounded-lg bg-slate-50"></div>
          <div className="w-10 h-10 rounded-lg bg-slate-50"></div>
        </div>
      </div>
    </div>
  );
};

export default MockupMobile;
