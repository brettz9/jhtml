import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

/**
 * @param {object} config
 * @param {"esm"|"umd"} [config.format] Rollup format
 * @param {boolean} [config.minifying] Whether to minify
 * @returns {import('rollup').RollupOptions}
 */
function getRollupConfig ({minifying = false, format = 'umd'} = {}) {
  const nonMinified = {
    input: 'src/jhtml.js',
    output: {
      file: `dist/jhtml${
        format === 'esm' ? '-esm' : ''
      }${
        minifying ? '.min' : ''
      }.${format === 'esm' ? 'm' : ''}js`,
      format,
      sourcemap: minifying,
      name: 'JHTML'
    },
    plugins: [
      babel({
        babelHelpers: 'bundled'
      })
    ]
  };
  if (minifying) {
    nonMinified.plugins.push(terser());
  }
  return nonMinified;
}

/**
 * @param {object} config
 * @param {"esm"|"umd"} [config.format] Rollup format
 * @param {boolean} [config.minifying] Whether to minify
 * @returns {import('rollup').RollupOptions}
 */
function getRollupConfigForBrowser ({minifying = false, format = 'umd'} = {}) {
  const nonMinified = {
    input: 'src/jhtml-browser.js',
    output: {
      file: `dist/jhtml-browser${
        format === 'esm' ? '-esm' : ''
      }${
        minifying ? '.min' : ''
      }.${format === 'esm' ? 'm' : ''}js`,
      format,
      sourcemap: minifying,
      name: 'JHTML'
    },
    plugins: [
      babel({
        babelHelpers: 'bundled'
      })
    ]
  };
  if (minifying) {
    nonMinified.plugins.push(terser());
  }
  return nonMinified;
}

/**
 * @param {object} config
 * @param {"esm"|"umd"} [config.format] Rollup format
 * @param {boolean} [config.minifying] Whether to minify
 * @returns {import('rollup').RollupOptions}
 */
function getRollupConfigForNode ({minifying = false, format = 'cjs'} = {}) {
  const nonMinified = {
    input: 'src/jhtml-node.js',
    external: ['jsdom'],
    output: {
      file: `dist/jhtml-node${
        format === 'esm' ? '-esm' : ''
      }${
        minifying ? '.min' : ''
      }.${format === 'esm' ? 'm' : ''}js`,
      format,
      sourcemap: minifying,
      name: 'JHTML'
    },
    plugins: [
      babel({
        babelHelpers: 'bundled'
      })
    ]
  };
  if (minifying) {
    nonMinified.plugins.push(terser());
  }
  return nonMinified;
}

/**
 * @param {object} config
 * @param {"esm"|"umd"} [config.format] Rollup format
 * @param {boolean} [config.minifying] Whether to minify
 * @returns {import('rollup').RollupOptions}
 */
function getRollupConfigForSAJJ ({minifying = false, format = 'umd'} = {}) {
  const nonMinified = {
    input: 'src/SAJJ/SAJJ.Stringifier.js',
    output: {
      file: `dist/SAJJ.Stringifier${
        format === 'esm' ? '-esm' : ''
      }${
        minifying ? '.min' : ''
      }.${format === 'esm' ? 'm' : ''}js`,
      format,
      sourcemap: minifying,
      name: 'SAJJ'
    },
    plugins: [
      babel({
        babelHelpers: 'bundled'
      })
    ]
  };
  if (minifying) {
    nonMinified.plugins.push(terser());
  }
  return nonMinified;
}

export default [
  getRollupConfig({format: 'umd'}),
  getRollupConfig({format: 'esm'}),
  getRollupConfigForBrowser({format: 'umd'}),
  getRollupConfigForBrowser({format: 'esm'}),
  getRollupConfigForNode({format: 'cjs'}),
  getRollupConfigForNode({format: 'esm'}),
  getRollupConfigForSAJJ({format: 'umd'}),
  getRollupConfigForSAJJ({format: 'esm'})
];
