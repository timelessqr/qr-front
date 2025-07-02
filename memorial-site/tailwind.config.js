/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'memorial': ['Lora', 'Georgia', 'serif'],
        'elegant': ['Lora', 'Georgia', 'serif'],
        'serif': ['Lora', 'Georgia', 'serif'],
      },
      fontSize: {
        'memorial-title': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'memorial-subtitle': ['1.5rem', { lineHeight: '1.3', fontWeight: '500' }],
        'memorial-body': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'memorial-caption': ['0.9rem', { lineHeight: '1.4', fontWeight: '400' }],
      }
    },
  },
  plugins: [],
}