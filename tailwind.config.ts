import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        secondary: {
          DEFAULT: '#059669',
          dark: '#047857',
          muted: '#f0fdf4',
          2: '#f7fcf9',
        },
        teal: {
          DEFAULT: '#059669',
          dark: '#047857',
          light: '#d1fae5',
        },
        accent: {
          DEFAULT: '#10b981',
          muted: '#d1fae5',
        },
        navy: {
          DEFAULT: '#ffffff',
          2: '#f7fcf9',
          3: '#ffffff',
          4: '#ecfdf5',
        },
        ink: {
          DEFAULT: '#064e3b',
          muted: '#52796f',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Kanit', 'sans-serif'],
        body: ['var(--font-body)', 'Sarabun', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 8px 24px rgba(5,150,105,0.35)',
        card: '0 16px 40px rgba(21,128,61,0.08)',
        mockup:
          '0 40px 80px rgba(15,23,42,0.12), 0 0 0 1px rgba(21,128,61,0.08)',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s infinite',
        'fade-in-down': 'fade-in-down 0.7s ease both',
        'fade-in-up': 'fade-in-up 0.8s ease both',
        'fade-in': 'fade-in 1s ease both',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.3)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
