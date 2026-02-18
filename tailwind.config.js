/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        vortex: {
          black: '#0D0D0D',     // Fondo profundo
          dark: '#121212',      // Superficie de cards
          purple: '#8B5CF6',    // Violeta Eléctrico (Acento)
          cyan: '#06B6D4',      // Cian Neón (Interactividad)
          gold: '#FBBF24',      // Dorado (Premios/Ganadores)
          silver: '#94A3B8',    // Bordes sutiles
        }
      },
      backgroundImage: {
        'vortex-gradient': 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(13,13,13,1) 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
