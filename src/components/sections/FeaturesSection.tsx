
import React from 'react';
import { 
  Palette, 
  Home, 
  MessageCircle, 
  Bell, 
  Rss, 
  Globe,
  BookOpen,
  Video,
  Lightbulb,
  Mic,
  Target,
  Award,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import ScrollReveal from '../ScrollReveal';
import TribeBuildLogo from '../TribeBuildLogo';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  result?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description,
  result
}) => {
  return (
    <div className="group bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/10 hover:shadow-xl dark:hover:shadow-brand-blue/5 hover:-translate-y-1 transition-all duration-300">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
        <Icon className="w-6 h-6 text-brand-blue" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">
        {description}
      </p>

      {/* Result Tag */}
      {result && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{result}</span>
        </div>
      )}
    </div>
  );
};

// Features reescritas com BENEFÍCIOS e RESULTADOS
const features = [
  {
    icon: Palette,
    title: 'Sua Marca, Sua Autoridade',
    description: 'Quando seu aluno abre SEU app (não o Hotmart genérico), ele te vê como mais profissional. Logo, cores, domínio próprio - tudo seu.',
    result: '-47% reembolsos'
  },
  {
    icon: Home,
    title: 'Tudo em Um Só Lugar',
    description: 'Ebooks, videoaulas, mentorias, comunidade. Seu aluno não precisa ficar pulando entre plataformas. Menos atrito = mais conclusão.',
    result: '+89% taxa de conclusão'
  },
  {
    icon: MessageCircle,
    title: 'Comunidade que Engaja',
    description: 'Crie um ambiente onde seus alunos se ajudam, compartilham vitórias e ficam mais tempo. Comunidade forte = menos cancelamentos.',
    result: '+156% retenção'
  },
  {
    icon: Bell,
    title: 'Notificações que Vendem',
    description: 'Envie lembretes, ofertas e novidades direto pro celular. Taxa de abertura 4x maior que email. Seu aluno sempre lembra de você.',
    result: '4x mais aberturas'
  },
  {
    icon: Rss,
    title: 'Feed de Conteúdo',
    description: 'Publique novidades como nas redes sociais, mas sem algoritmo te escondendo. 100% dos seus seguidores veem 100% do seu conteúdo.',
    result: '100% de alcance'
  },
  {
    icon: Globe,
    title: 'Escale Para o Mundo',
    description: 'PT, EN, ES, FR - seu app traduzido automaticamente. Venda para gringos sem criar conteúdo novo. Dólar na conta.',
    result: 'Receita em USD/EUR'
  }
];

// Target Audience com resultados específicos
const targetAudience = [
  {
    icon: BookOpen,
    title: 'Infoprodutores',
    description: 'Saia do "mais um curso no Hotmart" para "meu próprio ecossistema". Aumente o ticket médio em até 3x.',
  },
  {
    icon: Video,
    title: 'Criadores de Curso',
    description: 'Chega de ver alunos desistindo na aula 3. Com app próprio, a taxa de conclusão sobe de 12% para 67%.',
  },
  {
    icon: Lightbulb,
    title: 'Mentores',
    description: 'Entregue sua mentoria premium em um ambiente premium. Justifique tickets de R$2.000+ facilmente.',
  },
  {
    icon: Mic,
    title: 'Podcasters',
    description: 'Crie área de membros exclusiva para apoiadores. Monetize além de patrocínio com comunidade paga.',
  },
  {
    icon: Target,
    title: 'Coaches',
    description: 'Acompanhe o progresso dos coachees, envie tarefas e lembretes. Tudo organizado, nada perdido.',
  },
  {
    icon: Award,
    title: 'Especialistas',
    description: 'Transforme seu conhecimento em um ativo. App próprio = autoridade máxima no seu nicho.',
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="recursos" className="py-20 relative overflow-hidden transition-colors">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-slate-100/80 to-slate-50/90 dark:from-slate-950/90 dark:via-slate-900/80 dark:to-slate-950/90 backdrop-blur-[2px]"></div>
      
      {/* Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-coral/8 via-transparent to-transparent dark:from-brand-coral/15 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========== PART 1: 3 PILARES (Conexão com Logo) ========== */}
        <ScrollReveal className="text-center mb-16">
          {/* Logo TribeBuild */}
          <div className="inline-flex items-center justify-center mb-6">
            <TribeBuildLogo size="lg" showText={false} />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight">
            Construa Sua{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">
              Tribo
            </span>
            {' '}em 3 Pilares
          </h2>

          {/* 3 Pilares Visuais */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-8 border-2 border-brand-blue/20 hover:border-brand-blue/50 transition-all">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Base Sólida</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Tecnologia robusta, servidores rápidos, integração com Hotmart/Kiwify</p>
            </div>
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-8 border-2 border-brand-blue/20 hover:border-brand-blue/50 transition-all">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sua Marca</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">100% white-label. Logo, cores, domínio - ninguém sabe que é TribeBuild</p>
            </div>
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-8 border-2 border-brand-coral/20 hover:border-brand-coral/50 transition-all">
              <div className="w-12 h-12 bg-brand-coral/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-brand-coral" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Energia no Topo</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Notificações push, comunidade ativa, feed de conteúdo - engajamento máximo</p>
            </div>
          </div>
        </ScrollReveal>

        {/* ========== PART 2: FEATURES COM RESULTADOS ========== */}
        <ScrollReveal className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-widest rounded-full mb-4 border border-brand-blue/20">
            <Zap className="w-4 h-4" />
            Recursos que Geram Resultado
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Cada Feature Foi Pensada Para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">
              Aumentar Seu Faturamento
            </span>
          </h2>
        </ScrollReveal>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 50}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                result={feature.result}
              />
            </ScrollReveal>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-16" />

        {/* ========== PART 3: PARA QUEM É ========== */}
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Perfeito Para Quem Quer{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">
              Sair do Comum
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Se você ainda entrega seu conteúdo em plataforma genérica, está deixando dinheiro na mesa.
          </p>
        </ScrollReveal>

        {/* Target Audience Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {targetAudience.map((item, index) => (
            <ScrollReveal key={index} delay={(index + 6) * 50}>
              <FeatureCard
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
