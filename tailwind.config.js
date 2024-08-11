const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    fontFamily: {
      sans: ["Montserrat", "sans-serif"],
      mono: ["Space Mono", "monospace"],
    },
    colors: {
      white: colors.white,
      black: colors.black,
      transparent: colors.transparent,
      gray: colors.gray,
      blue: {
        200: "#A7BDFF",
        300: "#85A4FF",
        500: "#4B11F1",
      },
    },
  },
  plugins: [
    function({ addBase, theme }) {
      // Expose colors as css variables
      function extractColorVars(colorObj, colorGroup = '') {
        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey];

          const newVars =
            typeof value === 'string'
              ? { [`--color${colorGroup}-${colorKey}`]: value }
              : extractColorVars(value, `-${colorKey}`);

          return { ...vars, ...newVars };
        }, {});
      }

      addBase({
        ':root': extractColorVars(theme('colors')),
      });
    },
  ],
};
