/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
      theme: {
  extend: {

    colors: {
      brand: {
        primary: "#6366F1",   // Indigo
        secondary: "#8B5CF6", // Purple
        accent: "#22C55E",    // Green
      },

      surface: "rgba(255,255,255,0.05)",
      border: "rgba(255,255,255,0.10)",
    },

    backdropBlur: {
      glass: "20px",
    },

    boxShadow: {
      glow: "0 0 40px rgba(99,102,241,0.35)",
      soft: "0 10px 40px rgba(0,0,0,0.35)",
    },

    backgroundImage: {
      "gradient-brand":
        "linear-gradient(135deg, #6366F1, #8B5CF6)",
    },

    typography: {
  DEFAULT: {
    css: {
      fontSize: "15px",
    },
  },
},

  },
},


  plugins: [require('@tailwindcss/typography')],
  }