/* eslint-disable import/no-cycle */
import { equal, applyMatrix } from '../utils';
import {
  D50,
  D65_D50_MATRIX,
  D50_D65_MATRIX,
  D65,
  XYZ_RGB_MATRIX,
} from '../constants';
import LabColor from '../lab/lab.class';
import sRGBColor from '../srgb/srgb.class';

class XYZColor {
  constructor({
    x,
    y,
    z,
    alpha = 1,
    whitePoint = XYZColor.D50,
  }) {
    Object.defineProperties(this, {
      x: {
        value: x,
      },
      y: {
        value: y,
      },
      z: {
        value: z,
      },
      alpha: {
        value: alpha,
      },
      whitePoint: {
        value: whitePoint,
      },
    });
  }

  static get D50() {
    return D50;
  }

  static get D65() {
    return D65;
  }

  get luminance() {
    return this.y;
  }

  get mode() {
    return +(this.luminance < 0.18);
  }

  adapt(whitePoint) {
    if (equal(whitePoint, this.whitePoint)) return this;
    const [x, y, z] = applyMatrix(
      this.toXyzArray(),
      equal(whitePoint, XYZColor.D50) ? D65_D50_MATRIX : D50_D65_MATRIX,
    );
    return new XYZColor({
      x,
      y,
      z,
      alpha: this.alpha,
      whitePoint,
    });
  }

  toXyzArray() {
    return [this.x, this.y, this.z];
  }

  toLab() {
    const xyz = (equal(this.whitePoint, XYZColor.D65)
      ? this.adapt(XYZColor.D50)
      : this).toXyzArray();

    const e = 0.008856;
    const k = 903.3;
    const [fx, fy, fz] = xyz
      .map((V, i) => V / D50[i])
      .map((vr) => vr > e ? Math.cbrt(vr) : (k * vr + 16) / 116);

    return LabColor.lab({
      lightness: (116 * fy - 16) / 100,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz),
      alpha: this.alpha,
    });
  }

  toRgb() {
    const xyz = (equal(this.whitePoint, XYZColor.D65)
      ? this
      : this.adapt(XYZColor.D65)).toXyzArray();

    return sRGBColor.linArray(applyMatrix(xyz, XYZ_RGB_MATRIX));
  }

  toXyz() {
    return this;
  }
}

export default XYZColor;
