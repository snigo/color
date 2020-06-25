import {
  assumeAlpha,
  assumeByte,
  assumeChroma,
  assumeHue,
  assumePercent,
  defined,
  modulo,
  round,
} from '../utils';

import { D50, D65 } from '../constants';
// eslint-disable-next-line import/no-cycle
import XYZColor from '../xyz/xyz.class';

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
      chroma: round(Math.sqrt(_a ** 2 + _b ** 2), 3),
      hue: modulo(round((Math.atan2(_b, _a) * 180) / Math.PI, 0), 360),
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
      a: round(_chroma * Math.cos((_hue * Math.PI) / 180), 0),
      b: round(_chroma * Math.sin((_hue * Math.PI) / 180), 0),
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
    ].map((V, i) => V * this.whitePoint[i]);

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

  toLchString() {
    return this.alpha < 1
      ? `lch(${round(this.lightness * 100, 0)}% ${this.chroma} ${this.hue}deg / ${this.alpha})`
      : `lch(${round(this.lightness * 100, 0)}% ${this.chroma} ${this.hue}deg)`;
  }

  toLabString() {
    return this.alpha < 1
      ? `lab(${round(this.lightness * 100, 0)}% ${this.a} ${this.b} / ${this.alpha})`
      : `lab(${round(this.lightness * 100, 0)}% ${this.a} ${this.b})`;
  }
}

export default LabColor;
