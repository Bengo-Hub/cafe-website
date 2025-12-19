/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        brand: {
          // Official Brand Colors - Works in both light & dark modes
          dark: '#2c1a02', // Dark background
          light: '#fbfcf9', // Light background
          orange: '#ea8022', // Primary orange
          beige: '#d1ccc2', // Secondary text
          muted: '#584c3d', // Muted text
          brown: '#663209', // Brown accent
          taupe: '#958c80', // Taupe
          gold: '#ae6221', // Gold accent
          // Derived colors for depth
          darker: '#1a0f01', // Darker background
          surface: '#1a0f01', // Surface elements
          cream: '#fbfcf9', // Creamy elements
          burnt: '#d46c1a', // Burnt accent
          rose: '#b85a2f', // Rose accent
          copper: '#8b5a1f', // Copper accent
        },
        primary: {
          50: '#fbfcf9', // Light cream
          100: '#d1ccc2', // Soft beige
          200: '#958c80', // Warm taupe
          300: '#584c3d', // Muted brown
          400: '#ae6221', // Rich gold
          500: '#ea8022', // Vibrant orange
          600: '#ae6221', // Deep gold
          700: '#663209', // Dark brown
          800: '#2c1a02', // Very dark brown
          900: '#1a0f01', // Near black
          950: '#0d0700', // Absolute black
        },
        secondary: {
          50: '#fef6ee', // Light peach
          100: '#fde9d7', // Soft peach
          200: '#fbd2ae', // Warm peach
          300: '#f8b179', // Muted peach
          400: '#f58b42', // Rich peach
          500: '#ea8022', // Vibrant orange
          600: '#ae6221', // Deep gold
          700: '#663209', // Dark brown
          800: '#2c1a02', // Very dark brown
          900: '#1a0f01', // Near black
          950: '#0d0700', // Absolute black
        },
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        artistic: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      screens: {
        xs: '475px',
      },
      backgroundImage: {
        'gradient-radial-orange': 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
        'gradient-radial-gold': 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
        'gradient-radial-brown': 'radial-gradient(circle, rgba(102, 50, 9, 0.15) 0%, transparent 70%)',
      },
      keyframes: {
        'wave-move': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.8', boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)' },
          '50%': { opacity: '1', boxShadow: '0 0 40px rgba(249, 115, 22, 0.6)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(249, 115, 22, 0.3)', boxShadow: '0 0 10px rgba(249, 115, 22, 0.1)' },
          '50%': { borderColor: 'rgba(249, 115, 22, 0.8)', boxShadow: '0 0 30px rgba(249, 115, 22, 0.4)' },
        },
      },
      animation: {
        'wave-move': 'wave-move 3s linear infinite',
        'wave-move-fast': 'wave-move 1.5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-down': 'slide-down 0.6s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'border-glow': 'border-glow 3s ease-in-out infinite',
      },
      boxShadow: {
        'glow-orange': '0 0 30px rgba(249, 115, 22, 0.3)',
        'glow-orange-lg': '0 0 60px rgba(249, 115, 22, 0.4)',
        'inner-glow': 'inset 0 0 30px rgba(249, 115, 22, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      opacity: {
        5: '0.05',
        15: '0.15',
        25: '0.25',
      },
    },
  },
  plugins: [],
};
