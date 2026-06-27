/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          500: "#3b6ef6",
          600: "#2952d4",
          700: "#1f3fa0",
        },
      },
    },
  },
  plugins: [],
};
