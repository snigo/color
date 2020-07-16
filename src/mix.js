import { assumePercent, applyModel, getHueDiff } from './utils';
import { MODEL_PARAMS } from './constants';

export default function mix(model = 'rgb', descriptor) {
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
