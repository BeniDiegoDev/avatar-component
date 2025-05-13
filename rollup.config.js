import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { visualizer } from 'rollup-plugin-visualizer';

export default {
    input: 'src/components/avatar-controller.ts',
    output: [
        {
            file: 'dist/avatar-controller.esm.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: 'dist/avatar-controller.cjs.js',
            format: 'cjs',
            sourcemap: true
        }
    ],
    external: ['lit', 'three', 'dat.gui'],
    plugins: [
        resolve(),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
        visualizer({ filename: 'bundle-report.html' })
    ]
};
