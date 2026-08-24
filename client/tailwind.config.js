/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5f8",
          100: "#d3e6ee",
          600: "#0f3d5c",
          700: "#0c3049",
          800: "#092536",
          900: "#061a26"
        },
        risk: {
          yellow: "#e6b800",
          orange: "#e07a1f",
          red: "#c62828",
          green: "#2e7d32"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
