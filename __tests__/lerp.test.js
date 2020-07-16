import { LabColor, sRGBColor } from '../src/color';
import lerp from '../src/lerp';

test('lerp function should return array of color instances', () => {
  const rgbLerp = lerp('rgb', { from: 'green', to: 'yellow', stops: 4 });
  expect(Array.isArray(rgbLerp)).toBe(true);
  expect(rgbLerp).toHaveLength(6);
  expect(rgbLerp.every((c) => c instanceof sRGBColor)).toBe(true);
  expect(rgbLerp[0].name).toBe('green');
  expect(rgbLerp[5].name).toBe('yellow');

  const hslLerp = lerp('hsl', { from: 'green', to: 'yellow', stops: 5 });
  expect(Array.isArray(hslLerp)).toBe(true);
  expect(hslLerp).toHaveLength(7);
  expect(hslLerp.every((c) => c instanceof sRGBColor)).toBe(true);
  expect(hslLerp[0].name).toBe('green');
  expect(hslLerp[6].name).toBe('yellow');

  const labLerp = lerp('lab', { from: 'green', to: 'yellow', stops: 6 });
  expect(Array.isArray(labLerp)).toBe(true);
  expect(labLerp).toHaveLength(8);
  expect(labLerp.every((c) => c instanceof LabColor)).toBe(true);
  expect(labLerp[0].toRgb().name).toBe('green');
  expect(labLerp[7].toRgb().name).toBe('yellow');

  const lchLerp = lerp('lch', { from: 'green', to: 'yellow', stops: 7 });
  expect(Array.isArray(lchLerp)).toBe(true);
  expect(lchLerp).toHaveLength(9);
  expect(lchLerp.every((c) => c instanceof LabColor)).toBe(true);
  expect(lchLerp[0].toRgb().name).toBe('green');
  expect(lchLerp[8].toRgb().name).toBe('yellow');
});

test('lerp function should allow currying', () => {
  const lerpRgb = lerp('rgb');
  expect(typeof lerpRgb).toBe('function');
  const lerpRgbColors = lerpRgb({ from: 'green', to: 'yellow', stops: 4 });
  expect(Array.isArray(lerpRgbColors)).toBe(true);
  expect(lerpRgbColors).toHaveLength(6);
  expect(lerpRgbColors.every((c) => c instanceof sRGBColor)).toBe(true);
  expect(lerpRgbColors[0].name).toBe('green');
  expect(lerpRgbColors[5].name).toBe('yellow');

  const lerpHsl = lerp('hsl');
  expect(typeof lerpHsl).toBe('function');
  const lerpHslColors = lerpHsl({ from: 'green', to: 'yellow', stops: 5 });
  expect(Array.isArray(lerpHslColors)).toBe(true);
  expect(lerpHslColors).toHaveLength(7);
  expect(lerpHslColors.every((c) => c instanceof sRGBColor)).toBe(true);
  expect(lerpHslColors[0].name).toBe('green');
  expect(lerpHslColors[6].name).toBe('yellow');

  const lerpLab = lerp('lab');
  expect(typeof lerpLab).toBe('function');
  const lerpLabColors = lerpLab({ from: 'green', to: 'yellow', stops: 6 });
  expect(Array.isArray(lerpLabColors)).toBe(true);
  expect(lerpLabColors).toHaveLength(8);
  expect(lerpLabColors.every((c) => c instanceof LabColor)).toBe(true);
  expect(lerpLabColors[0].toRgb().name).toBe('green');
  expect(lerpLabColors[7].toRgb().name).toBe('yellow');

  const lerpLch = lerp('lch');
  expect(typeof lerpLch).toBe('function');
  const lerpLchColors = lerpLch({ from: 'green', to: 'yellow', stops: 1 });
  expect(Array.isArray(lerpLchColors)).toBe(true);
  expect(lerpLchColors).toHaveLength(3);
  expect(lerpLchColors.every((c) => c instanceof LabColor)).toBe(true);
  expect(lerpLchColors[0].toRgb().name).toBe('green');
  expect(lerpLchColors[2].toRgb().name).toBe('yellow');
});

test('lerp function should correctly interpolate values', () => {
  expect(lerp('rgb', { from: 'white', to: 'black', stops: 4 }).map((c) => c.toHexString()))
    .toEqual(['#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#000000']);
  expect(lerp('rgb', { from: 'white', to: 'black', stops: 3 }).map((c) => c.toHexString()))
    .toEqual(['#ffffff', '#bfbfbf', '#808080', '#404040', '#000000']);
  expect(lerp('rgb', { from: 'black', to: 'white', stops: 4 }).map((c) => c.toHexString()))
    .toEqual(['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff']);
  expect(lerp('rgb', { from: 'black', to: 'white', stops: 3 }).map((c) => c.toHexString()))
    .toEqual(['#000000', '#404040', '#808080', '#bfbfbf', '#ffffff']);
  expect(lerp('hsl', { from: 'red', to: 'cyan', stops: 5 }).map((c) => c.hue))
    .toEqual([0, 30, 60, 90, 120, 150, 180]);
  expect(lerp('hsl', { from: 'gray', to: 'blue', stops: 9 }).map((c) => c.saturation))
    .toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
  expect(lerp('lab', { from: 'white', to: 'lab(65% -100 34)', stops: 4 }).map((c) => c.a))
    .toEqual([0, -20, -40, -60, -80, -100]);
  expect(lerp('lch', { from: 'black', to: 'lch(65% 120 314deg)', stops: 5 }).map((c) => c.chroma))
    .toEqual([0, 20, 40, 60, 80, 100, 120]);
  expect(lerp('lch', { from: 'lch(25% 50 0)', to: 'lch(25% 50 345)', stops: 14 }).map((c) => c.hue))
    .toEqual([0, 359, 358, 357, 356, 355, 354, 353, 352, 351, 350, 349, 348, 347, 346, 345]);
});

test('edge cases', () => {
  expect(typeof lerp()).toBe('function');

  const longCurry = lerp()()()()({ from: 'white', to: 'transparent' });
  expect(longCurry).toHaveLength(3);
  expect(longCurry.map((c) => c.toRgbString()))
    .toEqual(['rgb(255 255 255)', 'rgb(128 128 128 / 0.5)', 'rgb(0 0 0 / 0)']);

  expect(lerp('hsl', { from: 'red', to: 'red', stops: 5 }).map((c) => c.hue))
    .toEqual([0, 60, 120, 180, 240, 300, 0]);

  expect(lerp('hsl', {
    from: 'red',
    to: 'red',
    stops: 5,
    includeLast: 0,
  }).map((c) => c.hue))
    .toEqual([0, 60, 120, 180, 240, 300]);
});
