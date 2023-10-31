/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {},
      colors: {
        ...require('tailwindcss/colors'),
        'primary': '#F65670',
        'primary-dark': '#cc475d',
        'default-white': 'rgb(166, 173, 186)',
        'dark': '#141414',

        'nomod': '#6FA8DC',
        'color-hidden': '#FFD966',
        'hardrock': '#E06666',
        'doubletime': '#8E7CC3',
        'freemod': '#F6B26B',
        'tiebreaker': '#C27BA0',
      },
    },
  },
  daisyui: {
    themes: ["cupcake", "dark", "cmyk"],
  },

  plugins: [require('daisyui')],
}
