import sRGBColor from './srgb/srgb.class';
import { color } from './color';
import { round, approx, instanceOfColor } from './utils';
import { mix, mixLab } from './mix';
import LabColor from './lab/lab.class';
import XYZColor from './xyz/xyz.class';

function contrast(base = '#fff', c, precision = 2) {
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

  let _c = instanceOfColor(c) ? c : color(c);
  if (_c.alpha < 1) {
    if (_c instanceof sRGBColor) {
      _c = mix(_base, _c);
    } else if (_c instanceof LabColor) {
      _c = mixLab(_base, _c);
    } else if (_c instanceof XYZColor && _c.whitePoint === XYZColor.D65) {
      _c = mix(_base, _c.toRgb()).toXyz();
    } else if (_c instanceof XYZColor && _c.whitePoint === XYZColor.D50) {
      _c = mixLab(_base, _c.toLab()).toXyz();
    } else {
      return undefined;
    }
  }
  const dark = Math.min(_c.luminance, _base.luminance);
  const light = Math.max(_c.luminance, _base.luminance);

  return round((light + 0.05) / (dark + 0.05), precision);
}

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
}) => {
  const _base = instanceOfColor(base) ? base : color(base);
  if (!_base) return undefined;

  const output = [];
  const yb = _base.luminance;
  const y0 = targetContrast * (yb + 0.05) - 0.05;
  const y1 = (yb + 0.05) / targetContrast - 0.05;
  if (y0 >= 0 && y0 <= 1) output.push(y0);
  if (y1 >= 0 && y1 <= 1) output.push(y1);

  if (!output.length) return output;

  return output.map((y) => {
    const DELTA = 0.0025;
    const MAX_ITERATION_COUNT = 7;

    let minL = 0;
    let maxL = 1;

    let c;
    let i = 0;

    while (i <= MAX_ITERATION_COUNT) {
      c = sRGBColor.hsl({
        hue,
        saturation,
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
        return f ? c.copyWith({ lightness: c.lightness + f * 0.004 }) : c;
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

export default contrast;
