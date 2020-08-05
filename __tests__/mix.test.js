import { sRGBColor, LabColor, mix } from '../src';

test('mix function', () => {
  expect(mix('rgb', { start: 'pink', end: 'blue', alpha: 0.3 }).toHexString()).toBe('#b386db');
  expect(mix('rgb', { start: 'pink', end: 'rgb(0 0 255 / 0.3)' }).toHexString()).toBe('#b386db');
  expect(mix('rgb', { start: 'white', end: 'black', alpha: 0.5 }).name).toBe('gray');

  const mixRgb = mix('rgb');
  expect(mixRgb({ start: 'red', end: 'yellow', alpha: 0 }).name).toBe('red');
  expect(mixRgb({ start: 'red', end: 'yellow', alpha: 1 }).name).toBe('yellow');
  expect(mixRgb({ start: 'red', end: 'yellow', alpha: 0.5 })).toBeInstanceOf(sRGBColor);
});

test('mix in lab color space', () => {
  expect(mix('lab', { start: 'pink', end: 'blue', alpha: 0.3 }).toRgb().toHexString()).toBe('#d28bdd');
  expect(mix('lab', { start: 'pink', end: 'rgb(0 0 255 / 0.3)' }).toRgb().toHexString()).toBe('#d28bdd');
  expect(mix('lab', { start: 'white', end: 'black', alpha: 0.5 }).toRgb().toHexString()).toBe('#777777');
  expect(mix('lab', { start: 'white', end: 'black', alpha: 0.5 }).lightness).toBe(0.5);

  const mixLab = mix('lab');
  expect(mixLab({ start: 'red', end: 'yellow', alpha: 0 }).toRgb().name).toBe('red');
  expect(mixLab({ start: 'red', end: 'yellow', alpha: 1 }).toRgb().name).toBe('yellow');
  expect(mixLab({ start: 'red', end: 'yellow', alpha: 0.5 })).toBeInstanceOf(LabColor);
});
