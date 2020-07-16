/* eslint-disable import/no-cycle */
import XYZColor from '../xyz/xyz.class';

import {
  D50,
  D65,
  OCT_RANGE,
  P3_XYZ_MATRIX,
} from '../constants';

import {
  applyMatrix,
  assumeAlpha,
  assumeHue,
  assumeOctet,
  assumePercent,
  getFraction,
  getHslSaturation,
  modulo,
  octetToHex,
  round,
  defined,
} from '../utils';

import { getColorName } from '../named';

class DisplayP3Color {
  constructor({
    red,
    green,
    blue,
    hue,
    saturation,
    lightness,
    alpha,
  }) {
    Object.defineProperties(this, {
      red: {
        value: red,
      },
      green: {
        value: green,
      },
      blue: {
        value: blue,
      },
      hue: {
        value: hue,
      },
      saturation: {
        value: saturation,
      },
      lightness: {
        value: lightness,
      },
      alpha: {
        value: alpha,
      },
      whitePoint: {
        value: D65,
      },
      profile: {
        value: 'display-p3',
      },
    });
  }

  static rgb({
    red,
    green,
    blue,
    alpha,
  }) {
    const _red = assumeOctet(red);
    const _green = assumeOctet(green);
    const _blue = assumeOctet(blue);

    if (!defined(_red, _green, _blue)) return undefined;

    const R = getFraction(OCT_RANGE, _red);
    const G = getFraction(OCT_RANGE, _green);
    const B = getFraction(OCT_RANGE, _blue);

    const min = Math.min(R, G, B);
    const max = Math.max(R, G, B);
    const chroma = max - min;

    let hue;

    if (chroma === 0) {
      hue = 0;
    } else if (max === R) {
      hue = (G - B) / chroma;
    } else if (max === G) {
      hue = (B - R) / chroma + 2;
    } else {
      hue = (R - G) / chroma + 4;
    }

    const lightness = (max + min) / 2;
    const saturation = getHslSaturation(chroma, lightness);

    return new DisplayP3Color({
      red: _red,
      green: _green,
      blue: _blue,
      hue: assumeHue(hue * 60),
      saturation,
      lightness: assumePercent(lightness),
      alpha: assumeAlpha(alpha),
    });
  }

  static rgbArray([red, green, blue, alpha]) {
    return DisplayP3Color.rgb({
      red,
      green,
      blue,
      alpha,
    });
  }

  static lin({
    red,
    green,
    blue,
    alpha,
  }) {
    const rgba = [red, green, blue]
      .map((V) => V > 0.0031308 ? V ** (1 / 2.4) * 1.055 - 0.055 : 12.92 * V)
      .map((V) => V * 255)
      .concat(alpha);

    return DisplayP3Color.rgbArray(rgba);
  }

  static linArray([red, green, blue, alpha]) {
    return DisplayP3Color.lin({
      red,
      green,
      blue,
      alpha,
    });
  }

  static hsl({
    hue,
    saturation,
    lightness,
    alpha,
  }) {
    const _hue = assumeHue(hue);
    const _saturation = assumePercent(saturation);
    const _lightness = assumePercent(lightness);

    if (!defined(_hue, _saturation, _lightness)) return undefined;

    const chroma = (1 - Math.abs(2 * _lightness - 1)) * _saturation;
    const x = chroma * (1 - Math.abs(((_hue / 60) % 2) - 1));
    const b = _lightness - chroma / 2;

    let red = 0;
    let green = 0;
    let blue = 0;

    if (_hue >= 0 && _hue < 60) {
      red = chroma;
      green = x;
      blue = 0;
    } else if (_hue >= 60 && _hue < 120) {
      red = x;
      green = chroma;
      blue = 0;
    } else if (_hue >= 120 && _hue < 180) {
      red = 0;
      green = chroma;
      blue = x;
    } else if (_hue >= 180 && _hue < 240) {
      red = 0;
      green = x;
      blue = chroma;
    } else if (_hue >= 240 && _hue < 300) {
      red = x;
      green = 0;
      blue = chroma;
    } else if (_hue >= 300 && _hue < 360) {
      red = chroma;
      green = 0;
      blue = x;
    }

    return new DisplayP3Color({
      red: assumeOctet((red + b) * 255),
      green: assumeOctet((green + b) * 255),
      blue: assumeOctet((blue + b) * 255),
      hue: _hue,
      saturation: _saturation,
      lightness: _lightness,
      alpha: assumeAlpha(alpha),
    });
  }

  static hslArray([hue, saturation, lightness, alpha]) {
    return DisplayP3Color.hsl({
      hue,
      saturation,
      lightness,
      alpha,
    });
  }

  static hwb({
    hue,
    whiteness,
    blackness,
    alpha,
  }) {
    const _whiteness = assumePercent(whiteness);
    const _blackness = assumePercent(blackness);

    const lightness = (1 - _whiteness + _blackness) / 2;
    const chroma = 1 - _whiteness - _blackness;
    const saturation = getHslSaturation(chroma, lightness);
    return DisplayP3Color.hsl({
      hue: assumeHue(hue),
      saturation,
      lightness,
      alpha,
    });
  }

  static hwbArray([hue, whiteness, blackness, alpha]) {
    return DisplayP3Color.hwb({
      hue,
      whiteness,
      blackness,
      alpha,
    });
  }

  get luminance() {
    return this.toXyz().y;
  }

  get mode() {
    return +(this.luminance < 0.18);
  }

  get hueGroup() {
    return modulo(Math.floor(((this.hue + 15) % 360) / 30) + 1, 11);
  }

  get hueGroupOffset() {
    return modulo((this.hue % 30) + 15, 30);
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

  get name() {
    const name = getColorName(this.toHexString().substring(0, 7));
    return (this.alpha === 1 || !name) ? name : `${name}*`;
  }

  toLin() {
    return [this.red, this.green, this.blue]
      .map((value) => {
        const V = value / 255;
        return round(V < 0.04045 ? V / 12.92 : ((V + 0.055) / 1.055) ** 2.4, 7);
      });
  }

  toHwb() {
    const rgbr = [this.red, this.green, this.blue].map((value) => value / 255);
    return [
      this.hue,
      round(1 - Math.max(...rgbr), 7),
      round(Math.min(...rgbr), 7),
      this.alpha,
    ];
  }

  toXyz(whitePoint = this.whitePoint) {
    const [x, y, z] = applyMatrix(this.toLin(), P3_XYZ_MATRIX);
    return new XYZColor({
      x,
      y,
      z,
      alpha: this.alpha,
      whitePoint: this.whitePoint,
    }).adapt(whitePoint);
  }

  toLab() {
    return this.toXyz(D50).toLab();
  }

  toP3() {
    return this;
  }

  toRgb() {
    return this.toXyz().toRgb();
  }

  toGrayscale() {
    if (this.saturation === 0) return this;
    const l = this.luminance > 0.0393
      ? ((this.luminance ** (1 / 2.4)) * 1.055 - 0.055) * 255
      : this.luminance * 3294.6;
    return DisplayP3Color.rgb({
      red: l,
      green: l,
      blue: l,
      alpha: this.alpha,
    });
  }

  toRgbString(format = 'absolute') {
    const _red = format === 'relative'
      ? `${round(getFraction(OCT_RANGE, this.red) * 100, 3)}%`
      : this.red;
    const _green = format === 'relative'
      ? `${round(getFraction(OCT_RANGE, this.green) * 100, 3)}%`
      : this.green;
    const _blue = format === 'relative'
      ? `${round(getFraction(OCT_RANGE, this.blue) * 100, 3)}%`
      : this.blue;
    const _alpha = format === 'relative'
      ? `${round(this.alpha * 100, 0)}%`
      : this.alpha;
    return this.alpha < 1
      ? `rgb(${_red} ${_green} ${_blue} / ${_alpha})`
      : `rgb(${_red} ${_green} ${_blue})`;
  }

  toColorString() {
    const _red = round(getFraction(OCT_RANGE, this.red), 5);
    const _green = round(getFraction(OCT_RANGE, this.green), 5);
    const _blue = round(getFraction(OCT_RANGE, this.blue), 5);

    return this.alpha < 1
      ? `color(${this.profile} ${_red} ${_green} ${_blue} / ${this.alpha})`
      : `color(${this.profile} ${_red} ${_green} ${_blue})`;
  }

  toHexString() {
    return `#${octetToHex(this.red)}${octetToHex(this.green)}${octetToHex(this.blue)}${this.alpha < 1 ? octetToHex(Math.round(255 * this.alpha)) : ''}`;
  }

  toHslString(precision = 1) {
    return this.alpha < 1
      ? `hsl(${round(this.hue, precision)}deg ${round(this.saturation * 100, precision)}% ${round(this.lightness * 100, precision)}% / ${this.alpha})`
      : `hsl(${round(this.hue, precision)}deg ${round(this.saturation * 100, precision)}% ${round(this.lightness * 100, precision)}%)`;
  }

  toHwbString(precision = 1) {
    const [h, w, b] = this.toHwb();
    return this.alpha < 1
      ? `hwb(${round(h, precision)}deg ${round(w * 100, precision)}% ${round(b * 100, precision)}% / ${this.alpha})`
      : `hwb(${round(h, precision)}deg ${round(w * 100, precision)}% ${round(b * 100, precision)}%)`;
  }

  withAlpha(value = 1) {
    if (this.alpha === value) return this;
    return new DisplayP3Color({
      red: this.red,
      green: this.green,
      blue: this.blue,
      hue: this.hue,
      saturation: this.saturation,
      lightness: this.lightness,
      alpha: assumeAlpha(value),
    });
  }

  invert() {
    return DisplayP3Color.rgb({
      red: 255 - this.red,
      green: 255 - this.green,
      blue: 255 - this.blue,
      alpha: this.alpha,
    });
  }

  copyWith(params) {
    if ('red' in params || 'blue' in params || 'green' in params) {
      return DisplayP3Color.rgb({
        red: this.red,
        green: this.green,
        blue: this.blue,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('hue' in params || 'saturation' in params || 'lightness' in params) {
      return DisplayP3Color.hsl({
        hue: this.hue,
        saturation: this.saturation,
        lightness: this.lightness,
        alpha: this.alpha,
        ...params,
      });
    }

    if ('alpha' in params) {
      return this.opacity(params.alpha);
    }

    return this;
  }
}

export default DisplayP3Color;
