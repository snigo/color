import {
  RGB_XYZ_MATRIX,
  XYZ_RGB_MATRIX,
  D65_D50_MATRIX,
  D50_D65_MATRIX,
  D50,
  D65,
  OCT_RANGE,
  DEG_RANGE,
  ONE_RANGE,
  BYTE_RANGE,
  CHROMA_RANGE,
  HEX_RE,
  HEX_RE_S,
  CMA_RE,
  WSP_RE,
} from '../src/utils/constants';

test('constants', () => {
  expect(Array.isArray(RGB_XYZ_MATRIX)).toBe(true);
  expect(RGB_XYZ_MATRIX.length).toBe(3);
  expect(RGB_XYZ_MATRIX.every((child) => (
    Array.isArray(child)
    && child.length === 3
    && child.every((n) => typeof n === 'number')
  ))).toBe(true);

  expect(Array.isArray(XYZ_RGB_MATRIX)).toBe(true);
  expect(XYZ_RGB_MATRIX.length).toBe(3);
  expect(XYZ_RGB_MATRIX.every((child) => (
    Array.isArray(child)
    && child.length === 3
    && child.every((n) => typeof n === 'number')
  ))).toBe(true);

  expect(Array.isArray(D65_D50_MATRIX)).toBe(true);
  expect(D65_D50_MATRIX.length).toBe(3);
  expect(D65_D50_MATRIX.every((child) => (
    Array.isArray(child)
    && child.length === 3
    && child.every((n) => typeof n === 'number')
  ))).toBe(true);

  expect(Array.isArray(D50_D65_MATRIX)).toBe(true);
  expect(D50_D65_MATRIX.length).toBe(3);
  expect(D50_D65_MATRIX.every((child) => (
    Array.isArray(child)
    && child.length === 3
    && child.every((n) => typeof n === 'number')
  ))).toBe(true);

  [D50, D65].forEach((wp) => {
    expect(Array.isArray(wp)).toBe(true);
    expect(wp.length).toBe(3);
    expect(wp.every((n) => typeof n === 'number')).toBe(true);
  });

  [
    OCT_RANGE,
    DEG_RANGE,
    ONE_RANGE,
    BYTE_RANGE,
    CHROMA_RANGE,
  ].forEach((range) => {
    expect(Array.isArray(range)).toBe(true);
    expect(range.length).toBe(2);
    expect(range.every((n) => typeof n === 'number')).toBe(true);
  });

  [
    HEX_RE,
    HEX_RE_S,
    CMA_RE,
    WSP_RE,
  ].forEach((re) => {
    expect(re).toBeInstanceOf(RegExp);
  });
});
