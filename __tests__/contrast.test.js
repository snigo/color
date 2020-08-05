import { contrast, sRGBColor } from '../src';

test('contrast function and its methods', () => {
  expect(typeof contrast).toBe('function');
  expect(typeof contrast.find).toBe('function');
  expect(typeof contrast.min).toBe('function');
  expect(typeof contrast.max).toBe('function');
  expect(typeof contrast.validate).toBe('function');
});

test('contrast function should be curriable', () => {
  const baseContrast = contrast('#2a2e2f');
  expect(typeof baseContrast).toBe('function');
  expect(typeof baseContrast.find).toBe('function');
  expect(typeof baseContrast.min).toBe('function');
  expect(typeof baseContrast.max).toBe('function');
  expect(typeof baseContrast.validate).toBe('function');
  expect(baseContrast('white')).toBe(13.72);
});

test('contrast function should correctly calculate contrast', () => {
  expect(contrast('#fff', '#000')).toBe(21);
  expect(contrast('#000', '#fff')).toBe(21);
  expect(contrast('yellow', 'pink', 4)).toBe(1.4322);
  expect(contrast('yellow', 'pink', 7)).toBe(1.4322007);
  expect(contrast('blue')('lime')).toBe(6.26);
  expect(contrast('blue')('lime', 3)).toBe(6.263);
  expect(contrast()('green')).toBe(5.14);
  expect(contrast()('white')).toBe(1);
});

test('contrast.find method should find color by hue, saturation and target contrast', () => {
  const baseContrast = contrast('aliceblue');
  const targetContrast = 4.5;
  const response = baseContrast.find({
    hue: 294,
    saturation: 0.45,
    targetContrast,
  });
  expect(Array.isArray(response)).toBe(true);
  expect(response).toHaveLength(1);
  expect(response[0].hue).toBe(294);
  expect(response[0].saturation).toBe(0.45);
  expect(baseContrast(response[0])).toBeCloseTo(targetContrast, 1);
});

test('contrast.min method should find color with minimum contrast value', () => {
  const colors = [
    'yellow',
    'red',
    'blue',
  ];
  expect(contrast.min('white', colors)).toBeInstanceOf(sRGBColor);
  expect(contrast.min('white', colors).name).toBe('yellow');
  expect(contrast.min('black', colors).name).toBe('blue');
});

test('contrast.max method should find color with maximum contrast value', () => {
  const colors = [
    'yellow',
    'red',
    'blue',
  ];
  expect(contrast.max('white', colors)).toBeInstanceOf(sRGBColor);
  expect(contrast.max('white', colors).name).toBe('blue');
  expect(contrast.max('black', colors).name).toBe('yellow');
});

test('contrast.validate method should return wcag specification', () => {
  const result = contrast('#fff').validate('red');
  expect(result).toHaveProperty('wcag-aa-large-text', true);
  expect(result).toHaveProperty('wcag-aa-normal-text', false);
  expect(result).toHaveProperty('wcag-aa-ui', true);
  expect(result).toHaveProperty('wcag-aaa-large-text', false);
  expect(result).toHaveProperty('wcag-aaa-normal-text', false);
});
