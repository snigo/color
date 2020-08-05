import {
  HEX_RE,
  HEX_RE_S,
} from './utils/constants';
import {
  defined,
  extractFnCommaGroups,
  extractFnWhitespaceGroups,
  extractGroups,
  hexToOctet,
  round,
} from './utils/utils';
import sRGBColor from './classes/srgb.class';
import DisplayP3Color from './classes/display-p3.class';
import XYZColor from './classes/xyz.class';
import LabColor from './classes/lab.class';
import { namedColors, parseNamed } from './utils/named';

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

export default color;
