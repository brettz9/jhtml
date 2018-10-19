import ashNazg from 'eslint-config-ash-nazg';

export default [
  {
    ignores: [
      'dist',
      '.eslint-config-inspector',
      'src/SAJJ/older'
    ]
  },
  ...ashNazg(['sauron']),
  ...ashNazg(['sauron', 'browser']).map((cfg) => {
    return {
      ...cfg,
      files: [
        'jhtml.testing.js',
        'src/SAJJ/older/js-xquery-xsl/**',
        'src/SAJJ/testing/SAJJ.testing.js',
        '**/*.html'
      ]
    };
  }),
  {
    files: ['**/*.md/*.js'],
    languageOptions: {
      globals: {
        JHTML: true
      }
    },
    rules: {
      'no-unused-vars': ['error', {varsIgnorePattern: 'JHTML'}],
      'no-shadow': 0,
      'import/no-unresolved': ['error', {ignore: ['jhtml']}],
      'import/unambiguous': 0
    }
  },
  {
    rules: {
      'class-methods-use-this': 0,
      'promise/prefer-await-to-callbacks': 0,
      'no-empty-function': 0,

      // Disabling for now
      'prefer-named-capture-group': 0
    }
  }
];
