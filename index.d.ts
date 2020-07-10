// Type definitions for @snigos/color
interface RGBDescriptor {
  red: number | string;
  green: number | string;
  blue: number | string;
  alpha?: number | string;
}

interface HSLDescriptor {
  hue: number | string;
  saturation: number | string;
  lightness: number | string;
  alpha?: number | string;
}

interface HWBDescriptor {
  hue: number | string;
  whiteness: number | string;
  blackness: number | string;
  alpha?: number | string;
}

interface XYZDescriptor {
  x: number;
  y: number;
  z: number;
  alpha?: number | string;
}

interface LabDescriptor {
  lightness: number | string;
  a: number | string;
  b: number | string;
  alpha?: number | string;
}

interface LCHDescriptor {
  lightness: number | string;
  chroma: number | string;
  hue: number | string;
  alpha?: number | string;
}

interface sRGBClassDescriptor extends RGBDescriptor, HSLDescriptor {
  whitePoint?: number[];
}

interface LabClassDescriptor extends LabDescriptor, LCHDescriptor {
  whitePoint?: number[];
}

interface XyzClassDescriptor extends XYZDescriptor {
  whitePoint?: number[];
}

interface sRGBInstanceParams {
  red?: number | string;
  green?: number | string;
  blue?: number | string;
  hue?: number | string;
  saturation?: number | string;
  lightness?: number | string;
  alpha?: number | string;
}

type ColorInstance = sRGBColor | LabColor | XYZColor;
type ColorDescriptor = RGBDescriptor | HSLDescriptor | HWBDescriptor | XYZDescriptor | LabDescriptor | LCHDescriptor;

export type AnyColor = string | ColorInstance | ColorDescriptor;

export function color(descriptor: AnyColor): ColorInstance;

declare class sRGBColor {

  readonly red: number;
  readonly green: number;
  readonly blue: number;
  readonly hue: number;
  readonly saturation: number;
  readonly lightness: number;
  readonly alpha: number;
  readonly whitePoint: number[];

  constructor(descriptor: sRGBClassDescriptor);

  static rgb(descriptor: RGBDescriptor): sRGBColor;
  static rgbArray(rgba: number[]): sRGBColor;
  static lin(descriptor: RGBDescriptor): sRGBColor;
  static linArray(rgba: number[]): sRGBColor;
  static hsl(descriptor: HSLDescriptor): sRGBColor;
  static hslArray(hsla: number[]): sRGBColor;
  static hwb(descriptor: HWBDescriptor): sRGBColor;
  static hwbArray(hwba: number[]): sRGBColor;

  get luminance(): number;
  get mode(): number;
  get hueGroup(): number;
  get hueGroupOffset(): number;
  get hrad(): number;
  get hgrad(): number;
  get hturn(): number;
  get name(): string | undefined;

  toLin(): number[];
  toHwb(): number[];
  toXyz(whitePoint?: number[]): XYZColor;
  toLab(): LabColor;
  toRgb(): sRGBColor;
  toGrayscale(): sRGBColor;
  toRgbString(format?: string): string;
  toHexString(): string;
  toHslString(precision?: number): string;
  toHwbString(precision?: number): string;
  copyWith(params: sRGBInstanceParams): sRGBColor;
  withAlpha(value: number): sRGBColor;
  invert(): sRGBColor;
}

declare class LabColor {

  readonly lightness: number;
  readonly a: number;
  readonly b: number;
  readonly chroma: number;
  readonly hue: number;
  readonly alpha: number;
  readonly whitePoint: number[];

  constructor(descriptor: LabClassDescriptor);

  static lab(descriptor: LabDescriptor): LabColor;
  static labArray(laba: number[]): LabColor;
  static lch(descriptor: LCHDescriptor): LabColor;
  static lchArray(lcha: number[]): LabColor;

  get luminance(): number;
  get mode(): number;
  get hrad(): number;
  get hgrad(): number;
  get hturn(): number;

  toXyz(whitePoint?: number[]): XYZColor;
  toLab(): LabColor;
  toRgb(): sRGBColor;
  toGrayscale(): sRGBColor;
  toLabString(precision?: number): string;
  toLchString(precision?: number): string;
  copyWith(params: sRGBInstanceParams): sRGBColor;
  withAlpha(value: number): sRGBColor;
  invert(): sRGBColor;
}

declare class XYZColor {

  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly alpha: number;
  readonly whitePoint: number[];

  constructor(descriptor: XyzClassDescriptor);

  static get D50(): number[];
  static get D65(): number[];

  get luminance(): number;
  get mode(): number;

  adapt(whitePoint?: number[]): XYZColor;
  toLab(): LabColor;
  toRgb(): sRGBColor;
  toXyz(): XYZColor;
  toXyzArray(): number[];
}

interface ContrastColorDescriptor {
  hue: number | string;
  saturation?: number | string;
  targetContrast?: number;
}

interface WCAGResponse {
  'wcag-aa-normal-text': boolean;
  'wcag-aa-large-text': boolean;
  'wcag-aa-ui': boolean;
  'wcag-aaa-normal-text': boolean;
  'wcag-aaa-large-text': boolean;
}

type contrastCurry = (compareColor: AnyColor, precision?: number) => number;
namespace contrastCurry {
  export function find(descriptor: ContrastColorDescriptor): sRGBColor[];
  export function min(array: AnyColor[]): sRGBColor;
  export function max(array: AnyColor[]): sRGBColor;
  export function validate(testColor: AnyColor): WCAGResponse;
}
export function contrast(base: AnyColor, compareColor?: AnyColor, precision?: number): number;
export function contrast(base: AnyColor): contrastCurry;
export namespace contrast {
  export function find(base: AnyColor, descriptor: ContrastColorDescriptor): sRGBColor[];
  export function min(base: AnyColor, array: AnyColor[]): sRGBColor;
  export function max(base: AnyColor, array: AnyColor[]): sRGBColor;
  export function validate(base: AnyColor, testColor: AnyColor): WCAGResponse;
}

export function mix(base: AnyColor, layer: AnyColor, alpha?: number): sRGBColor;

export function mixLab(base: AnyColor, layer: AnyColor, alpha?: number): LabColor;

export {
  sRGBColor,
  LabColor,
  XYZColor,
}