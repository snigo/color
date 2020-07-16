import { instanceOfColor, modulo } from './utils';
import { color } from './color';
import LabColor from './lab/lab.class';
import sRGBColor from './srgb/srgb.class';

const MODEL_PARAMS = {
  rgb: [sRGBColor, ['red', 'green', 'blue', 'alpha']],
  hsl: [sRGBColor, ['hue', 'saturation', 'lightness', 'alpha']],
  lab: [LabColor, ['lightness', 'a', 'b', 'alpha']],
  lch: [LabColor, ['lightness', 'chroma', 'hue', 'alpha']],
};

function applyModel(model, c) {
  if (!c) return undefined;
  switch (model) {
    case 'rgb':
    case 'hsl':
      return instanceOfColor(c) ? c.toRgb() : applyModel(model, color(c));
    case 'lab':
    case 'lch':
      return instanceOfColor(c) ? c.toLab() : applyModel(model, color(c));
    default:
      return undefined;
  }
}

function getHueDelta(fromHue, toHue, stops, dir) {
  const ccw = -(modulo(fromHue - toHue, 360) || 360);
  const cw = modulo(toHue - fromHue, 360) || 360;
  switch (dir) {
    case -1:
      return ccw / (stops + 1);
    case 1:
      return cw / (stops + 1);
    case 0:
    default:
      return ((cw % 360 <= 180) ? cw : ccw) / (stops + 1);
  }
}

export default function lerp(model = 'rgb', descriptor) {
  if (typeof model !== 'string') return undefined;
  if (!descriptor) return (descriptor) => lerp(model, descriptor);

  const {
    from,
    to,
    stops = 1,
    hueDirection = 0,
    includeLast = true,
  } = descriptor;

  model = model.trim().toLowerCase();
  const _from = applyModel(model, from);
  const _to = applyModel(model, to);
  if (!_from || !_to) return undefined;

  const output = [_from];
  let _stops = parseInt(stops, 10);
  if (!_stops || _stops < 0) return includeLast ? output.concat(_to) : output;
  if (_stops > 255) _stops = 255;

  const [ColorConstructor, params] = MODEL_PARAMS[model];
  const deltas = params.map((p) => p === 'hue'
    ? getHueDelta(_from[p], _to[p], _stops, hueDirection)
    : (_to[p] - _from[p]) / (_stops + 1));

  while (_stops > 0) {
    output.push(ColorConstructor[`${model}Array`](params.map((p, i) => _from[p] + deltas[i] * output.length)));
    _stops -= 1;
  }

  return includeLast ? output.concat(_to) : output;
}
