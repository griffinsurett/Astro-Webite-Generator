// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx}",
    "./public/*.html",
  ],
  theme: {
    screens: {
      // Tailwind’s normal breakpoints for >= 768px, etc.
      md: "768px",
      lg: "1024px",
      // AND a custom “max-md” so we can style for <= 768px
      "max-md": { max: "768px" },
    },
    extend: {
      colors: {
        'gray-333': '#333333',
        'gray-666': '#666666',
        'gray-999': '#999999',
        'gray-f0':  '#f0f0f0',
        'gray-e0':  '#e0e0e0',
        'gray-ea':  '#eaeaea',
        'gray-f9':  '#f9f9f9',
        'blue-007acc': '#007acc',
        'blue-005fa3': '#005fa3',
      },
      boxShadow: {
        'lg-custom': '0 4px 14px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
