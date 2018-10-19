module.exports = {
  "extends": "ash-nazg/sauron-node",
  "env": {
    "browser": true,
    "es6": true
  },
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  settings: {
    polyfills: [
      'console',
      'document.body',
      'document.createTreeWalker',
      'document.querySelector',
      'document.querySelectorAll',
      'DOMParser',
      'Error',
      'JSON'
    ]
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "overrides": [
    {
      "files": "test/**.js",
      globals: {
          "JHTML": "readonly",
          "assert": "readonly",
          "require": "readonly"
      },
      "env": {"mocha": true},
      "rules": {
        "import/unambiguous": "off"
      }
    },
    {
      files: ['*.html'],
      rules: {
        'import/unambiguous': 0
      }
    },
    {
      files: ['*.md'],
      globals: {
        JHTML: true
      },
      rules: {}
    }
  ],
  "rules": {
    // Disabling for now
    "max-len": "off",
    "require-unicode-regexp": "off",
    "jsdoc/require-jsdoc": "off",
    'prefer-named-capture-group': 0,
    'promise/prefer-await-to-callbacks': 0,
    'no-empty-function': 0
  }
};
