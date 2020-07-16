import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/color.js',
    output: {
      file: 'min/color.js',
      format: 'iife',
      name: 'Color',
    },
    plugins: [
      terser({
        keep_classnames: true,
      }),
    ],
  },
  {
    input: 'src/color.js',
    output: {
      file: 'lib/color.js',
      format: 'cjs',
    },
  },
  {
    input: 'src/color.js',
    output: {
      file: 'module/color.js',
      format: 'es',
    },
  },
];
