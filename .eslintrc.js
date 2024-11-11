/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-var': 'error',
    'prefer-const': 'error',
    'no-console': ['warn', { 
      allow: ['error', 'warn'] 
    }],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always']
  },
  globals: {
    chrome: 'readonly'
  }
}; 