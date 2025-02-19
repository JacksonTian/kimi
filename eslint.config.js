import pluginJs from '@eslint/js';

export default [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      globals: {
        console: 'readonly',
        it: 'readonly',
        process: 'readonly',
        describe: 'readonly'
      }
    },
    'rules': {
      'indent': [
        2,
        2
      ],
      'quotes': [
        2,
        'single'
      ],
      'linebreak-style': [
        2,
        'unix'
      ],
      'semi': [2, 'always'],
      'strict': [2, 'global'],
      'curly': 2,
      'eqeqeq': 2,
      'no-eval': 2,
      'guard-for-in': 2,
      'no-caller': 2,
      'no-else-return': 2,
      'no-eq-null': 2,
      'no-extend-native': 2,
      'no-extra-bind': 2,
      'no-floating-decimal': 2,
      'no-implied-eval': 2,
      'no-labels': 2,
      'no-with': 2,
      'no-loop-func': 1,
      'no-native-reassign': 2,
      'no-redeclare': [2, { 'builtinGlobals': true }],
      'no-delete-var': 2,
      'no-shadow-restricted-names': 2,
      'no-undef-init': 2,
      'no-use-before-define': 2,
      'no-unused-vars': [2, { 'args': 'none', 'caughtErrors': 'none' }],
      'no-undef': 2,
      'callback-return': [2, ['callback', 'cb', 'next']],
      'global-require': 0,
      'no-console': 0
    }
  }

];