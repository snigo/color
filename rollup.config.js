import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/color.js',
    output: {
      file: 'lib/color.js',
      format: 'es',
    },
    plugins: [
      terser({
        keep_classnames: true,
      }),
    ],
  },
];
