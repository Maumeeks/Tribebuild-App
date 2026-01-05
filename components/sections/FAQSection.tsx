
import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

const faqItems = [
  {
    question: "Preciso saber programar para criar o app?",
    answer: "De forma alguma! O TribeBuild foi desenvolvido para que qualquer pessoa consiga criar seu aplicativo de forma intuitiva, apenas arrastando e soltando elementos. Você não precisa de nenhum conhecimento técnico."
  },
  {
    question: "Em quanto tempo meu app fica pronto?",
    answer: "Em questão de minutos! Após escolher seu plano, você já pode começar a personalizar seu app imediatamente. A maioria dos nossos usuários consegue ter seu aplicativo funcionando e publicado no mesmo dia."
  },
  {
    question: "O app funciona de verdade no celular como um aplicativo nativo?",
    answer: "Sim! Seu app funciona exatamente como um aplicativo tradicional no celular dos seus usuários. Eles podem instalar na tela inicial, receber notificações push e acessar offline. A diferença é que você não precisa passar pelas burocracias e taxas da Apple Store ou Google Play."
  },
  {
    question: "Como o TribeBuild pode aumentar o valor dos meus produtos digitais?",
    answer: "Ter seu próprio aplicativo eleva instantaneamente a percepção de valor do seu produto. Seus clientes terão uma experiência premium e exclusiva com sua marca, aumentando a satisfação, reduzindo reembolsos e criando um canal direto de comunicação através de notificações push."
  },
  {
    question: "Quais tipos de conteúdo posso disponibilizar no app?",
    answer: "Você pode hospedar praticamente qualquer formato: ebooks em PDF, videoaulas, cursos completos com módulos, mentorias, podcasts, comunidades e muito mais. Tudo organizado de forma profissional com a sua identidade visual."
  },
  {
    question: "Como funciona a personalização do aplicativo?",
    answer: "Você tem controle total sobre a identidade visual do seu app: logo, cores, domínio próprio e até o nome do aplicativo. Também pode escolher entre diferentes idiomas (Português, Inglês, Espanhol e Francês) e configurar a navegação conforme suas necessidades."
  },
  {
    question: "Como funciona a integração com Hotmart, Kiwify e outras plataformas?",
    answer: "A integração é automática via Webhook. Assim que uma venda é aprovada na sua plataforma de pagamento, o TribeBuild libera o acesso do aluno automaticamente. Sem trabalho manual, sem complicação."
  },
  {
    question: "Posso expandir para clientes internacionais?",
    answer: "Com certeza! O TribeBuild oferece suporte a múltiplos idiomas, permitindo que você alcance audiências em qualquer lugar do mundo. Seu app pode ser configurado em Português, Inglês, Espanhol ou Francês."
  },
  {
    question: "Que tipo de suporte vocês oferecem?",
    answer: "Oferecemos suporte dedicado para ajudar você em cada etapa. Você pode entrar em contato diretamente pelo aplicativo ou por email, e nossa equipe está pronta para resolver suas dúvidas rapidamente."
  }
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left hover:text-brand-blue dark:hover:text-brand-coral transition-colors duration-200 group"
      >
        <span className="text-base font-medium text-slate-900 dark:text-white pr-8 group-hover:text-brand-blue dark:group-hover:text-brand-coral transition-colors">
          {question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-brand-blue dark:text-brand-coral' : ''
          }`}
        />
      </button>
      
      {/* Resposta com animação */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null); // Todos fechados por padrão

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 relative overflow-hidden transition-colors">
      {/* Background Overlay - alternando cor (slate-50) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-slate-100/85 to-slate-50/90 dark:from-slate-900/90 dark:via-slate-950/85 dark:to-slate-900/90 backdrop-blur-[2px]"></div>
      
      {/* Glow sutil no header */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-coral/8 via-transparent to-transparent dark:from-brand-coral/15 pointer-events-none"></div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          {/* Badge FAQ */}
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue text-sm font-semibold rounded-full mb-4 border border-brand-blue/20">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </span>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Dúvidas{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">
              Frequentes
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Descubra como o TribeBuild pode transformar seus produtos digitais e elevar 
            o valor da sua marca com um aplicativo personalizado.
          </p>
        </ScrollReveal>

        {/* FAQ Items */}
        <ScrollReveal delay={200}>
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 px-6">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onClick={() => handleToggle(index)}
              />
            ))}
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default FAQSection;
