import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

const input = './src/index.ts';
const name = 'ReactNextCalendar';
const globals = {
  react: 'React',
};
const babelOptions = {
  exclude: /node_modules/,
  runtimeHelpers: true,
};
const commonjsOptions = {
  include: /node_modules/,
};

export default [
  {
    input,
    output: {
      file: './dist/react-next-calendar.js',
      format: 'umd',
      name,
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      typescript(),
      nodeResolve(),
      babel(babelOptions),
      commonjs(commonjsOptions),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    ],
  },
  {
    input,
    output: {
      file: './dist/react-next-calendar.min.js',
      format: 'umd',
      name,
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      typescript(),
      nodeResolve(),
      babel(babelOptions),
      commonjs(commonjsOptions),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      terser(),
    ],
  },
  {
    input,
    output: { file: pkg.module, format: 'esm' },
    // prevent bundling all dependencies
    external: id => !id.startsWith('.') && !id.startsWith('/'),
    plugins: [babel(babelOptions), typescript()],
  },
];
