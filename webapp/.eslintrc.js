// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint",
    sourceType: "module"
  },
  env: {
    browser: true,
    node: true
  },
  // required to lint *.vue files
  plugins: [
    "html",
    "vue"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:vue/recommended"
  ],
  // add your custom rules here
  "rules": {
    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
    "no-console": 0,
    "quotes": 2
  }
}
