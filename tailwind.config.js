/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/html/*', './src/js/popup/*', './src/js/analyze/*'],
  theme: {
    extend: {}
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: false, // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: 'dark', // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '' // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
  }
}
