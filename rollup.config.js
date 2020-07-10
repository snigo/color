import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/color.js',
    output: {
      file: 'lib/color.js',
      format: 'cjs',
    },
    plugins: [
      terser({
        keep_classnames: true,
      }),
    ],
  },
];
