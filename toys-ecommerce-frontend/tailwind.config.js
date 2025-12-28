// toys-ecommerce-frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    // CRUCIAL: Scan all files inside the src directory with these extensions
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
   extend: {
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

