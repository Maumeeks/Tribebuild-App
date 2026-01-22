/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ✅ ESSENCIAL: Isso ativa o botão de troca de tema
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // ✅ VOLTAMOS PARA A INTER: Padrão, segura e profissional
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ✅ As cores da sua marca (Mantidas)
        brand: {
          blue: '#2563EB',  // O azul vibrante dos botões
          'blue-dark': '#1E40AF', // Para o hover
          coral: '#FF6B6B', // O gradiente coral
        },
        // ✅ Mapeamento das variáveis de tema (Light/Dark mode)
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          hover: 'var(--color-border-hover)',
        }
      },
      // ✅ Animações (aquelas bolhas e slides suaves)
      animation: {
        'blob': 'blob 7s infinite',
        'scroll-left': 'scroll-left 45s linear infinite',
        'scroll-right': 'scroll-right 45s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scroll-right': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      },
    },
  },
  plugins: [],
}