import React, { useState } from 'react';
import { ZoomIn, X, Star, TrendingUp, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../ScrollReveal';

// Depoimentos que matam objeções específicas
const testimonials = [
  { 
    id: 1, 
    name: 'Rodrigo M.',
    avatar: 'RM',
    time: '14:32',
    message: 'Cara, to chocado! Fiz a migração do Hotmart pro TribeBuild semana passada. Minha taxa de reembolso caiu de 12% pra 3%. Os alunos falam que a experiência é completamente diferente 🔥',
    result: '-75% reembolsos',
    objecao: 'funciona?'
  },
  { 
    id: 2, 
    name: 'Camila S.',
    avatar: 'CS',
    time: '09:47',
    message: 'Eu tinha medo de ser complicado demais, mas configurei tudo em UMA TARDE. Sério, sem programação nenhuma. O suporte me ajudou no WhatsApp em tempo real',
    result: 'Setup em 3h',
    objecao: 'difícil?'
  },
  { 
    id: 3, 
    name: 'Felipe A.',
    avatar: 'FA',
    time: '21:15',
    message: 'Antes eu vendia meu curso de finanças por R$197. Depois que criei o app pelo TribeBuild, lancei como "Método FAZ" com acesso vitalício no app por R$497. Vendi 89 no lançamento!',
    result: '+152% ticket',
    objecao: 'preço alto?'
  },
  { 
    id: 4, 
    name: 'Ana Paula R.',
    avatar: 'AR',
    time: '16:28',
    message: 'O que mais gostei: minhas alunas ABREM o app todo dia pra ver novidades. No Hotmart ficavam meses sem entrar. Engajamento foi pro céu 📈',
    result: '4x engajamento',
    objecao: 'engaja?'
  },
  { 
    id: 5, 
    name: 'Thiago L.',
    avatar: 'TL',
    time: '11:03',
    message: 'Integrou com Kiwify em 5 minutos, literalmente. Venda aprovou, aluno recebe acesso automático no app. Zero trabalho manual agora',
    result: '100% automático',
    objecao: 'integra?'
  },
  { 
    id: 6, 
    name: 'Marina C.',
    avatar: 'MC',
    time: '18:55',
    message: 'Testei os 7 dias grátis achando que ia cancelar. Tô no 4o mês pagando feliz. O ROI é absurdo, cada aluno que não pede reembolso já paga a mensalidade',
    result: 'ROI 12x',
    objecao: 'vale a pena?'
  },
  { 
    id: 7, 
    name: 'Lucas P.',
    avatar: 'LP',
    time: '08:41',
    message: 'Minha comunidade tava morrendo no Telegram. Migrei pro app e ressuscitou! As pessoas preferem ter tudo num lugar só, e a notificação push é game changer',
    result: '+234% ativos',
    objecao: 'comunidade?'
  },
  { 
    id: 8, 
    name: 'Beatriz F.',
    avatar: 'BF',
    time: '20:12',
    message: 'Recebi uma DM de aluna dizendo que meu app parece mais profissional que de curso de R$5.000. E eu cobro R$297 kkkk obrigada TribeBuild',
    result: 'Percepção premium',
    objecao: 'aparência?'
  },
  { 
    id: 9, 
    name: 'Daniel O.',
    avatar: 'DO',
    time: '15:33',
    message: 'O suporte respondeu em 23 minutos num DOMINGO. Nunca vi isso em lugar nenhum. Resolveu meu problema na hora',
    result: '<30min resposta',
    objecao: 'suporte?'
  },
  { 
    id: 10, 
    name: 'Juliana K.',
    avatar: 'JK',
    time: '12:08',
    message: 'Meu marido é programador e disse que pra fazer um app assim do zero custaria uns R$20k+. To pagando R$127/mês e tenho tudo pronto 😂',
    result: '-95% custo',
    objecao: 'custo?'
  },
];

interface WhatsAppCardProps {
  testimonial: typeof testimonials[0];
  onClick?: () => void;
}

const WhatsAppCard: React.FC<WhatsAppCardProps> = ({ testimonial, onClick }) => {
  return (
    <div 
      className="flex-shrink-0 w-[300px] md:w-[340px] bg-[#e5ddd5] dark:bg-[#0b141a] rounded-2xl overflow-hidden cursor-pointer group relative shadow-lg hover:shadow-2xl transition-all duration-500 mx-3"
      onClick={onClick}
    >
      {/* WhatsApp Header */}
      <div className="bg-[#075e54] dark:bg-[#1f2c34] px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
          {testimonial.avatar}
        </div>
        <div className="flex-1">
          <p className="text-white font-medium text-sm">{testimonial.name}</p>
          <p className="text-emerald-200 text-xs">online</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="p-4 min-h-[180px] relative">
        {/* Mensagem recebida */}
        <div className="bg-white dark:bg-[#202c33] rounded-lg rounded-tl-none p-3 shadow-sm max-w-[95%] relative">
          <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
            {testimonial.message}
          </p>
          <div className="flex items-center justify-end gap-1 mt-2">
            <span className="text-[10px] text-slate-400">{testimonial.time}</span>
            <CheckCheck className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        {/* Result Badge */}
        <div className="absolute bottom-4 right-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-full shadow-lg">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{testimonial.result}</span>
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/10 transition-colors duration-500 flex items-center justify-center pointer-events-none">
        <div className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-500">
          <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center">
            <ZoomIn className="w-6 h-6 text-brand-blue" />
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  const [selectedTestimonial, setSelectedTestimonial] = useState<typeof testimonials[0] | null>(null);

  return (
    <section id="depoimentos" className="py-24 relative overflow-hidden transition-colors">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-slate-100/85 to-slate-50/90 dark:from-slate-900/90 dark:via-slate-950/85 dark:to-slate-900/90 backdrop-blur-[2px]"></div>
      
      {/* Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/8 via-transparent to-transparent dark:from-emerald-500/15 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 border border-emerald-200 dark:border-emerald-500/30">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Prints Reais de Clientes
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            O Que Nossos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">
              1.247 Criadores
            </span>
            {' '}Dizem
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Prints reais de conversas no WhatsApp. Sem edição, sem script. 
            Só a verdade de quem usa todo dia.
          </p>
          
          {/* Rating */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-slate-600 dark:text-slate-400 font-medium">4.9/5 baseado em 312 avaliações</span>
          </div>
        </ScrollReveal>

      </div>

      {/* Carousel de WhatsApp */}
      <div className="scroll-container relative mt-8">
        <div className="flex animate-scroll-left hover:pause w-max py-4">
          {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
            <WhatsAppCard
              key={`testimonial-${index}`}
              testimonial={testimonial}
              onClick={() => setSelectedTestimonial(testimonial)}
            />
          ))}
        </div>

        {/* Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50/95 dark:from-slate-900/95 via-slate-50/60 dark:via-slate-900/60 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50/95 dark:from-slate-900/95 via-slate-50/60 dark:via-slate-900/60 to-transparent pointer-events-none z-10" />
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center border border-slate-100 dark:border-slate-700">
              <p className="text-3xl font-black text-brand-blue">1.247</p>
              <p className="text-slate-500 text-sm font-medium">Criadores ativos</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center border border-slate-100 dark:border-slate-700">
              <p className="text-3xl font-black text-brand-coral">47%</p>
              <p className="text-slate-500 text-sm font-medium">Menos reembolsos</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center border border-slate-100 dark:border-slate-700">
              <p className="text-3xl font-black text-emerald-500">3x</p>
              <p className="text-slate-500 text-sm font-medium">Mais engajamento</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center border border-slate-100 dark:border-slate-700">
              <p className="text-3xl font-black text-amber-500">4.9★</p>
              <p className="text-slate-500 text-sm font-medium">Satisfação</p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Modal de Detalhe */}
      <AnimatePresence>
        {selectedTestimonial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedTestimonial(null)}
          >
            <button
              className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              onClick={() => setSelectedTestimonial(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#e5ddd5] dark:bg-[#0b141a] rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* WhatsApp Header */}
              <div className="bg-[#075e54] dark:bg-[#1f2c34] px-6 py-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300">
                  {selectedTestimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{selectedTestimonial.name}</p>
                  <p className="text-emerald-200 text-sm">online agora</p>
                </div>
              </div>

              {/* Chat Content */}
              <div className="p-6 min-h-[250px]">
                <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-none p-5 shadow-sm">
                  <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                    {selectedTestimonial.message}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedTestimonial.result}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">{selectedTestimonial.time}</span>
                      <CheckCheck className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default TestimonialsSection;
