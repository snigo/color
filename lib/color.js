'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const RGB_XYZ_MATRIX = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
];

const XYZ_RGB_MATRIX = [
  [3.2404542, -1.5371385, -0.4985314],
  [-0.969266, 1.8760108, 0.041556],
  [0.0556434, -0.2040259, 1.0572252],
];

const P3_XYZ_MATRIX = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0, 0.04511338185890264, 1.043944368900976],
];

const XYZ_P3_MATRIX = [
  [2.493496911941425, -0.9313836179191239, -0.40271078445071684],
  [-0.8294889695615747, 1.7626640603183463, 0.023624685841943577],
  [0.03584583024378447, -0.07617238926804182, 0.9568845240076872],
];

const D65_D50_MATRIX = [
  [1.0478112, 0.0228866, -0.0501270],
  [0.0295424, 0.9904844, -0.0170491],
  [-0.0092345, 0.0150436, 0.7521316],
];

const D50_D65_MATRIX = [
  [0.9555766, -0.0230393, 0.0631636],
  [-0.0282895, 1.0099416, 0.0210077],
  [0.0122982, -0.020483, 1.3299098],
];

const D50 = [0.96422, 1, 0.82521];
const D65 = [0.95047, 1, 1.08883];

const OCT_RANGE = [0, 255];
const ONE_RANGE = [0, 1];
const BYTE_RANGE = [-127, 127];
const CHROMA_RANGE = [0, 260];

const HEX_RE = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/;
const HEX_RE_S = /^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/;
const CMA_RE = /\(\s*([0-9a-z.%+-]+)\s*,\s*([0-9a-z.%+-]+)\s*,\s*([0-9a-z.%+-]+)\s*(?:,\s*([0-9a-z.%+-]+)\s*)?\)$/;
const WSP_RE = /\(\s*([0-9a-z.%+-]+)\s+([0-9a-z.%+-]+)\s+([0-9a-z.%+-]+)\s*(?:\s+\/\s+([0-9a-z.%+-]+)\s*)?\)$/;

/* eslint-disable import/no-cycle */

function applyMatrix(xyz, matrix) {
  if (!xyz || !(Array.isArray(xyz) && xyz.length)) return undefined;
  if (!matrix || !(Array.isArray(matrix) && xyz.length === matrix.length)) return xyz;
  return xyz.map((_, i, _xyz) => _xyz.reduce((p, v, j) => p + v * matrix[i][j], 0));
}

function clamp(range, value) {
  value = +value;
  if (value == null || Number.isNaN(value)) return NaN;
  if (!Array.isArray(range)) return value;

  if (value < range[0]) return range[0];
  if (value > range[1]) return range[1];
  return value;
}

function defined(...args) {
  // eslint-disable-next-line eqeqeq
  return args.every((arg) => arg || (!arg && arg == 0));
}

function fromFraction(range, value) {
  if (!Array.isArray(range)) return NaN;
  return range[0] + +value * (range[1] - range[0]);
}

function modulo(a, b) {
  return ((+a % +b) + +b) % +b;
}

function round(num, precision = 12) {
  return +(+(num * 10 ** precision).toFixed(0) * 10 ** -precision)
    .toFixed(precision < 0 ? 0 : precision);
}

function toNumber(num, precision = 12) {
  if (num == null || Array.isArray(num)) return NaN;
  num = num.toString();
  num = /%$/.test(num) ? +num.slice(0, -1) / 100 : +num;
  if (precision !== undefined) {
    num = round(num, precision);
  }

  return num;
}

function assumeAlpha(value) {
  return defined(value) ? clamp(ONE_RANGE, toNumber(value, 4)) : 1;
}

function assumeByte(value) {
  return clamp(BYTE_RANGE, round(value, 3));
}

function assumeChroma(value) {
  return clamp(CHROMA_RANGE, round(value, 3));
}

function assumeHue(value) {
  if (typeof value === 'number') return round(modulo(value, 360), 3);
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

  return round(modulo(hue[1], 360), 3);
}

function assumePercent(value) {
  if (typeof value === 'number') return clamp(ONE_RANGE, round(value, 5));
  if (typeof value !== 'string' || !/%$/.test(value)) return NaN;
  return clamp(ONE_RANGE, toNumber(value, 7));
}

function assumeOctet(value) {
  if (typeof value === 'number') return clamp(OCT_RANGE, round(value, 0));
  if (typeof value !== 'string') return NaN;
  return clamp(OCT_RANGE, /%$/.test(value) ? round(fromFraction(OCT_RANGE, toNumber(value)), 0) : round(value, 0));
}

function equal(a, b) {
  return a.every((e, i) => b[i] === e);
}

function extractGroups(re, str) {
  return (re.exec(str.toLowerCase()) || []).filter((value, index) => index && !!value);
}

function extractFnCommaGroups(fn, str) {
  const fnString = (fn === 'rgb' || fn === 'hsl') ? `${fn}a?` : fn;
  const re = new RegExp(`^${fnString}${CMA_RE.source}`);
  return extractGroups(re, str);
}

function extractFnWhitespaceGroups(fn, str) {
  const fnString = (fn === 'rgb' || fn === 'hsl') ? `${fn}a?` : fn;
  const re = new RegExp(`^${fnString}${WSP_RE.source}`);
  return extractGroups(re, str);
}

function getFraction(range, value) {
  if (!Array.isArray(range)) return NaN;
  return (+value - range[0]) / (range[1] - range[0]);
}

function getHslSaturation(chroma, lightness) {
  let saturation;

  if (lightness > 0 && lightness <= 0.5) {
    saturation = chroma / (2 * lightness);
  } else {
    saturation = chroma / ((2 - 2 * lightness) || lightness);
  }

  return assumePercent(saturation);
}

function hexToOctet(hex) {
  return parseInt(hex.length === 1 ? hex.repeat(2) : hex.substring(0, 2), 16);
}

function octetToHex(num) {
  num = clamp(OCT_RANGE, num);
  return num.toString(16).padStart(2, '0');
}

function approx(a, b, delta = 0) {
  return +Math.abs(a - b).toFixed(12) <= delta;
}

function getHueDiff(from, to, dir) {
  const ccw = -(modulo(from - to, 360) || 360);
  const cw = modulo(to - from, 360) || 360;
  switch (dir) {
    case -1:
      return ccw;
    case 1:
      return cw;
    case 0:
    default:
      return ((cw % 360 <= 180) ? cw : ccw);
  }
}

/* eslint-disable import/no-cycle */

class LabColor {
  constructor({
    lightness,
    a,
    b,
    chroma,
    hue,
    alpha,
  }) {
    Object.defineProperties(this, {
      lightness: {
        value: lightness,
      },
      a: {
        value: a,
      },
      b: {
        value: b,
      },
      chroma: {
        value: chroma,
      },
      hue: {
        value: hue,
      },
      alpha: {
        value: alpha,
      },
      whitePoint: {
        value: D50,
      },
      profile: {
        value: 'cie-lab',
      },
    });
  }

  static lab({
    lightness,
    a,
    b,
    alpha,
  }) {
    const _lightness = assumePercent(lightness);
    const _a = assumeByte(a);
    const _b = assumeByte(b);

    if (!defined(_lightness, _a, _b)) return undefined;

    return new LabColor({
      lightness: _lightness,
      a: _a,
      b: _b,
      chroma: assumeChroma(Math.sqrt(_a ** 2 + _b ** 2)),
      hue: assumeHue((Math.atan2(round(_b, 3), round(_a, 3)) * 180) / Math.PI),
      alpha: assumeAlpha(alpha),
    });
  }

  static labArray([lightness, a, b, alpha]) {
    return LabColor.lab({
      lightness,
      a,
      b,
      alpha,
    });
  }

  static lch({
    lightness,
    chroma,
    hue,
    alpha,
  }) {
    const _lightness = assumePercent(lightness);
    const _chroma = assumeChroma(chroma);
    const _hue = assumeHue(hue);

    if (!defined(_lightness, _chroma, _hue)) return undefined;

    return new LabColor({
      lightness: _lightness,
      a: assumeByte(_chroma * Math.cos((_hue * Math.PI) / 180)),
      b: assumeByte(_chroma * Math.sin((_hue * Math.PI) / 180)),
      chroma: _chroma,
      hue: _hue,
      alpha: assumeAlpha(alpha),
    });
  }

  static lchArray([lightness, chroma, hue, alpha]) {
    return LabColor.lch({
      lightness,
      chroma,
      hue,
      alpha,
    });
  }

  get hrad() {
    return round(this.hue * (Math.PI / 180), 7);
  }

  get hgrad() {
    return round(this.hue / 0.9, 7);
  }

  get hturn() {
    return round(this.hue / 360, 7);
  }

  get luminance() {
    return this.toXyz().y;
  }

  get mode() {
    return +(this.luminance < 0.18);
  }

  toXyz(whitePoint = this.whitePoint) {
    const e = 0.008856;
    const k = 903.3;
    const l = this.lightness * 100;
    const fy = (l + 16) / 116;
    const fx = this.a / 500 + fy;
    const fz = fy - this.b / 200;
    const [x, y, z] = [
      fx ** 3 > e ? fx ** 3 : (116 * fx - 16) / k,
      l > k * e ? ((l + 16) / 116) ** 3 : l / k,
      fz ** 3 > e ? fz ** 3 : (116 * fz - 16) / k,
    ].map((V, i) => round(V * this.whitePoint[i], 7));

    return new XYZColor({
      x,
      y,
      z,
      alpha: this.alpha,
      whitePoint: this.whitePoint,
    }).adapt(whitePoint);
  }

  toRgb() {
    return this.toXyz(D65).toRgb();
  }

  toP3() {
    return this.toXyz(D65).toP3();
  }

  toLab() {
    return this;
  }

  toGrayscale() {
    return this.copyWith({
      a: 0,
      b: 0,
    });
  }

  toLchString(precision = 3) {
    return this.alpha < 1
      ? `lch(${round(this.lightness * 100, precision)}% ${round(this.chroma, precision)} ${round(this.hue, precision)}deg / ${this.alpha})`
      : `lch(${round(this.lightness * 100, precision)}% ${round(this.chroma, precision)} ${round(this.hue, precision)}deg)`;
  }

  toLabString(precision = 3) {
    return this.alpha < 1
      ? `lab(${round(this.lightness * 100, precision)}% ${round(this.a, precision)} ${round(this.b, precision)} / ${this.alpha})`
      : `lab(${round(this.lightness * 100, precision)}% ${round(this.a, precision)} ${round(this.b, precision)})`;
  }

  withAlpha(value = 1) {
    if (this.alpha === value) return this;
    return new LabColor({
      lightness: this.lightness,
      a: this.a,
      b: this.b,
      chroma: this.chroma,
      hue: this.hue,
      alpha: assumeAlpha(value),
    });
  }

  copyWith(params) {
    if ('a' in params || 'b' in params) {
      return LabColor.lab({
        lightness: this.lightness,
        a: this.b,
        b: this.b,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('hue' in params || 'chroma' in params) {
      return LabColor.lch({
        lightness: this.lightness,
        chroma: this.chroma,
        hue: this.hue,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('lightness' in params) {
      return LabColor.lab({
        lightness: this.lightness,
        a: this.a,
        b: this.b,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('alpha' in params) {
      return this.opacity(params.alpha);
    }

    return this;
  }

  invert() {
    return LabColor.lab({
      lightness: this.lightness,
      a: -this.a,
      b: -this.b,
      alpha: this.alpha,
    });
  }
}

// eslint-disable-next-line no-extend-native
Map.prototype.setMany = function(key, value, ...aliases) {
  this.set(key, value);
  this.set(value, key);
  aliases.forEach((alias) => {
    this.set(alias, value);
  });
  return this;
};

// eslint-disable-next-line no-extend-native
Map.prototype.getPrimaryKey = function(key) {
  return this.get(this.get(key));
};

const namedColors = new Map();

namedColors.setMany('aliceblue', [240, 248, 255, 208, 1, 0.97, 1], '#f0f8ff');
namedColors.setMany('antiquewhite', [250, 235, 215, 34, 0.78, 0.91, 1], '#faebd7');
namedColors.setMany('cyan', [0, 255, 255, 180, 1, 0.5, 1], '#00ffff', 'aqua', '#0ff');
namedColors.setMany('aquamarine', [127, 255, 212, 160, 1, 0.75, 1], '#7fffd4');
namedColors.setMany('azure', [240, 255, 255, 180, 1, 0.97, 1], '#f0ffff');
namedColors.setMany('beige', [245, 245, 220, 60, 0.56, 0.91, 1], '#f5f5dc');
namedColors.setMany('bisque', [255, 228, 196, 33, 1, 0.88, 1], '#ffe4c4');
namedColors.setMany('black', [0, 0, 0, 0, 0, 0, 1], '#000000', '#000');
namedColors.setMany('blanchedalmond', [255, 235, 205, 36, 1, 0.9, 1], '#ffebcd');
namedColors.setMany('blue', [0, 0, 255, 240, 1, 0.5, 1], '#0000ff', '#00f');
namedColors.setMany('blueviolet', [138, 43, 226, 271, 0.76, 0.53, 1], '#8a2be2');
namedColors.setMany('brown', [165, 42, 42, 0, 0.59, 0.41, 1], '#a52a2a');
namedColors.setMany('burlywood', [222, 184, 135, 34, 0.57, 0.7, 1], '#deb887');
namedColors.setMany('cadetblue', [95, 158, 160, 182, 0.25, 0.5, 1], '#5f9ea0');
namedColors.setMany('chartreuse', [127, 255, 0, 90, 1, 0.5, 1], '#7fff00');
namedColors.setMany('chocolate', [210, 105, 30, 25, 0.75, 0.47, 1], '#d2691e');
namedColors.setMany('coral', [255, 127, 80, 16, 1, 0.66, 1], '#ff7f50');
namedColors.setMany('cornflowerblue', [100, 149, 237, 219, 0.79, 0.66, 1], '#6495ed');
namedColors.setMany('cornsilk', [255, 248, 220, 48, 1, 0.93, 1], '#fff8dc');
namedColors.setMany('crimson', [220, 20, 60, 348, 0.83, 0.47, 1], '#dc143c');
namedColors.setMany('darkblue', [0, 0, 139, 240, 1, 0.27, 1], '#00008b');
namedColors.setMany('darkcyan', [0, 139, 139, 180, 1, 0.27, 1], '#008b8b');
namedColors.setMany('darkgoldenrod', [184, 134, 11, 43, 0.89, 0.38, 1], '#b8860b');
namedColors.setMany('darkgray', [169, 169, 169, 0, 0, 0.66, 1], '#a9a9a9', 'darkgrey');
namedColors.setMany('darkgreen', [0, 100, 0, 120, 1, 0.2, 1], '#006400');
namedColors.setMany('darkkhaki', [189, 183, 107, 56, 0.38, 0.58, 1], '#bdb76b');
namedColors.setMany('darkmagenta', [139, 0, 139, 300, 1, 0.27, 1], '#8b008b');
namedColors.setMany('darkolivegreen', [85, 107, 47, 82, 0.39, 0.3, 1], '#556b2f');
namedColors.setMany('darkorange', [255, 140, 0, 33, 1, 0.5, 1], '#ff8c00');
namedColors.setMany('darkorchid', [153, 50, 204, 280, 0.61, 0.5, 1], '#9932cc');
namedColors.setMany('darkred', [139, 0, 0, 0, 1, 0.27, 1], '#8b0000');
namedColors.setMany('darksalmon', [233, 150, 122, 15, 0.72, 0.7, 1], '#e9967a');
namedColors.setMany('darkseagreen', [143, 188, 143, 120, 0.25, 0.65, 1], '#8fbc8f');
namedColors.setMany('darkslateblue', [72, 61, 139, 248, 0.39, 0.39, 1], '#483d8b');
namedColors.setMany('darkslategray', [47, 79, 79, 180, 0.25, 0.25, 1], '#2f4f4f', 'darkslategrey');
namedColors.setMany('darkturquoise', [0, 206, 209, 181, 1, 0.41, 1], '#00ced1');
namedColors.setMany('darkviolet', [148, 0, 211, 282, 1, 0.41, 1], '#9400d3');
namedColors.setMany('deeppink', [255, 20, 147, 328, 1, 0.54, 1], '#ff1493');
namedColors.setMany('deepskyblue', [0, 191, 255, 195, 1, 0.5, 1], '#00bfff');
namedColors.setMany('dimgray', [105, 105, 105, 0, 0, 0.41, 1], '#696969', 'dimgrey');
namedColors.setMany('dodgerblue', [30, 144, 255, 210, 1, 0.56, 1], '#1e90ff');
namedColors.setMany('firebrick', [178, 34, 34, 0, 0.68, 0.42, 1], '#b22222');
namedColors.setMany('floralwhite', [255, 250, 240, 40, 1, 0.97, 1], '#fffaf0');
namedColors.setMany('forestgreen', [34, 139, 34, 120, 0.61, 0.34, 1], '#228b22');
namedColors.setMany('gainsboro', [220, 220, 220, 0, 0, 0.86, 1], '#dcdcdc');
namedColors.setMany('ghostwhite', [248, 248, 255, 240, 1, 0.99, 1], '#f8f8ff');
namedColors.setMany('gold', [255, 215, 0, 51, 1, 0.5, 1], '#ffd700');
namedColors.setMany('goldenrod', [218, 165, 32, 43, 0.74, 0.49, 1], '#daa520');
namedColors.setMany('gray', [128, 128, 128, 0, 0, 0.5, 1], '#808080', 'grey');
namedColors.setMany('green', [0, 128, 0, 120, 1, 0.25, 1], '#008000');
namedColors.setMany('greenyellow', [173, 255, 47, 84, 1, 0.59, 1], '#adff2f');
namedColors.setMany('honeydew', [240, 255, 240, 120, 1, 0.97, 1], '#f0fff0');
namedColors.setMany('hotpink', [255, 105, 180, 330, 1, 0.71, 1], '#ff69b4');
namedColors.setMany('indianred', [205, 92, 92, 0, 0.53, 0.58, 1], '#cd5c5c');
namedColors.setMany('indigo', [75, 0, 130, 275, 1, 0.25, 1], '#4b0082');
namedColors.setMany('ivory', [255, 255, 240, 60, 1, 0.97, 1], '#fffff0');
namedColors.setMany('khaki', [240, 230, 140, 54, 0.77, 0.75, 1], '#f0e68c');
namedColors.setMany('lavender', [230, 230, 250, 240, 0.67, 0.94, 1], '#e6e6fa');
namedColors.setMany('lavenderblush', [255, 240, 245, 340, 1, 0.97, 1], '#fff0f5');
namedColors.setMany('lawngreen', [124, 252, 0, 90, 1, 0.49, 1], '#7cfc00');
namedColors.setMany('lemonchiffon', [255, 250, 205, 54, 1, 0.9, 1], '#fffacd');
namedColors.setMany('lightblue', [173, 216, 230, 195, 0.53, 0.79, 1], '#add8e6');
namedColors.setMany('lightcoral', [240, 128, 128, 0, 0.79, 0.72, 1], '#f08080');
namedColors.setMany('lightcyan', [224, 255, 255, 180, 1, 0.94, 1], '#e0ffff');
namedColors.setMany('lightgoldenrodyellow', [250, 250, 210, 60, 0.8, 0.9, 1], '#fafad2');
namedColors.setMany('lightgray', [211, 211, 211, 0, 0, 0.83, 1], '#d3d3d3', 'lightgrey');
namedColors.setMany('lightgreen', [144, 238, 144, 120, 0.73, 0.75, 1], '#90ee90');
namedColors.setMany('lightpink', [255, 182, 193, 351, 1, 0.86, 1], '#ffb6c1');
namedColors.setMany('lightsalmon', [255, 160, 122, 17, 1, 0.74, 1], '#ffa07a');
namedColors.setMany('lightseagreen', [32, 178, 170, 177, 0.7, 0.41, 1], '#20b2aa');
namedColors.setMany('lightskyblue', [135, 206, 250, 203, 0.92, 0.75, 1], '#87cefa');
namedColors.setMany('lightslategray', [119, 136, 153, 210, 0.14, 0.53, 1], '#778899', 'lightslategrey', '#789');
namedColors.setMany('lightsteelblue', [176, 196, 222, 214, 0.41, 0.78, 1], '#b0c4de');
namedColors.setMany('lightyellow', [255, 255, 224, 60, 1, 0.94, 1], '#ffffe0');
namedColors.setMany('lime', [0, 255, 0, 120, 1, 0.5, 1], '#00ff00', '#0f0');
namedColors.setMany('limegreen', [50, 205, 50, 120, 0.61, 0.5, 1], '#32cd32');
namedColors.setMany('linen', [250, 240, 230, 30, 0.67, 0.94, 1], '#faf0e6');
namedColors.setMany('magenta', [255, 0, 255, 300, 1, 0.5, 1], '#ff00ff', 'fuchsia', '#f0f');
namedColors.setMany('maroon', [128, 0, 0, 0, 1, 0.25, 1], '#800000');
namedColors.setMany('mediumaquamarine', [102, 205, 170, 160, 0.51, 0.6, 1], '#66cdaa');
namedColors.setMany('mediumblue', [0, 0, 205, 240, 1, 0.4, 1], '#0000cd');
namedColors.setMany('mediumorchid', [186, 85, 211, 288, 0.59, 0.58, 1], '#ba55d3');
namedColors.setMany('mediumpurple', [147, 112, 219, 260, 0.6, 0.65, 1], '#9370db');
namedColors.setMany('mediumseagreen', [60, 179, 113, 147, 0.5, 0.47, 1], '#3cb371');
namedColors.setMany('mediumslateblue', [123, 104, 238, 249, 0.8, 0.67, 1], '#7b68ee');
namedColors.setMany('mediumspringgreen', [0, 250, 154, 157, 1, 0.49, 1], '#00fa9a');
namedColors.setMany('mediumturquoise', [72, 209, 204, 178, 0.6, 0.55, 1], '#48d1cc');
namedColors.setMany('mediumvioletred', [199, 21, 133, 322, 0.81, 0.43, 1], '#c71585');
namedColors.setMany('midnightblue', [25, 25, 112, 240, 0.64, 0.27, 1], '#191970');
namedColors.setMany('mintcream', [245, 255, 250, 150, 1, 0.98, 1], '#f5fffa');
namedColors.setMany('mistyrose', [255, 228, 225, 6, 1, 0.94, 1], '#ffe4e1');
namedColors.setMany('moccasin', [255, 228, 181, 38, 1, 0.85, 1], '#ffe4b5');
namedColors.setMany('navajowhite', [255, 222, 173, 36, 1, 0.84, 1], '#ffdead');
namedColors.setMany('navy', [0, 0, 128, 240, 1, 0.25, 1], '#000080');
namedColors.setMany('oldlace', [253, 245, 230, 39, 0.85, 0.95, 1], '#fdf5e6');
namedColors.setMany('olive', [128, 128, 0, 60, 1, 0.25, 1], '#808000');
namedColors.setMany('olivedrab', [107, 142, 35, 80, 0.6, 0.35, 1], '#6b8e23');
namedColors.setMany('orange', [255, 165, 0, 39, 1, 0.5, 1], '#ffa500');
namedColors.setMany('orangered', [255, 69, 0, 16, 1, 0.5, 1], '#ff4500');
namedColors.setMany('orchid', [218, 112, 214, 302, 0.59, 0.65, 1], '#da70d6');
namedColors.setMany('palegoldenrod', [238, 232, 170, 55, 0.67, 0.8, 1], '#eee8aa');
namedColors.setMany('palegreen', [152, 251, 152, 120, 0.93, 0.79, 1], '#98fb98');
namedColors.setMany('paleturquoise', [175, 238, 238, 180, 0.65, 0.81, 1], '#afeeee');
namedColors.setMany('palevioletred', [219, 112, 147, 340, 0.6, 0.65, 1], '#db7093');
namedColors.setMany('papayawhip', [255, 239, 213, 37, 1, 0.92, 1], '#ffefd5');
namedColors.setMany('peachpuff', [255, 218, 185, 28, 1, 0.86, 1], '#ffdab9');
namedColors.setMany('peru', [205, 133, 63, 30, 0.59, 0.53, 1], '#cd853f');
namedColors.setMany('pink', [255, 192, 203, 350, 1, 0.88, 1], '#ffc0cb');
namedColors.setMany('plum', [221, 160, 221, 300, 0.47, 0.75, 1], '#dda0dd');
namedColors.setMany('powderblue', [176, 224, 230, 187, 0.52, 0.8, 1], '#b0e0e6');
namedColors.setMany('purple', [128, 0, 128, 300, 1, 0.25, 1], '#800080');
namedColors.setMany('rebeccapurple', [102, 51, 153, 270, 0.5, 0.4, 1], '#663399', '#639');
namedColors.setMany('red', [255, 0, 0, 0, 1, 0.5, 1], '#ff0000', '#f00');
namedColors.setMany('rosybrown', [188, 143, 143, 0, 0.25, 0.65, 1], '#bc8f8f');
namedColors.setMany('royalblue', [65, 105, 225, 225, 0.73, 0.57, 1], '#4169e1');
namedColors.setMany('saddlebrown', [139, 69, 19, 25, 0.76, 0.31, 1], '#8b4513');
namedColors.setMany('salmon', [250, 128, 114, 6, 0.93, 0.71, 1], '#fa8072');
namedColors.setMany('sandybrown', [244, 164, 96, 28, 0.87, 0.67, 1], '#f4a460');
namedColors.setMany('seagreen', [46, 139, 87, 146, 0.5, 0.36, 1], '#2e8b57');
namedColors.setMany('seashell', [255, 245, 238, 25, 1, 0.97, 1], '#fff5ee');
namedColors.setMany('sienna', [160, 82, 45, 19, 0.56, 0.4, 1], '#a0522d');
namedColors.setMany('silver', [192, 192, 192, 0, 0, 0.75, 1], '#c0c0c0');
namedColors.setMany('skyblue', [135, 206, 235, 197, 0.71, 0.73, 1], '#87ceeb');
namedColors.setMany('slateblue', [106, 90, 205, 248, 0.53, 0.58, 1], '#6a5acd');
namedColors.setMany('slategray', [112, 128, 144, 210, 0.13, 0.5, 1], '#708090', 'slategrey');
namedColors.setMany('snow', [255, 250, 250, 0, 1, 0.99, 1], '#fffafa');
namedColors.setMany('springgreen', [0, 255, 127, 150, 1, 0.5, 1], '#00ff7f');
namedColors.setMany('steelblue', [70, 130, 180, 207, 0.44, 0.49, 1], '#4682b4');
namedColors.setMany('tan', [210, 180, 140, 34, 0.44, 0.69, 1], '#d2b48c');
namedColors.setMany('teal', [0, 128, 128, 180, 1, 0.25, 1], '#008080');
namedColors.setMany('thistle', [216, 191, 216, 300, 0.24, 0.8, 1], '#d8bfd8');
namedColors.setMany('tomato', [255, 99, 71, 9, 1, 0.64, 1], '#ff6347');
namedColors.setMany('turquoise', [64, 224, 208, 174, 0.72, 0.56, 1], '#40e0d0');
namedColors.setMany('violet', [238, 130, 238, 300, 0.76, 0.72, 1], '#ee82ee');
namedColors.setMany('wheat', [245, 222, 179, 39, 0.77, 0.83, 1], '#f5deb3');
namedColors.setMany('white', [255, 255, 255, 0, 0, 1, 1], '#ffffff', '#fff');
namedColors.setMany('whitesmoke', [245, 245, 245, 0, 0, 0.96, 1], '#f5f5f5');
namedColors.setMany('yellow', [255, 255, 0, 60, 1, 0.5, 1], '#ffff00', '#ff0');
namedColors.setMany('yellowgreen', [154, 205, 50, 80, 0.61, 0.5, 1], '#9acd32');
namedColors.setMany('transparent', [0, 0, 0, 0, 0, 0, 0]);

function parseNamed(inputString) {
  if (typeof inputString !== 'string') return undefined;
  return namedColors.get(inputString.toLowerCase());
}

function getColorName(hexColor) {
  if (typeof hexColor !== 'string') return undefined;
  return namedColors.getPrimaryKey(hexColor.toLowerCase());
}

/* eslint-disable import/no-cycle */

class DisplayP3Color {
  constructor({
    red,
    green,
    blue,
    hue,
    saturation,
    lightness,
    alpha,
  }) {
    Object.defineProperties(this, {
      red: {
        value: red,
      },
      green: {
        value: green,
      },
      blue: {
        value: blue,
      },
      hue: {
        value: hue,
      },
      saturation: {
        value: saturation,
      },
      lightness: {
        value: lightness,
      },
      alpha: {
        value: alpha,
      },
      whitePoint: {
        value: D65,
      },
      profile: {
        value: 'display-p3',
      },
    });
  }

  static rgb({
    red,
    green,
    blue,
    alpha,
  }) {
    const _red = assumeOctet(red);
    const _green = assumeOctet(green);
    const _blue = assumeOctet(blue);

    if (!defined(_red, _green, _blue)) return undefined;

    const R = getFraction(OCT_RANGE, _red);
    const G = getFraction(OCT_RANGE, _green);
    const B = getFraction(OCT_RANGE, _blue);

    const min = Math.min(R, G, B);
    const max = Math.max(R, G, B);
    const chroma = max - min;

    let hue;

    if (chroma === 0) {
      hue = 0;
    } else if (max === R) {
      hue = (G - B) / chroma;
    } else if (max === G) {
      hue = (B - R) / chroma + 2;
    } else {
      hue = (R - G) / chroma + 4;
    }

    const lightness = (max + min) / 2;
    const saturation = getHslSaturation(chroma, lightness);

    return new DisplayP3Color({
      red: _red,
      green: _green,
      blue: _blue,
      hue: assumeHue(hue * 60),
      saturation,
      lightness: assumePercent(lightness),
      alpha: assumeAlpha(alpha),
    });
  }

  static rgbArray([red, green, blue, alpha]) {
    return DisplayP3Color.rgb({
      red,
      green,
      blue,
      alpha,
    });
  }

  static lin({
    red,
    green,
    blue,
    alpha,
  }) {
    const rgba = [red, green, blue]
      .map((V) => V > 0.0031308 ? V ** (1 / 2.4) * 1.055 - 0.055 : 12.92 * V)
      .map((V) => V * 255)
      .concat(alpha);

    return DisplayP3Color.rgbArray(rgba);
  }

  static linArray([red, green, blue, alpha]) {
    return DisplayP3Color.lin({
      red,
      green,
      blue,
      alpha,
    });
  }

  static hsl({
    hue,
    saturation,
    lightness,
    alpha,
  }) {
    const _hue = assumeHue(hue);
    const _saturation = assumePercent(saturation);
    const _lightness = assumePercent(lightness);

    if (!defined(_hue, _saturation, _lightness)) return undefined;

    const chroma = (1 - Math.abs(2 * _lightness - 1)) * _saturation;
    const x = chroma * (1 - Math.abs(((_hue / 60) % 2) - 1));
    const b = _lightness - chroma / 2;

    let red = 0;
    let green = 0;
    let blue = 0;

    if (_hue >= 0 && _hue < 60) {
      red = chroma;
      green = x;
      blue = 0;
    } else if (_hue >= 60 && _hue < 120) {
      red = x;
      green = chroma;
      blue = 0;
    } else if (_hue >= 120 && _hue < 180) {
      red = 0;
      green = chroma;
      blue = x;
    } else if (_hue >= 180 && _hue < 240) {
      red = 0;
      green = x;
      blue = chroma;
    } else if (_hue >= 240 && _hue < 300) {
      red = x;
      green = 0;
      blue = chroma;
    } else if (_hue >= 300 && _hue < 360) {
      red = chroma;
      green = 0;
      blue = x;
    }

    return new DisplayP3Color({
      red: assumeOctet((red + b) * 255),
      green: assumeOctet((green + b) * 255),
      blue: assumeOctet((blue + b) * 255),
      hue: _hue,
      saturation: _saturation,
      lightness: _lightness,
      alpha: assumeAlpha(alpha),
    });
  }

  static hslArray([hue, saturation, lightness, alpha]) {
    return DisplayP3Color.hsl({
      hue,
      saturation,
      lightness,
      alpha,
    });
  }

  static hwb({
    hue,
    whiteness,
    blackness,
    alpha,
  }) {
    const _whiteness = assumePercent(whiteness);
    const _blackness = assumePercent(blackness);

    const lightness = (1 - _whiteness + _blackness) / 2;
    const chroma = 1 - _whiteness - _blackness;
    const saturation = getHslSaturation(chroma, lightness);
    return DisplayP3Color.hsl({
      hue: assumeHue(hue),
      saturation,
      lightness,
      alpha,
    });
  }

  static hwbArray([hue, whiteness, blackness, alpha]) {
    return DisplayP3Color.hwb({
      hue,
      whiteness,
      blackness,
      alpha,
    });
  }

  get luminance() {
    return this.toXyz().y;
  }

  get mode() {
    return +(this.luminance < 0.18);
  }

  get hueGroup() {
    return modulo(Math.floor(((this.hue + 15) % 360) / 30) + 1, 11);
  }

  get hueGroupOffset() {
    return modulo((this.hue % 30) + 15, 30);
  }

  get hrad() {
    return round(this.hue * (Math.PI / 180), 7);
  }

  get hgrad() {
    return round(this.hue / 0.9, 7);
  }

  get hturn() {
    return round(this.hue / 360, 7);
  }

  get name() {
    const name = getColorName(this.toHexString().substring(0, 7));
    return (this.alpha === 1 || !name) ? `p3:${name}` : `p3:${name}*`;
  }

  toLin() {
    return [this.red, this.green, this.blue]
      .map((value) => {
        const V = value / 255;
        return round(V < 0.04045 ? V / 12.92 : ((V + 0.055) / 1.055) ** 2.4, 7);
      });
  }

  toHwb() {
    const rgbr = [this.red, this.green, this.blue].map((value) => value / 255);
    return [
      this.hue,
      round(1 - Math.max(...rgbr), 7),
      round(Math.min(...rgbr), 7),
      this.alpha,
    ];
  }

  toXyz(whitePoint = this.whitePoint) {
    const [x, y, z] = applyMatrix(this.toLin(), P3_XYZ_MATRIX);
    return new XYZColor({
      x,
      y,
      z,
      alpha: this.alpha,
      whitePoint: this.whitePoint,
    }).adapt(whitePoint);
  }

  toLab() {
    return this.toXyz(D50).toLab();
  }

  toP3() {
    return this;
  }

  toRgb() {
    return this.toXyz().toRgb();
  }

  toRgbEquiv() {
    return new sRGBColor(this);
  }

  toGrayscale() {
    if (this.saturation === 0) return this;
    const l = this.luminance > 0.0393
      ? ((this.luminance ** (1 / 2.4)) * 1.055 - 0.055) * 255
      : this.luminance * 3294.6;
    return DisplayP3Color.rgb({
      red: l,
      green: l,
      blue: l,
      alpha: this.alpha,
    });
  }

  toRgbString(format = 'absolute') {
    const _red = format === 'relative'
      ? `${round(getFraction(OCT_RANGE, this.red) * 100, 3)}%`
      : this.red;
    const _green = format === 'relative'
      ? `${round(getFraction(OCT_RANGE, this.green) * 100, 3)}%`
      : this.green;
    const _blue = format === 'relative'
      ? `${round(getFraction(OCT_RANGE, this.blue) * 100, 3)}%`
      : this.blue;
    const _alpha = format === 'relative'
      ? `${round(this.alpha * 100, 0)}%`
      : this.alpha;
    return this.alpha < 1
      ? `p3:rgb(${_red} ${_green} ${_blue} / ${_alpha})`
      : `p3:rgb(${_red} ${_green} ${_blue})`;
  }

  toColorString() {
    const _red = round(getFraction(OCT_RANGE, this.red), 5);
    const _green = round(getFraction(OCT_RANGE, this.green), 5);
    const _blue = round(getFraction(OCT_RANGE, this.blue), 5);

    return this.alpha < 1
      ? `color(${this.profile} ${_red} ${_green} ${_blue} / ${this.alpha})`
      : `color(${this.profile} ${_red} ${_green} ${_blue})`;
  }

  toHexString() {
    return `#${octetToHex(this.red)}${octetToHex(this.green)}${octetToHex(this.blue)}${this.alpha < 1 ? octetToHex(Math.round(255 * this.alpha)) : ''}`;
  }

  toHslString(precision = 1) {
    return this.alpha < 1
      ? `p3:hsl(${round(this.hue, precision)}deg ${round(this.saturation * 100, precision)}% ${round(this.lightness * 100, precision)}% / ${this.alpha})`
      : `p3:hsl(${round(this.hue, precision)}deg ${round(this.saturation * 100, precision)}% ${round(this.lightness * 100, precision)}%)`;
  }

  toHwbString(precision = 1) {
    const [h, w, b] = this.toHwb();
    return this.alpha < 1
      ? `p3:hwb(${round(h, precision)}deg ${round(w * 100, precision)}% ${round(b * 100, precision)}% / ${this.alpha})`
      : `p3:hwb(${round(h, precision)}deg ${round(w * 100, precision)}% ${round(b * 100, precision)}%)`;
  }

  withAlpha(value = 1) {
    if (this.alpha === value) return this;
    return new DisplayP3Color({
      red: this.red,
      green: this.green,
      blue: this.blue,
      hue: this.hue,
      saturation: this.saturation,
      lightness: this.lightness,
      alpha: assumeAlpha(value),
    });
  }

  invert() {
    return DisplayP3Color.rgb({
      red: 255 - this.red,
      green: 255 - this.green,
      blue: 255 - this.blue,
      alpha: this.alpha,
    });
  }

  copyWith(params) {
    if ('red' in params || 'blue' in params || 'green' in params) {
      return DisplayP3Color.rgb({
        red: this.red,
        green: this.green,
        blue: this.blue,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('hue' in params || 'saturation' in params || 'lightness' in params) {
      return DisplayP3Color.hsl({
        hue: this.hue,
        saturation: this.saturation,
        lightness: this.lightness,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('alpha' in params) {
      return this.opacity(params.alpha);
    }

    return this;
  }
}

/* eslint-disable import/no-cycle */

class XYZColor {
  constructor({
    x,
    y,
    z,
    alpha = 1,
    whitePoint = XYZColor.D50,
  }) {
    Object.defineProperties(this, {
      x: {
        value: round(x, 6),
      },
      y: {
        value: round(y, 6),
      },
      z: {
        value: round(z, 6),
      },
      alpha: {
        value: assumeAlpha(alpha),
      },
      whitePoint: {
        value: whitePoint,
      },
      profile: {
        value: 'cie-xyz',
      },
    });
  }

  static get D50() {
    return D50;
  }

  static get D65() {
    return D65;
  }

  static xyz({
    x,
    y,
    z,
    alpha,
    whitePoint,
  }) {
    return new XYZColor({
      x,
      y,
      z,
      alpha,
      whitePoint,
    });
  }

  static xyzArray([x, y, z, alpha]) {
    return XYZColor.xyz({
      x,
      y,
      z,
      alpha,
    });
  }

  get luminance() {
    return this.y;
  }

  get mode() {
    return +(this.luminance < 0.18);
  }

  adapt(whitePoint) {
    if (equal(whitePoint, this.whitePoint)) return this;
    const [x, y, z] = applyMatrix(
      this.toXyzArray(),
      equal(whitePoint, XYZColor.D50) ? D65_D50_MATRIX : D50_D65_MATRIX,
    );
    return new XYZColor({
      x,
      y,
      z,
      alpha: this.alpha,
      whitePoint,
    });
  }

  toXyzArray() {
    return [this.x, this.y, this.z];
  }

  toLab() {
    const xyz = (equal(this.whitePoint, XYZColor.D65)
      ? this.adapt(XYZColor.D50)
      : this).toXyzArray();

    const e = 0.008856;
    const k = 903.3;
    const [fx, fy, fz] = xyz
      .map((V, i) => V / D50[i])
      .map((vr) => vr > e ? Math.cbrt(vr) : (k * vr + 16) / 116);

    return LabColor.lab({
      lightness: (116 * fy - 16) / 100,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz),
      alpha: this.alpha,
    });
  }

  toRgb() {
    const xyz = (equal(this.whitePoint, XYZColor.D65)
      ? this
      : this.adapt(XYZColor.D65)).toXyzArray();

    return sRGBColor.linArray(applyMatrix(xyz, XYZ_RGB_MATRIX).concat(this.alpha));
  }

  toP3() {
    const xyz = (equal(this.whitePoint, XYZColor.D65)
      ? this
      : this.adapt(XYZColor.D65)).toXyzArray();

    return DisplayP3Color.linArray(applyMatrix(xyz, XYZ_P3_MATRIX).concat(this.alpha));
  }

  toXyz() {
    return this;
  }
}

/* eslint-disable import/no-cycle */

class sRGBColor {
  constructor({
    red,
    green,
    blue,
    hue,
    saturation,
    lightness,
    alpha,
  }) {
    Object.defineProperties(this, {
      red: {
        value: red,
      },
      green: {
        value: green,
      },
      blue: {
        value: blue,
      },
      hue: {
        value: hue,
      },
      saturation: {
        value: saturation,
      },
      lightness: {
        value: lightness,
      },
      alpha: {
        value: alpha,
      },
      whitePoint: {
        value: D65,
      },
      profile: {
        value: 'srgb',
      },
    });
  }

  static rgb({
    red,
    green,
    blue,
    alpha,
  }) {
    const _red = assumeOctet(red);
    const _green = assumeOctet(green);
    const _blue = assumeOctet(blue);

    if (!defined(_red, _green, _blue)) return undefined;

    const R = getFraction(OCT_RANGE, _red);
    const G = getFraction(OCT_RANGE, _green);
    const B = getFraction(OCT_RANGE, _blue);

    const min = Math.min(R, G, B);
    const max = Math.max(R, G, B);
    const chroma = max - min;

    let hue;

    if (chroma === 0) {
      hue = 0;
    } else if (max === R) {
      hue = (G - B) / chroma;
    } else if (max === G) {
      hue = (B - R) / chroma + 2;
    } else {
      hue = (R - G) / chroma + 4;
    }

    const lightness = (max + min) / 2;
    const saturation = getHslSaturation(chroma, lightness);

    return new sRGBColor({
      red: _red,
      green: _green,
      blue: _blue,
      hue: assumeHue(hue * 60),
      saturation,
      lightness: assumePercent(lightness),
      alpha: assumeAlpha(alpha),
    });
  }

  static rgbArray([red, green, blue, alpha]) {
    return sRGBColor.rgb({
      red,
      green,
      blue,
      alpha,
    });
  }

  static lin({
    red,
    green,
    blue,
    alpha,
  }) {
    const rgba = [red, green, blue]
      .map((V) => V > 0.0031308 ? V ** (1 / 2.4) * 1.055 - 0.055 : 12.92 * V)
      .map((V) => V * 255)
      .concat(alpha);

    return sRGBColor.rgbArray(rgba);
  }

  static linArray([red, green, blue, alpha]) {
    return sRGBColor.lin({
      red,
      green,
      blue,
      alpha,
    });
  }

  static hsl({
    hue,
    saturation,
    lightness,
    alpha,
  }) {
    const _hue = assumeHue(hue);
    const _saturation = assumePercent(saturation);
    const _lightness = assumePercent(lightness);

    if (!defined(_hue, _saturation, _lightness)) return undefined;

    const chroma = (1 - Math.abs(2 * _lightness - 1)) * _saturation;
    const x = chroma * (1 - Math.abs(((_hue / 60) % 2) - 1));
    const b = _lightness - chroma / 2;

    let red = 0;
    let green = 0;
    let blue = 0;

    if (_hue >= 0 && _hue < 60) {
      red = chroma;
      green = x;
      blue = 0;
    } else if (_hue >= 60 && _hue < 120) {
      red = x;
      green = chroma;
      blue = 0;
    } else if (_hue >= 120 && _hue < 180) {
      red = 0;
      green = chroma;
      blue = x;
    } else if (_hue >= 180 && _hue < 240) {
      red = 0;
      green = x;
      blue = chroma;
    } else if (_hue >= 240 && _hue < 300) {
      red = x;
      green = 0;
      blue = chroma;
    } else if (_hue >= 300 && _hue < 360) {
      red = chroma;
      green = 0;
      blue = x;
    }

    return new sRGBColor({
      red: assumeOctet((red + b) * 255),
      green: assumeOctet((green + b) * 255),
      blue: assumeOctet((blue + b) * 255),
      hue: _hue,
      saturation: _saturation,
      lightness: _lightness,
      alpha: assumeAlpha(alpha),
    });
  }

  static hslArray([hue, saturation, lightness, alpha]) {
    return sRGBColor.hsl({
      hue,
      saturation,
      lightness,
      alpha,
    });
  }

  static hwb({
    hue,
    whiteness,
    blackness,
    alpha,
  }) {
    const _whiteness = assumePercent(whiteness);
    const _blackness = assumePercent(blackness);

    const lightness = (1 - _whiteness + _blackness) / 2;
    const chroma = 1 - _whiteness - _blackness;
    const saturation = getHslSaturation(chroma, lightness);
    return sRGBColor.hsl({
      hue: assumeHue(hue),
      saturation,
      lightness,
      alpha,
    });
  }

  static hwbArray([hue, whiteness, blackness, alpha]) {
    return sRGBColor.hwb({
      hue,
      whiteness,
      blackness,
      alpha,
    });
  }

  get luminance() {
    return this.toXyz().y;
  }

  get mode() {
    return +(this.luminance < 0.18);
  }

  get hueGroup() {
    return modulo(Math.floor(((this.hue + 15) % 360) / 30) + 1, 11);
  }

  get hueGroupOffset() {
    return modulo((this.hue % 30) + 15, 30);
  }

  get hrad() {
    return round(this.hue * (Math.PI / 180), 7);
  }

  get hgrad() {
    return round(this.hue / 0.9, 7);
  }

  get hturn() {
    return round(this.hue / 360, 7);
  }

  get name() {
    const name = getColorName(this.toHexString().substring(0, 7));
    return (this.alpha === 1 || !name) ? name : `${name}*`;
  }

  toLin() {
    return [this.red, this.green, this.blue]
      .map((value) => {
        const V = value / 255;
        return round(V < 0.04045 ? V / 12.92 : ((V + 0.055) / 1.055) ** 2.4, 7);
      });
  }

  toHwb() {
    const rgbr = [this.red, this.green, this.blue].map((value) => value / 255);
    return [
      this.hue,
      round(1 - Math.max(...rgbr), 7),
      round(Math.min(...rgbr), 7),
      this.alpha,
    ];
  }

  toXyz(whitePoint = this.whitePoint) {
    const [x, y, z] = applyMatrix(this.toLin(), RGB_XYZ_MATRIX);
    return new XYZColor({
      x,
      y,
      z,
      alpha: this.alpha,
      whitePoint: this.whitePoint,
    }).adapt(whitePoint);
  }

  toLab() {
    return this.toXyz(D50).toLab();
  }

  toP3() {
    return this.toXyz().toP3();
  }

  toP3Equiv() {
    return new DisplayP3Color(this);
  }

  toRgb() {
    return this;
  }

  toGrayscale() {
    if (this.saturation === 0) return this;
    const l = this.luminance > 0.0393
      ? ((this.luminance ** (1 / 2.4)) * 1.055 - 0.055) * 255
      : this.luminance * 3294.6;
    return sRGBColor.rgb({
      red: l,
      green: l,
      blue: l,
      alpha: this.alpha,
    });
  }

  toRgbString(format = 'absolute') {
    const _red = format === 'relative'
      ? `${round(getFraction(OCT_RANGE, this.red) * 100, 1)}%`
      : this.red;
    const _green = format === 'relative'
      ? `${round(getFraction(OCT_RANGE, this.green) * 100, 1)}%`
      : this.green;
    const _blue = format === 'relative'
      ? `${round(getFraction(OCT_RANGE, this.blue) * 100, 1)}%`
      : this.blue;
    const _alpha = format === 'relative'
      ? `${round(this.alpha * 100, 0)}%`
      : this.alpha;
    return this.alpha < 1
      ? `rgb(${_red} ${_green} ${_blue} / ${_alpha})`
      : `rgb(${_red} ${_green} ${_blue})`;
  }

  toColorString() {
    const _red = round(getFraction(OCT_RANGE, this.red), 3);
    const _green = round(getFraction(OCT_RANGE, this.green), 3);
    const _blue = round(getFraction(OCT_RANGE, this.blue), 3);

    return this.alpha < 1
      ? `color(${this.profile} ${_red} ${_green} ${_blue} / ${this.alpha})`
      : `color(${this.profile} ${_red} ${_green} ${_blue})`;
  }

  toHexString() {
    return `#${octetToHex(this.red)}${octetToHex(this.green)}${octetToHex(this.blue)}${this.alpha < 1 ? octetToHex(Math.round(255 * this.alpha)) : ''}`;
  }

  toHslString(precision = 1) {
    return this.alpha < 1
      ? `hsl(${round(this.hue, precision)}deg ${round(this.saturation * 100, precision)}% ${round(this.lightness * 100, precision)}% / ${this.alpha})`
      : `hsl(${round(this.hue, precision)}deg ${round(this.saturation * 100, precision)}% ${round(this.lightness * 100, precision)}%)`;
  }

  toHwbString(precision = 1) {
    const [h, w, b] = this.toHwb();
    return this.alpha < 1
      ? `hwb(${round(h, precision)}deg ${round(w * 100, precision)}% ${round(b * 100, precision)}% / ${this.alpha})`
      : `hwb(${round(h, precision)}deg ${round(w * 100, precision)}% ${round(b * 100, precision)}%)`;
  }

  withAlpha(value = 1) {
    if (this.alpha === value) return this;
    return new sRGBColor({
      red: this.red,
      green: this.green,
      blue: this.blue,
      hue: this.hue,
      saturation: this.saturation,
      lightness: this.lightness,
      alpha: assumeAlpha(value),
    });
  }

  invert() {
    return sRGBColor.rgb({
      red: 255 - this.red,
      green: 255 - this.green,
      blue: 255 - this.blue,
      alpha: this.alpha,
    });
  }

  copyWith(params) {
    if ('red' in params || 'blue' in params || 'green' in params) {
      return sRGBColor.rgb({
        red: this.red,
        green: this.green,
        blue: this.blue,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('hue' in params || 'saturation' in params || 'lightness' in params) {
      return sRGBColor.hsl({
        hue: this.hue,
        saturation: this.saturation,
        lightness: this.lightness,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('alpha' in params) {
      return this.opacity(params.alpha);
    }

    return this;
  }
}

const MODEL_PARAMS = {
  rgb: [sRGBColor, ['red', 'green', 'blue', 'alpha']],
  hsl: [sRGBColor, ['hue', 'saturation', 'lightness', 'alpha']],
  lab: [LabColor, ['lightness', 'a', 'b', 'alpha']],
  lch: [LabColor, ['lightness', 'chroma', 'hue', 'alpha']],
  xyz: [XYZColor, ['x', 'y', 'z', 'alpha']],
  'p3:rgb': [DisplayP3Color, ['red', 'green', 'blue', 'alpha']],
  'p3:hsl': [DisplayP3Color, ['hue', 'saturation', 'lightness', 'alpha']],
};

function instanceOfColor(c) {
  return c instanceof sRGBColor
    || c instanceof DisplayP3Color
    || c instanceof LabColor
    || c instanceof XYZColor;
}

function applyModel(model, c) {
  if (!c) return undefined;
  switch (model) {
    case 'rgb':
    case 'hsl':
      return instanceOfColor(c) ? c.toRgb() : applyModel(model, color(c));
    case 'lab':
    case 'lch':
      return instanceOfColor(c) ? c.toLab() : applyModel(model, color(c));
    case 'xyz':
      return instanceOfColor(c) ? c.toXyz() : applyModel(model, color(c));
    case 'p3:rgb':
    case 'p3:hsl':
      return instanceOfColor(c) ? c.toP3() : applyModel(model, color(c));
    default:
      return undefined;
  }
}

function mix(model = 'rgb', descriptor) {
  if (typeof model !== 'string') return undefined;
  if (!descriptor) return (descriptor) => mix(model, descriptor);

  const {
    start,
    end,
    alpha = 1,
    hueDirection = 0,
  } = descriptor;

  model = model.trim().toLowerCase();
  const _start = applyModel(model, start);
  const _end = applyModel(model, end);
  if (!_start && !_end) return undefined;
  if (!_start) return _end;
  if (!_end) return _start;

  const factor = _end.alpha * assumePercent(alpha);
  const [ColorConstructor, params] = MODEL_PARAMS[model];
  if (model.startsWith('p3:')) model = model.substring(3);

  return ColorConstructor[`${model}Array`](params.map((p) => {
    if (p === 'hue') return _start[p] + factor * getHueDiff(_start[p], _end[p], hueDirection);
    if (p === 'alpha') return _start[p] * (1 + factor);
    return _start[p] + factor * (_end[p] - _start[p]);
  }));
}

function contrast(base = '#fff', compareColor, precision = 2) {
  const _base = instanceOfColor(base) ? base : color(base);
  if (!_base) return undefined;
  if (_base.alpha !== 1) throw SyntaxError('Base color cannot be semitransparent.');

  if (arguments.length < 2) {
    const curried = (a, p = 2) => contrast(_base, a, p);
    curried.find = (b) => contrast.find(_base, b);
    curried.min = (c) => contrast.min(_base, c);
    curried.max = (d) => contrast.max(_base, d);
    curried.validate = (e) => contrast.validate(_base, e);
    return curried;
  }

  let _c = instanceOfColor(compareColor) ? compareColor : color(compareColor);
  if (_c.alpha < 1) {
    let model;
    if (_c instanceof sRGBColor) {
      model = 'rgb';
    } else if (_c instanceof DisplayP3Color) {
      model = 'p3:rgb';
    } else if (_c instanceof LabColor) {
      model = 'lab';
    } else if (_c instanceof XYZColor) {
      model = 'xyz';
    } else {
      return undefined;
    }
    _c = mix(model, { start: _base, end: _c });
  }
  const dark = Math.min(_c.luminance, _base.luminance);
  const light = Math.max(_c.luminance, _base.luminance);

  return round((light + 0.05) / (dark + 0.05), precision);
}

contrast.closest = (base, targetContrast, colorArray) => {
  const _base = instanceOfColor(base) ? base : color(base);
  if (!_base) return undefined;

  let output;
  let diff = 22;

  colorArray.forEach((c) => {
    const _d = Math.abs(contrast(_base, c) - targetContrast) || 100;
    if (_d < diff) {
      output = c;
      diff = _d;
    }
  });

  return output;
};

contrast.min = (base, colorArray) => {
  const _base = instanceOfColor(base) ? base : color(base);
  if (!_base) return undefined;

  let output;
  let min = 22;

  colorArray.forEach((c) => {
    const _c = color(c);
    if (!c) return undefined;
    const _contrast = contrast(_base, _c);
    if (_contrast < min) {
      output = _c;
      min = _contrast;
    }
    return undefined;
  });

  return output;
};

contrast.max = (base, colorArray) => {
  const _base = instanceOfColor(base) ? base : color(base);
  if (!_base) return undefined;

  let output;
  let max = 0;

  colorArray.forEach((c) => {
    const _c = color(c);
    if (!c) return undefined;
    const _contrast = contrast(_base, _c);
    if (_contrast > max) {
      output = _c;
      max = _contrast;
    }
    return undefined;
  });

  return output;
};

contrast.validate = (base, c) => {
  const _contrast = Math.floor(contrast(base, c, 7) * 100) / 100;
  return {
    'wcag-aa-normal-text': _contrast >= 4.5,
    'wcag-aa-large-text': _contrast >= 3,
    'wcag-aa-ui': _contrast >= 3,
    'wcag-aaa-normal-text': _contrast >= 7,
    'wcag-aaa-large-text': _contrast >= 4.5,
  };
};

contrast.find = (base, {
  targetContrast = 7,
  hue,
  saturation = 1,
  chroma = 100,
  model = 'hsl',
}) => {
  model = model.trim().toLowerCase();
  if (model === 'xyz' || model === 'rgb') model = 'hsl';
  if (model === 'p3:rgb') model = 'p3:hsl';
  if (model === 'lab') model = 'lch';

  const _base = applyModel(model, base);
  if (!_base) return undefined;

  const output = [];
  const yb = _base.luminance;
  const y0 = targetContrast * (yb + 0.05) - 0.05;
  const y1 = (yb + 0.05) / targetContrast - 0.05;
  if (y0 >= 0 && y0 <= 1) output.push(y0);
  if (y1 >= 0 && y1 <= 1) output.push(y1);

  if (!output.length) return output;

  const [ColorConstructor] = MODEL_PARAMS[model];
  if (model.startsWith('p3:')) model = model.substring(3);

  return output.map((y) => {
    const DELTA = 0.0025;
    const MAX_ITERATION_COUNT = 7;

    let minL = 0;
    let maxL = 1;

    let c;
    let i = 0;

    while (i <= MAX_ITERATION_COUNT) {
      c = ColorConstructor[model]({
        hue,
        saturation,
        chroma,
        lightness: (maxL + minL) / 2,
      });

      const yc = c.luminance;

      if (approx(yc, y, DELTA) || i === MAX_ITERATION_COUNT) {
        let f;
        if ((yc > y && y > yb) || (yc < y && y < yb)) {
          f = 0;
        } else if (yc > y && y < yb) {
          f = -1;
        } else {
          f = 1;
        }
        return f ? c.copyWith({ lightness: c.lightness + f * 0.004, hue }) : c;
      }

      if (yc > y) {
        maxL = (maxL + minL) / 2;
      } else {
        minL = (maxL + minL) / 2;
      }

      i += 1;
    }

    return c;
  });
};

function lerp(model = 'rgb', descriptor) {
  if (typeof model !== 'string') return undefined;
  if (!descriptor) return (descriptor) => lerp(model, descriptor);

  const {
    start,
    end,
    stops = 1,
    hueDirection = 0,
    includeLast = true,
  } = descriptor;

  model = model.trim().toLowerCase();
  const _start = applyModel(model, start);
  const _end = applyModel(model, end);
  if (!_start || !_end) return undefined;

  const output = [_start];
  let _stops = parseInt(stops, 10);
  if (!_stops || _stops < 0) return includeLast ? output.concat(_end) : output;
  if (_stops > 255) _stops = 255;

  const [ColorConstructor, params] = MODEL_PARAMS[model];
  if (model.startsWith('p3:')) model = model.substring(3);

  const deltas = params.map((p) => p === 'hue'
    ? getHueDiff(_start[p], _end[p], hueDirection) / (_stops + 1)
    : (_end[p] - _start[p]) / (_stops + 1));

  while (_stops > 0) {
    output.push(ColorConstructor[`${model}Array`](params.map((p, i) => _start[p] + deltas[i] * output.length)));
    _stops -= 1;
  }

  return includeLast ? output.concat(_end) : output;
}

/* eslint-disable import/no-cycle */

function color(descriptor, rgbProfile = 'srgb') {
  if (typeof descriptor === 'object') {
    if (defined(descriptor.red, descriptor.green, descriptor.blue)) {
      return (rgbProfile === 'srgb' ? sRGBColor : DisplayP3Color).rgb(descriptor);
    }

    if (defined(descriptor.hue, descriptor.saturation, descriptor.lightness)) {
      return (rgbProfile === 'srgb' ? sRGBColor : DisplayP3Color).hsl(descriptor);
    }

    if (defined(descriptor.hue, descriptor.whiteness, descriptor.blackness)) {
      return (rgbProfile === 'srgb' ? sRGBColor : DisplayP3Color).hwb(descriptor);
    }

    if (defined(descriptor.x, descriptor.y, descriptor.z)) {
      return new XYZColor(descriptor);
    }

    if (defined(descriptor.lightness, descriptor.a, descriptor.b)) {
      return LabColor.lab(descriptor);
    }

    if (defined(descriptor.lightness, descriptor.chroma, descriptor.hue)) {
      return LabColor.lch(descriptor);
    }
  }

  if (typeof descriptor === 'string') {
    descriptor = descriptor.trim().toLowerCase();
    if (descriptor.startsWith('p3:')) return color(descriptor.substring(3), 'p3');

    if (namedColors.has(descriptor)) {
      const [red, green, blue, hue, saturation, lightness, alpha] = parseNamed(descriptor);
      return new (rgbProfile === 'srgb' ? sRGBColor : DisplayP3Color)({
        red,
        green,
        blue,
        hue,
        saturation,
        lightness,
        alpha,
      });
    }

    if (descriptor.startsWith('#')) {
      const re = descriptor.length > 5 ? HEX_RE : HEX_RE_S;
      const rgba = extractGroups(re, descriptor).map(hexToOctet);
      rgba[3] = round(rgba[3] / 255, 7);
      return (rgbProfile === 'srgb' ? sRGBColor : DisplayP3Color).rgbArray(rgba);
    }

    if (descriptor.startsWith('rgb')) {
      return (rgbProfile === 'srgb' ? sRGBColor : DisplayP3Color)
        .rgbArray(descriptor.includes(',')
          ? extractFnCommaGroups('rgb', descriptor)
          : extractFnWhitespaceGroups('rgb', descriptor));
    }

    if (descriptor.startsWith('hsl')) {
      return (rgbProfile === 'srgb' ? sRGBColor : DisplayP3Color)
        .hslArray(descriptor.includes(',')
          ? extractFnCommaGroups('hsl', descriptor)
          : extractFnWhitespaceGroups('hsl', descriptor));
    }

    if (descriptor.startsWith('hwb')) {
      return (rgbProfile === 'srgb' ? sRGBColor : DisplayP3Color)
        .hwbArray(extractFnWhitespaceGroups('hwb', descriptor));
    }

    if (descriptor.startsWith('lab')) {
      return LabColor.labArray(extractFnWhitespaceGroups('lab', descriptor));
    }

    if (descriptor.startsWith('lch')) {
      return LabColor.lchArray(extractFnWhitespaceGroups('lch', descriptor));
    }
  }

  return undefined;
}

exports.DisplayP3Color = DisplayP3Color;
exports.LabColor = LabColor;
exports.XYZColor = XYZColor;
exports.color = color;
exports.contrast = contrast;
exports.lerp = lerp;
exports.mix = mix;
exports.sRGBColor = sRGBColor;
