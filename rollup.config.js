import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default [
    // ES Module build
    {
        input: 'polylabel.js',
        output: {
            file: 'dist/polylabel.esm.js',
            format: 'es',
        },
        plugins: [resolve(), commonjs()],
    },
    // CommonJS build
    {
        input: 'polylabel.js',
        output: {
            file: 'dist/polylabel.cjs.js',
            format: 'cjs',
        },
        plugins: [resolve(), commonjs()],
    },
    // UMD build
    {
        input: 'polylabel.js',
        output: {
            file: 'dist/polylabel.umd.js',
            format: 'umd',
            name: 'polylabel',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**',
            }),
            terser(),
        ],
    },
    // Vanilla global build
    {
        input: 'polylabel.js',
        output: {
            file: 'dist/polylabel.global.js',
            format: 'iife',
            name: 'polylabel',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**',
            }),
            terser(),
        ],
    },
];
