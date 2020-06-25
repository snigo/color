import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/color.js',
    output: {
      file: 'min/color.js',
      name: 'color',
      format: 'iife',
    },
    plugins: [
      terser({
        keep_classnames: true,
      }),
    ],
  },
];
