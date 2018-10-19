import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';

/**
 * @external RollupConfig
 * @type {PlainObject}
 * @see {@link https://rollupjs.org/guide/en#big-list-of-options}
 */

/**
 * @param {PlainObject} config
 * @param {"esm"|"umd"} [config.format] Rollup format
 * @param {boolean} [config.minifying] Whether to minify
 * @returns {external:RollupConfig}
 */
function getRollupConfig ({minifying = false, format = 'umd'} = {}) {
  const nonMinified = {
    input: 'src/jhtml.js',
    output: {
      file: `dist/JHTML${
        format === 'esm' ? '-esm' : ''
      }${
        minifying ? '.min' : ''
      }.js`,
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

// eslint-disable-next-line import/no-anonymous-default-export
export default [
  getRollupConfig({format: 'umd'}),
  getRollupConfig({format: 'esm'})
];
