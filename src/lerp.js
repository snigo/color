import { applyModel, MODEL_PARAMS } from './utils/model';
import { getHueDiff } from './utils/utils';

export default function lerp(model = 'rgb', descriptor) {
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
