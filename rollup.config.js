import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'min/color.js',
      format: 'iife',
      name: 'Color',
      plugins: [terser({ keep_classnames: true })],
    },
    {
      file: 'lib/color.js',
      format: 'cjs',
    },
    {
      file: 'module/color.js',
      format: 'es',
    },
  ],
};
