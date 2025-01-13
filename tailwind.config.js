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
        100: "#D4DFFF",
        200: "#A7BDFF",
        300: "#85A4FF",
        400: "#7879F1",
        450: "#5F5CFD",
        500: "#4B11F1",
      },
      purple: {
        100: "#EDEBFF",
        200: "#C5C3FF",
        500: "#6D75FE",
        600: "#5966FD",
        700: "#475CFC",
      },
      gray: {
        150: "#F3F3F3",
        200: "#EEEEEE",
        250: "#D9D9D9",
        300: "#C8CCD0",
        500: "#75715E",
        700: "#333333",
        800: "#2C2C2C",
        900: "#0E0E2C",
      },
      yellow: {
        800: "#F9A825",
        900: "#F57F17",
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
