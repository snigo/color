import { instanceOfColor, round, assumePercent } from './utils';
import { color } from './color';
import sRGBColor from './srgb/srgb.class';
import LabColor from './lab/lab.class';

export function mix(base, c, a = 0.5) {
  const _base = (instanceOfColor(base) ? base : color(base)).toRgb();
  const _c = (instanceOfColor(c) ? c : color(c)).toRgb();
  if (!_base && !_c) return undefined;
  if (!_base) return _c;
  if (!_c) return _base;

  const factor = _c.alpha * assumePercent(a);

  return sRGBColor.rgb({
    red: _base.red + factor * (_c.red - _base.red),
    green: _base.green + factor * (_c.green - _base.green),
    blue: _base.blue + factor * (_c.blue - _base.blue),
    alpha: Math.max(_base.alpha, round(factor, 7)),
  });
}

export function mixLab(base, c, a = 0.5) {
  const _base = (instanceOfColor(base) ? base : color(base)).toLab();
  const _c = (instanceOfColor(c) ? c : color(c)).toLab();
  if (!_base && !_c) return undefined;
  if (!_base) return _c;
  if (!_c) return _base;

  const factor = _c.alpha * assumePercent(a);

  return LabColor.lch({
    lightness: _base.lightness + factor * (_c.lightness - _base.lightness),
    chroma: _base.chroma + factor * (_c.chroma - _base.chroma),
    hue: _base.hue + factor * (_c.hue - _base.hue),
    alpha: Math.max(_base.alpha, round(factor, 7)),
  });
}
