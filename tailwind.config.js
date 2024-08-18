const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    fontFamily: {
      sans: ["var(--font-montserrat)", "sans-serif"],
      mono: ["var(--font-space-mono)", "monospace"],
      roboto: ["var(--font-roboto)", "sans-serif"],
    },
    colors: {
      white: colors.white,
      black: colors.black,
      transparent: colors.transparent,
      red: {
        500: "#CC3333",
      },
      green: {
        500: "#008800",
      },
      blue: {
        200: "#A7BDFF",
        300: "#85A4FF",
        400: "#7879F1",
        500: "#4B11F1",
      },
      gray: {
        200: "#EEEEEE",
        300: "#C8CCD0",
        500: "#75715E",
        700: "#333333",
        800: "#2C2C2C",
        900: "#0E0E2C",
      },
    },
  },
  plugins: [
    function ({ addBase, theme }) {
      // Expose colors as css variables
      function extractColorVars(colorObj, colorGroup = "") {
        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey];

          const newVars =
            typeof value === "string"
              ? { [`--color${colorGroup}-${colorKey}`]: value }
              : extractColorVars(value, `-${colorKey}`);

          return { ...vars, ...newVars };
        }, {});
      }

      addBase({
        ":root": extractColorVars(theme("colors")),
      });
    },
  ],
};
