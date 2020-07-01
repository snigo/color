import gray from '../src/gray';
import { LabColor } from '../src/color';

test('gray function shall create Lab color instance', () => {
  const gray34 = gray(0.34);
  expect(gray34).toBeInstanceOf(LabColor);
  expect(gray34.a).toBe(0);
  expect(gray34.b).toBe(0);
  expect(gray34.lightness).toBe(0.34);

  const gray65 = gray('65%', 0.34);
  expect(gray65).toBeInstanceOf(LabColor);
  expect(gray65.a).toBe(0);
  expect(gray65.b).toBe(0);
  expect(gray65.lightness).toBe(0.65);
  expect(gray65.alpha).toBe(0.34);
});
