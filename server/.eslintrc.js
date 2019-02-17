module.exports = {
  extends: [
    'airbnb-base',
    'plugin:node/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'import/no-unresolved': 'off',
    'node/no-missing-require': 'off',
    'func-names': 'off',
    'consistent-return': 'off',
  },
};
