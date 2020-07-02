import { mix, mixLab } from '../src/mix';
import { sRGBColor, LabColor } from '../src/color';

test('mix function', () => {
  expect(mix('pink', 'blue', 0.3).toHexString()).toBe('#b386db');
  expect(mix('pink', 'rgb(0 0 255 / 0.3)').toHexString()).toBe('#b386db');
  expect(mix('white', 'black', 0.5).name).toBe('gray');
  expect(mix('red', 'yellow', 0).name).toBe('red');
  expect(mix('red', 'yellow', 1).name).toBe('yellow');
  expect(mix('red', 'yellow', 0.5)).toBeInstanceOf(sRGBColor);
});

test('mixLab function', () => {
  expect(mixLab('pink', 'blue', 0.3).toRgb().toHexString()).toBe('#afa736');
  expect(mixLab('pink', 'rgb(0 0 255 / 0.3)').toRgb().toHexString()).toBe('#afa736');
  expect(mixLab('white', 'black', 0.5).toRgb().toHexString()).toBe('#777777');
  expect(mixLab('white', 'black', 0.5).lightness).toBe(0.5);
  expect(mixLab('red', 'yellow', 0).toRgb().name).toBe('red');
  expect(mixLab('red', 'yellow', 1).toRgb().name).toBe('yellow');
  expect(mixLab('red', 'yellow', 0.5)).toBeInstanceOf(LabColor);
});
