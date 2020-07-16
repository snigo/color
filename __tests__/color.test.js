import {
  color,
  sRGBColor,
  XYZColor,
  LabColor,
} from '../src/color';

test('should parse color in #-hexadecimal format', () => {
  const c1 = color('#ff0099ff');
  expect(c1).toBeInstanceOf(sRGBColor);
  expect(c1.red).toBe(255);
  expect(c1.green).toBe(0);
  expect(c1.blue).toBe(153);
  expect(c1.alpha).toBe(1);

  const c2 = color('#33AA3380');
  expect(c2.alpha).toBe(0.502);
  expect(c2.toHexString()).toBe('#33aa3380');

  const c3 = color('#ff0099');
  expect(c3).toBeInstanceOf(sRGBColor);
  expect(c3.red).toBe(255);
  expect(c3.green).toBe(0);
  expect(c3.alpha).toBe(1);

  const c4 = color('#3a38');
  expect(c4.toHexString()).toBe('#33aa3388');

  const c5 = color('#ff0');
  expect(c5.name).toBe('yellow');
});

test('should parse named colors', () => {
  const palegreen = color('palegreen');
  expect(palegreen).toBeInstanceOf(sRGBColor);
  expect(palegreen.toHexString()).toBe('#98fb98');

  const darkSalmon = color('DarkSalmon');
  expect(darkSalmon).toBeInstanceOf(sRGBColor);
  expect(darkSalmon.toRgbString()).toBe('rgb(233 150 122)');

  const azure = color('AZURE');
  expect(azure).toBeInstanceOf(sRGBColor);
  expect(azure.toHslString()).toBe('hsl(180deg 100% 97%)');

  const yellow = color('yelloW');
  expect(yellow).toBeInstanceOf(sRGBColor);
  expect(yellow.name).toBe('yellow');
});

test('should parse rgba notation colors', () => {
  expect(color('rgb(255,0,153)').toRgbString()).toBe('rgb(255 0 153)');
  expect(color('rgb(255 0 153)').toRgbString()).toBe('rgb(255 0 153)');
  expect(color('rgba(255,0,153)').toRgbString()).toBe('rgb(255 0 153)');
  expect(color('rgba(255 0 153)').toRgbString()).toBe('rgb(255 0 153)');
  expect(color('rgb(255,0,153,.45)').toRgbString()).toBe('rgb(255 0 153 / 0.45)');
  expect(color('rgb(255 0 153 / 45%)').toRgbString('relative')).toBe('rgb(100% 0% 60% / 45%)');
  expect(color('RGBA(  45%  ,  0%  ,  3%  )').toRgbString('relative')).toBe('rgb(45.1% 0% 3.1%)');
  expect(color('rGbA(.23e3, +346e-1, -255, .34e1%)').toRgbString()).toBe('rgb(230 35 0 / 0.034)');
});

test('should parse hsla notation colors', () => {
  expect(color('hsl(666, 0%, 153%)').name).toBe('white');
  expect(color('hsl(0.1turn 60% 15%)').hue).toBe(36);
  expect(color('hsla(400grad,40%,1%)').toHslString()).toBe('hsl(0deg 40% 1%)');
  expect(color('hsla(0 0% 0%)').name).toBe('black');
  expect(color('hsl(15,50%,35%,.45)').toHslString()).toBe('hsl(15deg 50% 35% / 0.45)');
  expect(color('hsl(15 50% 35% / 45%)').toHslString()).toBe('hsl(15deg 50% 35% / 0.45)');
  expect(color('HSLA(  3.14rad  ,  0%  ,  3%  )').toHslString()).toBe('hsl(179.9deg 0% 3%)');
  expect(color('hSLA(.23e3grAD, +346E-1%, -2%, .34e1)').toHslString()).toBe('hsl(207deg 34.6% 0%)');
});

test('should parse hwba notation colors', () => {
  expect(color('hwb(666 0% 153%)').name).toBe('white');
  expect(color('hwb( 400grad 40% 10% )').toHwbString()).toBe('hwb(0deg 40% 9.8%)');
  expect(color('hwb(0 0% 0%)').name).toBe('red');
  expect(color('hwb(-15 50% 35% / .45)').toHwbString(0)).toBe('hwb(345deg 50% 35% / 0.45)');
});

test('should parse lab colors', () => {
  expect(color('lab(66% 0 224)').toLabString()).toBe('lab(66% 0 127)');
  expect(color('lab(150% -40 4.342)').toLabString()).toBe('lab(100% -40 4.342)');
  expect(color('lch(64% 103.45 0.4rad)').toLchString(2)).toBe('lch(64% 103.45 22.92deg)');
  expect(color('lch(15% 50 35deg / .45)').toLchString(0)).toBe('lch(15% 50 35deg / 0.45)');
});

test('should parse colors with descriptor object', () => {
  const rgb = color({
    red: 113,
    green: '25%',
    blue: '0xde',
  });
  expect(rgb).toBeInstanceOf(sRGBColor);
  expect(rgb.toRgbString()).toBe('rgb(113 64 222)');

  const hsl = color({
    hue: '-0.333turn',
    saturation: '25%',
    lightness: 0.5,
    alpha: '94%',
  });
  expect(hsl).toBeInstanceOf(sRGBColor);
  expect(hsl.toHslString(0)).toBe('hsl(240deg 25% 50% / 0.94)');

  const hwb = color({
    hue: `${Math.PI}rad`,
    whiteness: 0.45,
    blackness: -34,
  });
  expect(hwb).toBeInstanceOf(sRGBColor);
  expect(hwb.toHwbString(4)).toBe('hwb(180deg 45.098% 0%)');

  const xyz = color({
    x: 0.4125,
    y: 0.2127,
    z: 0.0193,
    whitePoint: XYZColor.D65,
  });
  expect(xyz).toBeInstanceOf(XYZColor);
  expect(xyz.toRgb().name).toBe('red');

  const lab = color({
    lightness: '50%',
    a: -34,
    b: 65,
    alpha: '99%',
  });
  expect(lab).toBeInstanceOf(LabColor);
  expect(lab.toLabString()).toBe('lab(50% -34 65 / 0.99)');
  expect(lab.toLchString(2)).toBe('lch(50% 73.36 117.61deg / 0.99)');

  const lch = color({
    lightness: 0.87,
    chroma: '3.4e1',
    hue: '65deg',
    alpha: 4,
  });
  expect(lch).toBeInstanceOf(LabColor);
  expect(lch.toLabString()).toBe('lab(87% 14.369 30.814)');
  expect(lch.toLchString()).toBe('lch(87% 34 65deg)');
  expect(lch.alpha).toBe(1);
});

test('should clone instance of color class', () => {
  const c = color('yellow');
  const d = color(c);
  expect(d).toBeInstanceOf(sRGBColor);
  expect(c === d).toBe(false);

  const l = color('lab(35% 23 -56)');
  const m = color(l);
  expect(m).toBeInstanceOf(LabColor);
  expect(l === m).toBe(false);
});

test('should return undefined if parsing failed', () => {
  expect(color('rbg(255 255 255)')).toBeUndefined();
  expect(color('hls(255 25% 25%)')).toBeUndefined();
  expect(color('hbw(255 25% 25%)')).toBeUndefined();
  expect(color('rbga (255 255 255)')).toBeUndefined();
  expect(color('lch(25%, 23, 255)')).toBeUndefined();
  expect(color('xyz(0.55 0.255 0.75)')).toBeUndefined();
  expect(color({ red: 255, green: 255, saturation: 0.8 })).toBeUndefined();
  expect(color({ hue: 255, luminance: 0.25, saturation: 0.8 })).toBeUndefined();
  expect(color({ X: 0.2, Y: 0.255, Z: 0.8 })).toBeUndefined();
  expect(color({ lightness: 0.5, a: -255, chroma: 84 })).toBeUndefined();
});

test('should interpret "transparent" keyword', () => {
  expect(color('transparent')).toBeInstanceOf(sRGBColor);
  expect(color('transparent').alpha).toBe(0);
});
