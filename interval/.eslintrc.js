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
    'node/no-extraneous-require': 'off',
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
    'no-await-in-loop': 'off',
    'no-console': 'off',
  },
};
