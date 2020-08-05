import { namedColors, getColorName, parseNamed } from '../src/utils/named';

test('correct format of parseNamed output', () => {
  expect(namedColors.size).toBe(438);
});

test('correctly parses random colors', () => {
  expect(parseNamed('azure')).toEqual([240, 255, 255, 180, 1, 0.97, 1]);
  expect(parseNamed('black')).toEqual([0, 0, 0, 0, 0, 0, 1]);
  expect(parseNamed('blue')).toEqual([0, 0, 255, 240, 1, 0.5, 1]);
  expect(parseNamed('coral')).toEqual([255, 127, 80, 16, 1, 0.66, 1]);
  expect(parseNamed('darkgrey')).toEqual([169, 169, 169, 0, 0, 0.66, 1]);
  expect(parseNamed('darkorange')).toEqual([255, 140, 0, 33, 1, 0.5, 1]);
  expect(parseNamed('forestgreen')).toEqual([34, 139, 34, 120, 0.61, 0.34, 1]);
  expect(parseNamed('#fffaf0')).toEqual([255, 250, 240, 40, 1, 0.97, 1]);
  expect(parseNamed('gray')).toEqual([128, 128, 128, 0, 0, 0.5, 1]);
  expect(parseNamed('grey')).toEqual([128, 128, 128, 0, 0, 0.5, 1]);
  expect(parseNamed('#808080')).toEqual([128, 128, 128, 0, 0, 0.5, 1]);
  expect(parseNamed('#008000')).toEqual([0, 128, 0, 120, 1, 0.25, 1]);
  expect(parseNamed('#4b0082')).toEqual([75, 0, 130, 275, 1, 0.25, 1]);
  expect(parseNamed('#fffff0')).toEqual([255, 255, 240, 60, 1, 0.97, 1]);
  expect(parseNamed('lightgreen')).toEqual([144, 238, 144, 120, 0.73, 0.75, 1]);
  expect(parseNamed('#d3d3d3')).toEqual([211, 211, 211, 0, 0, 0.83, 1]);
  expect(parseNamed('#00ff00')).toEqual([0, 255, 0, 120, 1, 0.5, 1]);
  expect(parseNamed('#0f0')).toEqual([0, 255, 0, 120, 1, 0.5, 1]);
  expect(parseNamed('#b0c4de')).toEqual([176, 196, 222, 214, 0.41, 0.78, 1]);
  expect(parseNamed('magenta')).toEqual([255, 0, 255, 300, 1, 0.5, 1]);
  expect(parseNamed('fuchsia')).toEqual([255, 0, 255, 300, 1, 0.5, 1]);
  expect(parseNamed('#ff00ff')).toEqual([255, 0, 255, 300, 1, 0.5, 1]);
  expect(parseNamed('#f0f')).toEqual([255, 0, 255, 300, 1, 0.5, 1]);
  expect(parseNamed('#0000cd')).toEqual([0, 0, 205, 240, 1, 0.4, 1]);
  expect(parseNamed('mistyrose')).toEqual([255, 228, 225, 6, 1, 0.94, 1]);
  expect(parseNamed('#000080')).toEqual([0, 0, 128, 240, 1, 0.25, 1]);
  expect(parseNamed('orange')).toEqual([255, 165, 0, 39, 1, 0.5, 1]);
  expect(parseNamed('#ff4500')).toEqual([255, 69, 0, 16, 1, 0.5, 1]);
  expect(parseNamed('pink')).toEqual([255, 192, 203, 350, 1, 0.88, 1]);
  expect(parseNamed('#800080')).toEqual([128, 0, 128, 300, 1, 0.25, 1]);
  expect(parseNamed('royalblue')).toEqual([65, 105, 225, 225, 0.73, 0.57, 1]);
  expect(parseNamed('#ff0000')).toEqual([255, 0, 0, 0, 1, 0.5, 1]);
  expect(parseNamed('#f00')).toEqual([255, 0, 0, 0, 1, 0.5, 1]);
  expect(parseNamed('silver')).toEqual([192, 192, 192, 0, 0, 0.75, 1]);
  expect(parseNamed('#fffafa')).toEqual([255, 250, 250, 0, 1, 0.99, 1]);
  expect(parseNamed('white')).toEqual([255, 255, 255, 0, 0, 1, 1]);
  expect(parseNamed('#ffffff')).toEqual([255, 255, 255, 0, 0, 1, 1]);
  expect(parseNamed('#fff')).toEqual([255, 255, 255, 0, 0, 1, 1]);
  expect(parseNamed('#ffff00')).toEqual([255, 255, 0, 60, 1, 0.5, 1]);
  expect(parseNamed('#ff0')).toEqual([255, 255, 0, 60, 1, 0.5, 1]);
});

test('returns undefined if did not parsed', () => {
  expect(parseNamed()).toBeUndefined();
  expect(parseNamed(null)).toBeUndefined();
  expect(parseNamed('')).toBeUndefined();
  expect(parseNamed('creamson')).toBeUndefined();
  expect(parseNamed('meganta')).toBeUndefined();
  expect(parseNamed('rain')).toBeUndefined();
});

test('correctly retrieves color names', () => {
  expect(getColorName('#f0f8ff')).toBe('aliceblue');
  expect(getColorName('#0ff')).toBe('cyan');
  expect(getColorName('#a52a2a')).toBe('brown');
  expect(getColorName('#9932cc')).toBe('darkorchid');
  expect(getColorName('dimgrey')).toBe('dimgray');
  expect(getColorName('#696969')).toBe('dimgray');
  expect(getColorName('#ffd700')).toBe('gold');
  expect(getColorName('#0f0')).toBe('lime');
  expect(getColorName('#f5fffa')).toBe('mintcream');
  expect(getColorName('#639')).toBe('rebeccapurple');
  expect(getColorName('#663399')).toBe('rebeccapurple');

  // Otherwise returns undefined
  expect(getColorName('lame')).toBeUndefined();
  expect(getColorName('#dead')).toBeUndefined();
  expect(getColorName('ff0')).toBeUndefined();
  expect(getColorName('ffed34')).toBeUndefined();
  expect(getColorName('#ff')).toBeUndefined();
  expect(getColorName('#abc')).toBeUndefined();
  expect(getColorName('#123456')).toBeUndefined();
  expect(getColorName('#fffffffff')).toBeUndefined();
});
