import React from 'react';
import { Smartphone, ArrowRight, Star, Zap, ShoppingBag, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';

const apps = [
  {
    id: 1,
    name: 'FitMaster Pro',
    category: 'Fitness & Saúde',
    icon: Zap,
    color: 'bg-orange-500',
    description: 'App de treinos e nutrição com área de membros exclusiva.',
    stats: '12k membros',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'E-Commerce Elite',
    category: 'Vendas Online',
    icon: ShoppingBag,
    color: 'bg-blue-600',
    description: 'Loja completa com catálogo, carrinho e pagamentos.',
    stats: 'R$ 150k/mês',
    image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1364&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Mentoria Vip',
    category: 'Educação',
    icon: Users,
    color: 'bg-purple-600',
    description: 'Plataforma de cursos e comunidade para alunos.',
    stats: '4.8 ⭐',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop'
  }
];

const DemoAppsSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-brand-blue text-xs font-bold uppercase tracking-widest mb-6">
              <Star className="w-3 h-3 fill-current" />
              Exemplos Reais
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
              O que você pode criar?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              De comunidades a e-commerce, o TribeBuild se adapta ao seu negócio.
              Veja alguns exemplos do que é possível fazer em minutos.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {apps.map((app, index) => (
            <ScrollReveal
              key={app.id}
              delay={index * 0.1}
              className="group"
            // ❌ REMOVIDO: style={{ animationDelay... }} que causava o erro
            >
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-brand-blue/50 dark:hover:border-brand-blue/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 h-full flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                  <img
                    src={app.image}
                    alt={app.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${app.color} flex items-center justify-center text-white shadow-lg`}>
                      <app.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">{app.name}</h3>
                      <p className="text-white/80 text-xs font-medium">{app.category}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
                    {app.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                      {app.stats}
                    </span>
                    <button className="text-brand-blue font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver Modelo <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-16 text-center">
          <ScrollReveal delay={0.4}>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl hover:-translate-y-1"
            >
              Começar Agora
              <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default DemoAppsSection;