const js = require("@eslint/js");
module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        structuredClone: "readonly",
        __dirname: "readonly",
      },
    },
  },
  {
    files: ["src/static/script.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        document: "readonly",
        window: "readonly",
        IntersectionObserver: "readonly",
      },
    },
  },
];
