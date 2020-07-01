/* eslint-disable import/no-cycle */
import {
  BYTE_RANGE,
  CHROMA_RANGE,
  ONE_RANGE,
  OCT_RANGE,
  WSP_RE,
  CMA_RE,
} from './constants';
import sRGBColor from './srgb/srgb.class';
import LabColor from './lab/lab.class';
import XYZColor from './xyz/xyz.class';

export function applyMatrix(xyz, matrix) {
  if (!xyz || !(Array.isArray(xyz) && xyz.length)) return undefined;
  if (!matrix || !(Array.isArray(matrix) && xyz.length === matrix.length)) return xyz;
  return xyz.map((_, i, _xyz) => _xyz.reduce((p, v, j) => p + v * matrix[j][i], 0));
}

export function clamp(range, value) {
  value = +value;
  if (value == null || Number.isNaN(value)) return NaN;
  if (!Array.isArray(range)) return value;

  if (value < range[0]) return range[0];
  if (value > range[1]) return range[1];
  return value;
}

export function defined(...args) {
  // eslint-disable-next-line eqeqeq
  return args.every((arg) => arg || (!arg && arg == 0));
}

export function fromFraction(range, value) {
  if (!Array.isArray(range)) return NaN;
  return range[0] + +value * (range[1] - range[0]);
}

export function modulo(a, b) {
  return ((+a % +b) + +b) % +b;
}

export function round(num, precision = 12) {
  return +(+(num * 10 ** precision).toFixed(0) * 10 ** -precision)
    .toFixed(precision < 0 ? 0 : precision);
}

export function toNumber(num, precision = 12) {
  if (num == null || Array.isArray(num)) return NaN;
  num = num.toString();
  num = /%$/.test(num) ? +num.slice(0, -1) / 100 : +num;
  if (precision !== undefined) {
    num = round(num, precision);
  }

  return num;
}

export function assumeAlpha(value) {
  return defined(value) ? clamp(ONE_RANGE, toNumber(value, 4)) : 1;
}

export function assumeByte(value) {
  return clamp(BYTE_RANGE, round(value, 7));
}

export function assumeChroma(value) {
  return clamp(CHROMA_RANGE, round(value, 7));
}

export function assumeHue(value) {
  if (typeof value === 'number') return round(modulo(value, 360), 7);
  if (typeof value !== 'string') return NaN;
  value = value.trim().toLowerCase();

  const hue = value.match(/^([+\-0-9e.]+)(turn|g?rad|deg)?$/);
  if (!hue) return NaN;
  hue[2] = hue[2] || 'deg';
  switch (hue[2]) {
    case 'turn':
      hue[1] *= 360;
      break;
    case 'rad':
      hue[1] *= (180 / Math.PI);
      break;
    case 'grad':
      hue[1] *= 0.9;
      break;
    case 'deg':
      break;
    default:
      return NaN;
  }

  return round(modulo(hue[1], 360), 7);
}

export function assumePercent(value) {
  if (typeof value === 'number') return clamp(ONE_RANGE, round(value, 7));
  if (typeof value !== 'string' || !/%$/.test(value)) return NaN;
  return clamp(ONE_RANGE, toNumber(value, 7));
}

export function assumeOctet(value) {
  if (typeof value === 'number') return clamp(OCT_RANGE, round(value, 0));
  if (typeof value !== 'string') return NaN;
  return clamp(OCT_RANGE, /%$/.test(value) ? fromFraction(OCT_RANGE, toNumber(value, 0)) : round(value, 0));
}

export function equal(a, b) {
  return a.every((e, i) => b[i] === e);
}

export function extractGroups(re, str) {
  return (re.exec(str.toLowerCase()) || []).filter((value, index) => index && !!value);
}

export function extractFnCommaGroups(fn, str) {
  const fnString = (fn === 'rgb' || fn === 'hsl') ? `${fn}a?` : fn;
  const re = new RegExp(`^${fnString}${CMA_RE.source}`);
  return extractGroups(re, str);
}

export function extractFnWhitespaceGroups(fn, str) {
  const fnString = (fn === 'rgb' || fn === 'hsl') ? `${fn}a?` : fn;
  const re = new RegExp(`^${fnString}${WSP_RE.source}`);
  return extractGroups(re, str);
}

export function getFraction(range, value) {
  if (!Array.isArray(range)) return NaN;
  return (+value - range[0]) / (range[1] - range[0]);
}

export function getHslSaturation(chroma, lightness) {
  let saturation;

  if (lightness > 0 && lightness <= 0.5) {
    saturation = chroma / (2 * lightness);
  } else {
    saturation = chroma / ((2 - 2 * lightness) || lightness);
  }

  return assumePercent(saturation);
}

export function hexToOctet(hex) {
  return parseInt(hex.length === 1 ? hex.repeat(2) : hex.substring(0, 2), 16);
}

export function octetToHex(num) {
  num = clamp(OCT_RANGE, num);
  return num.toString(16).padStart(2, '0');
}

export function approx(a, b, delta = 0) {
  return +Math.abs(a - b).toFixed(12) <= delta;
}

export function instanceOfColor(c) {
  return c instanceof sRGBColor
    || c instanceof LabColor
    || c instanceof XYZColor;
}
