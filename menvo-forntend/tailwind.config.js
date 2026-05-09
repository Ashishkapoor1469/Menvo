/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-page': '#F5C842',
        'bg-card': '#FFFFFF',
        'brand-dark': '#1B2340',
        'accent-green': '#2E7D32',
        'accent-green-hover': '#1B5E20',
        'accent-green-light': '#E8F5E9',
        'yellow-light': '#FFF8DC',
        'text-primary': '#1B2340',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        'input-border': '#CBD5E1',
        'input-border-focus': '#1B2340',
        'input-bg': '#FFFFFF',
        'surface-1': '#F9FAFB',
        'surface-2': '#F3F4F6',
        'border': '#E5E7EB',
        'error': '#DC2626',
        'error-bg': '#FEF2F2',
        'link': '#1B2340',
        'link-underline': '#2E7D32',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
