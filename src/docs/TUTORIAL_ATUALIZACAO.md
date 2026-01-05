# 📚 GUIA COMPLETO: COMO ATUALIZAR O TRIBEBUILD

> Este guia ensina como fazer alterações no projeto sem precisar de programador.
> Nível: Iniciante (não precisa saber programar)

---

## 🙈 COMO ESCONDER/MOSTRAR SEÇÕES DA LANDING PAGE

**Arquivo:** `pages/LandingPage.tsx`

### Para ESCONDER uma seção:
Adicione `{/*` antes e `*/}` depois da linha:

```typescript
// ANTES (visível):
<TestimonialsSection />

// DEPOIS (escondida):
{/* <TestimonialsSection /> */}
```

### Para MOSTRAR novamente:
Remova o `{/*` e `*/}`:

```typescript
// Volte para:
<TestimonialsSection />
```

### Seções disponíveis para esconder:
| Seção | Linha aprox. | O que é |
|-------|--------------|---------|
| `<HeroSection />` | 40 | Banner principal com vídeo |
| `<DemoAppsSection />` | 43 | Apps de demonstração |
| `<FeaturesSection />` | 46 | Recursos e benefícios |
| `<IntegrationsSection />` | 49 | Logos das plataformas |
| `<TestimonialsSection />` | 52 | Depoimentos WhatsApp |
| `<PricingSection />` | 55 | Tabela de preços |
| `<FAQSection />` | 58 | Perguntas frequentes |
| `<CTASection />` | 61 | Chamada final |

---

## 🗂️ ESTRUTURA BÁSICA DO PROJETO

```
tribebuild/
├── public/                    ← Imagens e arquivos estáticos
│   └── images/
│       └── integrations/      ← Logos das plataformas
├── components/                ← Pedaços reutilizáveis
│   └── sections/              ← Seções da landing page
├── pages/                     ← Páginas completas
├── src/docs/                  ← Documentação (você está aqui)
└── App.tsx                    ← Arquivo principal de rotas
```

---

## 🎬 COMO TROCAR O VÍDEO DO HERO

### Passo 1: Suba seu vídeo no YouTube
- Vá em youtube.com
- Faça upload do seu vídeo
- Copie o ID do vídeo (ex: `dQw4w9WgXcQ` de `youtube.com/watch?v=dQw4w9WgXcQ`)

### Passo 2: Edite o arquivo
**Arquivo:** `components/sections/HeroSection.tsx`
**Linha aproximada:** 12-13

```typescript
// ANTES (linha ~12):
videoUrl = 'https://www.youtube.com/embed/htPQlb2u-rQ...'

// DEPOIS (troque htPQlb2u-rQ pelo ID do seu vídeo):
videoUrl = 'https://www.youtube.com/embed/SEU_VIDEO_ID_AQUI...'
```

### Exemplo completo:
Se seu vídeo é `youtube.com/watch?v=abc123xyz`, o código fica:
```typescript
videoUrl = 'https://www.youtube.com/embed/abc123xyz?si=wlsD-u5CThCJ1IvG&controls=1&rel=0&modestbranding=1'
```

---

## 💰 COMO ALTERAR PREÇOS DOS PLANOS

**Arquivo:** `components/sections/PricingSection.tsx`
**Linhas:** 8-70 (array `plans`)

### Estrutura de cada plano:
```typescript
{
  id: 'starter',           // Identificador único
  name: 'Starter',         // Nome exibido
  monthlyPrice: 67,        // 👈 PREÇO MENSAL (altere aqui)
  yearlyPrice: 56,         // 👈 PREÇO ANUAL (altere aqui)
  yearlyTotal: 672,        // Preço anual total
  savings: 132,            // Economia no anual
  badge: '7 dias grátis',  // Badge exibido
  features: [              // Lista de recursos inclusos
    '1 aplicativo completo',
    '500 membros ativos',
    // ... adicione ou remova itens
  ],
  cta: 'COMEÇAR GRÁTIS',   // Texto do botão
  highlighted: false,       // true = destaque azul
}
```

### Para alterar o preço do plano Starter de R$67 para R$97:
```typescript
// Linha ~10:
monthlyPrice: 97,  // Era 67, agora é 97
```

---

## ✏️ COMO ALTERAR TEXTOS DA LANDING PAGE

### Headline Principal (Hero)
**Arquivo:** `components/sections/HeroSection.tsx`
**Linha aproximada:** 70-75

```typescript
// ANTES:
<h1>O Método Para Cobrar 3x Mais Pelo Mesmo Conteúdo</h1>

// DEPOIS (troque pelo seu texto):
<h1>Seu Novo Texto Aqui</h1>
```

### Subheadline
**Mesmo arquivo, linha ~78-82**

```typescript
// ANTES:
<p>Chega de ver seus alunos abandonarem o curso na metade...</p>

// DEPOIS:
<p>Seu novo subtítulo aqui...</p>
```

---

## 🖼️ COMO ADICIONAR/TROCAR LOGOS DE INTEGRAÇÕES

### Passo 1: Adicione a imagem
Coloque o arquivo PNG em:
```
public/images/integrations/novaplatforma.png
```

### Passo 2: Edite o arquivo
**Arquivo:** `components/sections/IntegrationsSection.tsx`
**Linha aproximada:** 6-20 (array `integrations`)

```typescript
// Adicione uma nova linha no array:
const integrations = [
  { name: 'Kiwify', logo: '/images/integrations/kiwify.png' },
  { name: 'Eduzz', logo: '/images/integrations/eduzz.png' },
  // ... outras ...
  { name: 'Nova Plataforma', logo: '/images/integrations/novaplatforma.png' }, // 👈 ADICIONE AQUI
];
```

---

## 💬 COMO EDITAR DEPOIMENTOS

**Arquivo:** `components/sections/TestimonialsSection.tsx`
**Linhas:** 7-80 (array `testimonials`)

### Estrutura de cada depoimento:
```typescript
{ 
  id: 1, 
  name: 'Rodrigo M.',        // Nome do cliente
  avatar: 'RM',              // Iniciais (aparecem no círculo)
  time: '14:32',             // Horário da mensagem
  message: 'Texto do depoimento aqui...', // 👈 MENSAGEM PRINCIPAL
  result: '-75% reembolsos', // Resultado destacado
  objecao: 'funciona?'       // Objeção que esse depoimento mata
},
```

### Para editar o primeiro depoimento:
```typescript
// Linha ~8:
{ 
  id: 1, 
  name: 'João Silva',        // Troque o nome
  avatar: 'JS',              // Troque as iniciais
  time: '10:45',             // Troque o horário
  message: 'Seu novo texto de depoimento aqui!', // Troque a mensagem
  result: '+200% vendas',    // Troque o resultado
  objecao: 'vale a pena?'    // Troque a objeção
},
```

---

## ❓ COMO EDITAR PERGUNTAS DO FAQ

**Arquivo:** `components/sections/FAQSection.tsx`
**Linhas:** 6-43 (array `faqItems`)

### Estrutura de cada pergunta:
```typescript
{
  question: "Preciso saber programar para criar o app?",  // 👈 PERGUNTA
  answer: "De forma alguma! O TribeBuild foi desenvolvido..." // 👈 RESPOSTA
},
```

### Para adicionar uma nova pergunta:
```typescript
// Adicione no final do array, antes do ]:
{
  question: "Sua nova pergunta aqui?",
  answer: "Sua resposta completa aqui."
},
```

---

## 🎨 COMO TROCAR CORES DO PROJETO

**Arquivo:** `tailwind.config.js`
**Linhas:** 10-20

```javascript
colors: {
  'brand-blue': '#2563EB',      // 👈 Azul principal
  'brand-blue-dark': '#1D4ED8', // 👈 Azul escuro (hover)
  'brand-coral': '#FF6B6B',     // 👈 Coral (CTAs)
  'brand-coral-dark': '#ff5252', // 👈 Coral escuro (hover)
}
```

### Para mudar o azul para verde:
```javascript
'brand-blue': '#10B981',      // Era #2563EB, agora é verde
'brand-blue-dark': '#059669', // Era #1D4ED8, agora é verde escuro
```

**⚠️ Cuidado:** Isso muda TODAS as cores azuis do site de uma vez.

---

## 📧 COMO ALTERAR INFORMAÇÕES DE CONTATO

### WhatsApp
**Arquivo:** `components/WhatsAppButton.tsx`
**Linha aproximada:** 15

```typescript
// ANTES:
const whatsappNumber = '5511999999999';

// DEPOIS (seu número com código do país):
const whatsappNumber = '5521987654321';
```

### Email e Redes Sociais
**Arquivo:** `components/Footer.tsx`
Procure por `mailto:` e `href=` para encontrar os links.

---

## 🔐 COMO ALTERAR CREDENCIAIS DE ADMIN (TEMPORÁRIO)

**⚠️ IMPORTANTE:** Isso é temporário! Quando conectarmos o Supabase, as senhas serão seguras.

**Arquivo:** `pages/admin/AdminLoginPage.tsx`
**Linhas aproximadas:** 20-25

```typescript
// Procure por algo assim:
if (email === 'admin@tribebuild.com' && password === 'admin123') {
  // ...
}

// Troque para:
if (email === 'seu@email.com' && password === 'suaSenhaForte123') {
  // ...
}
```

---

## 🚀 COMO TESTAR SUAS ALTERAÇÕES

### Passo 1: Abra o terminal na pasta do projeto
```bash
cd pasta-do-tribebuild
```

### Passo 2: Instale dependências (só na primeira vez)
```bash
npm install
```

### Passo 3: Rode o projeto
```bash
npm run dev
```

### Passo 4: Abra no navegador
```
http://localhost:5173
```

### Passo 5: Veja suas alterações
- O site atualiza automaticamente quando você salva um arquivo
- Se não atualizar, aperte F5 ou Ctrl+R

---

## 📁 MAPA RÁPIDO: ONDE FICA CADA COISA

| O que você quer mudar | Arquivo | Linha aprox. |
|-----------------------|---------|--------------|
| Vídeo do Hero | `components/sections/HeroSection.tsx` | 12 |
| Headline principal | `components/sections/HeroSection.tsx` | 70 |
| Preços dos planos | `components/sections/PricingSection.tsx` | 8-70 |
| Depoimentos | `components/sections/TestimonialsSection.tsx` | 7-80 |
| Perguntas FAQ | `components/sections/FAQSection.tsx` | 6-43 |
| Logos integrações | `components/sections/IntegrationsSection.tsx` | 6-20 |
| Cores do site | `tailwind.config.js` | 10-20 |
| WhatsApp | `components/WhatsAppButton.tsx` | 15 |
| Login Admin | `pages/admin/AdminLoginPage.tsx` | 20-25 |
| Rotas/Páginas | `App.tsx` | todo arquivo |

---

## ⚠️ DICAS IMPORTANTES

### ✅ FAÇA:
- Sempre teste antes de publicar
- Faça backup antes de alterar
- Edite um arquivo de cada vez
- Salve e veja se funcionou

### ❌ NÃO FAÇA:
- Não delete arquivos sem saber o que são
- Não mexa em arquivos que terminam em `.config.js` (exceto cores)
- Não altere a estrutura de pastas
- Não remova imports no topo dos arquivos

---

## 🆘 SE ALGO DER ERRADO

### Erro na tela vermelha?
1. Leia a mensagem de erro
2. Geralmente diz o arquivo e a linha
3. Volte o que você mudou
4. Salve novamente

### Site não abre?
```bash
# Pare o servidor (Ctrl+C) e rode novamente:
npm run dev
```

### Mudei mas não apareceu?
- Aperte F5 para atualizar
- Limpe o cache: Ctrl+Shift+R
- Verifique se salvou o arquivo

---

## 📞 PRECISA DE AJUDA?

Se precisar de alterações mais complexas, você pode:
1. Abrir um novo chat com Claude
2. Enviar o ZIP do projeto
3. Pedir: "Leia /src/docs/PROJECT_CONTEXT.md e me ajude com [sua dúvida]"

---

**Este guia foi criado para que você tenha autonomia total sobre seu projeto!** 🚀
