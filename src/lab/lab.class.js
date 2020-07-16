/* eslint-disable import/no-cycle */
import {
  assumeAlpha,
  assumeByte,
  assumeChroma,
  assumeHue,
  assumePercent,
  defined,
  round,
} from '../utils';

import { D50, D65 } from '../constants';
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
      profile: {
        value: 'cie-lab',
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
      chroma: assumeChroma(Math.sqrt(_a ** 2 + _b ** 2)),
      hue: assumeHue((Math.atan2(round(_b, 3), round(_a, 3)) * 180) / Math.PI),
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
      a: assumeByte(_chroma * Math.cos((_hue * Math.PI) / 180)),
      b: assumeByte(_chroma * Math.sin((_hue * Math.PI) / 180)),
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

  get hrad() {
    return round(this.hue * (Math.PI / 180), 7);
  }

  get hgrad() {
    return round(this.hue / 0.9, 7);
  }

  get hturn() {
    return round(this.hue / 360, 7);
  }

  get luminance() {
    return this.toXyz().y;
  }

  get mode() {
    return +(this.luminance < 0.18);
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
    ].map((V, i) => round(V * this.whitePoint[i], 7));

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

  toP3() {
    return this.toXyz(D65).toP3();
  }

  toLab() {
    return this;
  }

  toGrayscale() {
    return this.copyWith({
      a: 0,
      b: 0,
    });
  }

  toLchString(precision = 3) {
    return this.alpha < 1
      ? `lch(${round(this.lightness * 100, precision)}% ${round(this.chroma, precision)} ${round(this.hue, precision)}deg / ${this.alpha})`
      : `lch(${round(this.lightness * 100, precision)}% ${round(this.chroma, precision)} ${round(this.hue, precision)}deg)`;
  }

  toLabString(precision = 3) {
    return this.alpha < 1
      ? `lab(${round(this.lightness * 100, precision)}% ${round(this.a, precision)} ${round(this.b, precision)} / ${this.alpha})`
      : `lab(${round(this.lightness * 100, precision)}% ${round(this.a, precision)} ${round(this.b, precision)})`;
  }

  withAlpha(value = 1) {
    if (this.alpha === value) return this;
    return new LabColor({
      lightness: this.lightness,
      a: this.a,
      b: this.b,
      chroma: this.chroma,
      hue: this.hue,
      alpha: assumeAlpha(value),
    });
  }

  copyWith(params) {
    if ('a' in params || 'b' in params) {
      return LabColor.lab({
        lightness: this.lightness,
        a: this.b,
        b: this.b,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('hue' in params || 'chroma' in params) {
      return LabColor.lch({
        lightness: this.lightness,
        chroma: this.chroma,
        hue: this.hue,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('lightness' in params) {
      return LabColor.lab({
        lightness: this.lightness,
        a: this.a,
        b: this.b,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('alpha' in params) {
      return this.opacity(params.alpha);
    }

    return this;
  }

  invert() {
    return LabColor.lab({
      lightness: this.lightness,
      a: -this.a,
      b: -this.b,
      alpha: this.alpha,
    });
  }
}

export default LabColor;
