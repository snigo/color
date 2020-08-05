import color from '../color';
import LabColor from '../classes/lab.class';
import DisplayP3Color from '../classes/display-p3.class';
import sRGBColor from '../classes/srgb.class';
import XYZColor from '../classes/xyz.class';

export const MODEL_PARAMS = {
  rgb: [sRGBColor, ['red', 'green', 'blue', 'alpha']],
  hsl: [sRGBColor, ['hue', 'saturation', 'lightness', 'alpha']],
  lab: [LabColor, ['lightness', 'a', 'b', 'alpha']],
  lch: [LabColor, ['lightness', 'chroma', 'hue', 'alpha']],
  xyz: [XYZColor, ['x', 'y', 'z', 'alpha']],
  'p3:rgb': [DisplayP3Color, ['red', 'green', 'blue', 'alpha']],
  'p3:hsl': [DisplayP3Color, ['hue', 'saturation', 'lightness', 'alpha']],
};

export function instanceOfColor(c) {
  return c instanceof sRGBColor
    || c instanceof DisplayP3Color
    || c instanceof LabColor
    || c instanceof XYZColor;
}

export function applyModel(model, c) {
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
