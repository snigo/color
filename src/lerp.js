import { MODEL_PARAMS } from './constants';
import { applyModel, getHueDiff } from './utils';

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
  if (model.startsWith('p3:')) model = model.substring(3);

  const deltas = params.map((p) => p === 'hue'
    ? getHueDiff(_from[p], _to[p], hueDirection) / (_stops + 1)
    : (_to[p] - _from[p]) / (_stops + 1));

  while (_stops > 0) {
    output.push(ColorConstructor[`${model}Array`](params.map((p, i) => _from[p] + deltas[i] * output.length)));
    _stops -= 1;
  }

  return includeLast ? output.concat(_to) : output;
}
