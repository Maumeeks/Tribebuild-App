
import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Home, Newspaper, Users, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavigationProps {
  primaryColor: string;
}

export default function BottomNavigation({ primaryColor }: BottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { appSlug } = useParams<{ appSlug: string }>();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: `/app/${appSlug}/home` },
    { id: 'feed', label: 'Feed', icon: Newspaper, path: `/app/${appSlug}/feed` },
    { id: 'community', label: 'Comunidade', icon: Users, path: `/app/${appSlug}/community` },
    { id: 'profile', label: 'Perfil', icon: User, path: `/app/${appSlug}/profile` },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-40 pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all relative group"
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                active ? "scale-110" : "group-active:scale-90"
              )}>
                <Icon 
                  className="w-6 h-6 transition-colors duration-300"
                  style={{ color: active ? primaryColor : '#94A3B8' }}
                />
              </div>
              <span 
                className="text-[10px] font-black uppercase tracking-widest transition-colors duration-300 mt-0.5"
                style={{ color: active ? primaryColor : '#94A3B8' }}
              >
                {tab.label}
              </span>
              
              {active && (
                <div 
                  className="absolute -top-px w-8 h-1 rounded-full animate-fade-in"
                  style={{ backgroundColor: primaryColor, boxShadow: `0 0 10px ${primaryColor}40` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
