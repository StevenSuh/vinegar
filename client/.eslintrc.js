module.exports = {
  extends: [
    'airbnb-base',
    'prettier',
    'plugin:vue/recommended',
  ],
  rules: {
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-webpack-loader-syntax': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-v-html': 'off',
    'vue/html-self-closing': 'off',
  }
};

