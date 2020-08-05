import DisplayP3Color from './classes/display-p3.class';
import LabColor from './classes/lab.class';
import sRGBColor from './classes/srgb.class';
import XYZColor from './classes/xyz.class';
import contrast from './contrast';
import {
  OCT_RANGE,
  DEG_RANGE,
  ONE_RANGE,
  BYTE_RANGE,
  CHROMA_RANGE,
} from './utils/constants';
import { defined, rnd } from './utils/utils';

const MODEL_MAP = {
  rgb: [
    sRGBColor.rgb,
    {
      red: OCT_RANGE,
      green: OCT_RANGE,
      blue: OCT_RANGE,
      alpha: 1,
    },
    [0, 0, 0, 4],
  ],
  'p3:rgb': [
    DisplayP3Color.rgb,
    {
      red: OCT_RANGE,
      green: OCT_RANGE,
      blue: OCT_RANGE,
      alpha: 1,
    },
    [0, 0, 0, 4],
  ],
  hsl: [
    sRGBColor.hsl,
    {
      hue: DEG_RANGE,
      saturation: ONE_RANGE,
      lightness: ONE_RANGE,
      alpha: 1,
    },
    [0, 3, 3, 4],
  ],
  'p3:hsl': [
    DisplayP3Color.hsl,
    {
      hue: DEG_RANGE,
      saturation: ONE_RANGE,
      lightness: ONE_RANGE,
      alpha: 1,
    },
    [0, 3, 3, 4],
  ],
  hwb: [
    sRGBColor.hwb,
    {
      hue: DEG_RANGE,
      whiteness: ONE_RANGE,
      blackness: ONE_RANGE,
      alpha: 1,
    },
    [0, 3, 3, 4],
  ],
  'p3:hwb': [
    DisplayP3Color.hwb,
    {
      hue: DEG_RANGE,
      whiteness: ONE_RANGE,
      blackness: ONE_RANGE,
      alpha: 1,
    },
    [0, 3, 3, 4],
  ],
  lab: [
    LabColor.lab,
    {
      lightness: ONE_RANGE,
      a: BYTE_RANGE,
      b: BYTE_RANGE,
      alpha: 1,
    },
    [5, 3, 3, 4],
  ],
  lch: [
    LabColor.lch,
    {
      lightness: ONE_RANGE,
      chroma: CHROMA_RANGE,
      hue: DEG_RANGE,
      alpha: 1,
    },
    [5, 3, 3, 4],
  ],
  xyz: [
    XYZColor.xyz,
    {
      x: ONE_RANGE,
      y: ONE_RANGE,
      z: ONE_RANGE,
      alpha: 1,
    },
    [6, 6, 6, 4],
  ],
};

export function random(model = 'rgb', descriptor = {}) {
  if (typeof model !== 'string') return undefined;
  model = model.trim().toLowerCase();

  const [f, p, presicion] = MODEL_MAP[model] || [];
  if (!f) return undefined;

  const props = { ...p };

  Object.keys(props).forEach((p, i) => {
    if (defined(descriptor[p])) props[p] = descriptor[p];
    if (Array.isArray(props[p])) props[p] = rnd(props[p], presicion[i]);
  });
  return f(props);
}

export function randomContrast(base = 'white', descriptor = {
  hue: DEG_RANGE,
  saturation: ONE_RANGE,
  chroma: CHROMA_RANGE,
  targetContrast: [0, 21],
  model: 'hsl',
}) {
  let {
    hue = DEG_RANGE,
    saturation = ONE_RANGE,
    chroma = CHROMA_RANGE,
    targetContrast = [0, 21],
    model = 'hsl',
  } = descriptor;
  if (typeof model !== 'string') model = 'hsl';
  model = model.trim().toLowerCase();
  if (Array.isArray(hue)) {
    const huePrecision = (model === 'lab' || model === 'lch') ? 3 : 0;
    hue = rnd(hue, huePrecision);
  }
  if (Array.isArray(saturation)) saturation = rnd(saturation, 3);
  if (Array.isArray(chroma)) chroma = rnd(chroma, 3);
  if (Array.isArray(targetContrast)) targetContrast = rnd(targetContrast, 2);

  return contrast.find(base, {
    targetContrast,
    hue,
    saturation,
    chroma,
    model,
  });
}
