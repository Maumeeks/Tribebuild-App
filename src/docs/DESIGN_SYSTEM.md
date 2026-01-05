# 🎨 DESIGN SYSTEM - TRIBEBUILD

## 🎨 CORES

| Nome | Hex | Tailwind | Uso |
|------|-----|----------|-----|
| Azul Royal | `#2563EB` | `brand-blue` | Primária |
| Azul Escuro | `#1D4ED8` | `brand-blue-dark` | Hovers |
| Coral Fire | `#FF6B6B` | `brand-coral` | CTAs |
| Coral Escuro | `#ff5252` | `brand-coral-dark` | Hovers |

## 📝 TIPOGRAFIA

| Elemento | Fonte | Classe |
|----------|-------|--------|
| Headlines | Outfit | `font-display font-extrabold` |
| Body | Inter | `font-sans` |
| Botões | Outfit | `font-display font-bold uppercase tracking-widest` |

## 🔲 COMPONENTES

### Botão Primário
```jsx
<button className="px-8 py-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-display font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/25">
```

### Card
```jsx
<div className="bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8">
```

### Input
```jsx
<input className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue" />
```

## 🌗 DARK MODE

| Light | Dark |
|-------|------|
| `bg-slate-50` | `dark:bg-slate-950` |
| `bg-white` | `dark:bg-slate-900` |
| `text-slate-900` | `dark:text-white` |
| `border-slate-200` | `dark:border-slate-800` |

## 🖼 LOGO

```jsx
import TribeBuildLogo from '@/components/TribeBuildLogo';
<TribeBuildLogo size="md" showText={true} />
```

Tamanhos: `sm` | `md` | `lg` | `xl`
