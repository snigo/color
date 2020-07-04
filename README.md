# color

Greatly missing color functions and types for JavaScript.
- Supports three color spaces: *sRGB*, *CIELab* and *CIEXYZ* with precise conversion between them.
- Zero dependencies
- Parser doesn’t rely on browser to parse color strings and could be used in any environment.
- Understands all CSS colors and many more cool features!

## Usage

In the terminal:
```

% npm install @snigos/color

```

Then in the module:
```js

// JavaScript modules
import { color, contrast } from '@snigos/color';

const bgColor = color('#fdfeff');
const bgContrast = contrast(bgColor);

const badPrimaryColor = 'hsl(134deg 80% 50%)';

bgContrast(badPrimaryColor); // 1.67
bgContrast.validate(badPrimaryColor);
/* {
  wcag-aa-normal-text: false,
  wcag-aa-large-text: false,
  wcag-aa-ui: false,
  wcag-aaa-normal-text: false,
  wcag-aaa-large-text: false,
} */

const goodPrimaryColor = bgContrast.find({
  hue: 134,
  saturation: 0.8,
  targetContrast: 4.5,
});

bgContrast(goodPrimaryColor); // 4.54
goodPrimaryColor.toHslString(); // hsl(134deg 80% 29.7%)
goodPrimaryColor.toHexString(); // #0f882b
goodPrimaryColor.toLab().toLchString(); // lch(49.377% 60.817 140.04deg)
goodPrimaryColor.copyWith({ lightness: goodPrimaryColor.lightness + 0.05 });
/*
  sRGBColor {
    red: 18,
    green: 159,
    blue: 51,
    hue: 134,
    saturation: 0.8,
    lightness: 0.346875,
    alpha: 1,
    ...
  }
*/
```

## Motivation

Whether you like it or not, but merging between CSS and JavaScript and using JavaScript for styling in non-CSS environments, like mobile development, is here and most likely will stay for quite a while. The need of JavaScript representations of CSS units is inevitable, especially in a color as things there are about to change with introduction of CIELab color space in modern browsers that is pretty much around the corner. You can read [this article](https://lea.verou.me/2020/04/lch-colors-in-css-what-why-and-how/) by [Lea Verou](https://twitter.com/leaverou) explaining well, why Lab colors are pretty cool.

Color package consists of several perfectly tree-shakeable modules:
- color function: color parcer that converts strings like this: #da34e1 into JavaScript object, an sRGBColor instance in this case
- sRGBColor class whos instances store vital information about the color in sRGB color space
- LabColor class that does the same for Lab color space
- XYZColor class that store information about the color in CIEXYZ color space
- contrast function: calculates, validates and generates color in given hue with desired target contrast
- mix and mixLab functions: well, they mix colors either in sRGB or Lab color space

You can only import and use functionality you need.

## FAQ

> Why 3 different classes to store color?

Because underlining color spaces are very different, especially sRGB and Lab colors. They literally mathematically incomparible, that's why we need auxilary class XYZ for conversions between them. They also share same parameters like hue and lightness, that are completely different things and storing it all in one instance would be a nightmare.

> Where's CMYK?

First of all CMYK colors are huge thing by itself and to be done property requires separate library and secondly its subtractive color nature would not allow some core functionality of this library.

> Are color instances immutable?

Yes! Any modification of instance will always produce new instance and all properties of color instances are read-only.

> Does this library comply with CSS Color spec?

This library partually comply with CSS Color spec, it uses the same Bradford adaptation method with default D65 white point for sRGB and D50 white point for Lab (also used by Adobe products), it parses all the possible color notations defined in the spec including CSS named colors, but it also has few important differences:
1. contrast function in this library doesn't floor (truncate) the result, but mathematically rounds it, so contrast value `4.4954` will be correctly shown as `4.5`, however `contrast.validate` function will not validate such contrast as valid according to WCAG2.0 requirements.
2. parser of this library additionally **allows** mixed absolute and relative values like so: `rgb(50% 123 25% / .5)`, which is not valid syntax according to CSS Color spec.
3. `mix` and `mixLab` functions of the library work completely different from `mix-color` CSS function with semi-transparent colors. Our approach is layering colors on top of each other with given alpha channel value and their approach is rather amount of color you want to mix:
```js
/**
 * If you put tansparent color on top of green the result will still be green
 * In CSS function mix-color() the result with same parameters will give you "transparent" 
 */
mix('green', 'transparent', '100%').name; // "green"
```

## API

### Contents:
[sRGBColor](#srgbcolor)<br>
  [sRGBColor.rgb()](#static-srgbcolorrgb)<br>
  [sRGBColor.rgbArray()](#static-srgbcolorrgbarray)<br>
  [sRGBColor.hsl()](#static-srgbcolorhsl)<br>
  [sRGBColor.hslArray()](#static-srgbcolorhslarray)<br>
  [sRGBColor.hwb()](#static-srgbcolorhwb)<br>
  [sRGBColor.hwbArray()](#static-srgbcolorhwbarray)<br>
  [sRGBColor.lin()](#static-srgbcolorlin)<br>
  [sRGBColor.linArray()](#static-srgbcolorlinarray)<br>
  
[color()](#color-1)<br>

***

### `sRGBColor`

Creates instanse of sRGBColor

```js
new sRGBColor(descriptor);
```

Takes color descriptor object as only parameter:
| **Property**  | **Type**   | **Default value**                  | **Notes**                                      |
|---------------|------------|------------------------------------|------------------------------------------------|
| `red`         | `number`   |                                    | Red value in 0...255 range                     |
| `green`       | `number`   |                                    | Green value in 0...255 range                   |
| `blue`        | `number`   |                                    | Blue value in 0...255 range                    |
| `hue`         | `number`   |                                    | Hue value in 0...360 range                     |
| `saturation`  | `number`   |                                    | Saturation value in 0...1 range                |
| `lightness`   | `number`   |                                    | Lightness in 0...1 range                       |
| `alpha`       | `number`   | 1                                  | Alpha value in 0...255 range                   |
| `whitePoint`  | `number[]` | XYZColor.D65 = [0.9505, 1, 1.089]  | Illuminant white point D65 or D50              |

**NOTE**: In real life scenarios you almost never will have to use class constructor in this way and instead you are going to use one of the static methods of the class

***

#### `static sRGBColor.rgb()`

Creates instanse of sRGBColor with provided red, green and blue values

```js
sRGBColor.rgb(descriptor);
```

Takes color descriptor object as only parameter:
| **Property**  | **Type**   | **Default value**                  | **Notes**                                      |
|---------------|------------|------------------------------------|------------------------------------------------|
| `red`         | `number`   |                                    | Red value in 0...255 range                     |
| `green`       | `number`   |                                    | Green value in 0...255 range                   |
| `blue`        | `number`   |                                    | Blue value in 0...255 range                    |
| `alpha`       | `number`   | 1                                  | Alpha value in 0...1 range                     |

Returns sRGBColor instance or undefined if parameters are given incorrectly.

***

#### `static sRGBColor.rgbArray()`

Creates instanse of sRGBColor with provided red, green, blue and alpha values in array

```js
sRGBColor.rgbArray(rgbaArray);
```

Takes array in [red, green, blue, alpha] format. If no alpha value provided, it defaults to 1. Returns sRGBColor instance or undefined if parameters are given incorrectly.

***

#### `static sRGBColor.hsl()`

Creates instanse of sRGBColor with provided hue, saturation and lightness values

```js
sRGBColor.hsl(descriptor);
```

Takes color descriptor object as only parameter:
| **Property**  | **Type**   | **Default value**           | **Notes**                                        |
|---------------|------------|-----------------------------|--------------------------------------------------|
| `hue`         | `number`   |                             | Hue value in 0...360 range, representing degrees |
| `saturation`  | `number`   |                             | Saturation value in 0...1 range                  |
| `lightness`   | `number`   |                             | Lightness value in 0...1 range                   |
| `alpha`       | `number`   | 1                           | Alpha value in 0...1 range                       |

Returns sRGBColor instance or undefined if parameters are given incorrectly.

***

#### `static sRGBColor.hslArray()`

Creates instanse of sRGBColor with provided hue, saturation, lightness and alpha values in array

```js
sRGBColor.hslArray(hslaArray);
```

Takes array in [hue, saturation, lightness, alpha] format. If no alpha value provided, it defaults to 1. Returns sRGBColor instance or undefined if parameters are given incorrectly.

***

#### `static sRGBColor.hwb()`

Creates instanse of sRGBColor with provided hue, whiteness and blackness values

```js
sRGBColor.hwb(descriptor);
```

Takes color descriptor object as only parameter:
| **Property**  | **Type**   | **Default value**           | **Notes**                                        |
|---------------|------------|-----------------------------|--------------------------------------------------|
| `hue`         | `number`   |                             | Hue value in 0...360 range, representing degrees |
| `whiteness`   | `number`   |                             | Whiteness value in 0...1 range                   |
| `blackness`   | `number`   |                             | Blackness value in 0...1 range                   |
| `alpha`       | `number`   | 1                           | Alpha value in 0...1 range                       |

Returns sRGBColor instance or undefined if parameters are given incorrectly.

***

#### `static sRGBColor.hwbArray()`

Creates instanse of sRGBColor with provided hue, whiteness, blackness and alpha values in array

```js
sRGBColor.hwbArray(hwbaArray);
```

Takes array in [hue, whiteness, blackness, alpha] format. If no alpha value provided, it defaults to 1. Returns sRGBColor instance or undefined if parameters are given incorrectly.

***

#### `static sRGBColor.lin()`

Creates instanse of sRGBColor with provided linear values of red, green, blue components through the process of gamma decoding (applying a gamma of 1/2.2 to the values). 

```js
sRGBColor.lin(descriptor);
```

Takes color descriptor object as only parameter:
| **Property**  | **Type**   | **Default value**           | **Notes**                                      |
|---------------|------------|-----------------------------|------------------------------------------------|
| `red`         | `number`   |                             | Red value in 0...1 range                       |
| `green`       | `number`   |                             | Green value in 0...1 range                     |
| `blue`        | `number`   |                             | Blue value in 0...1 range                      |
| `alpha`       | `number`   | 1                           | Alpha value in 0...1 range                     |

Returns sRGBColor instance or undefined if parameters are given incorrectly.

***

#### `static sRGBColor.linArray()`

Creates instanse of sRGBColor with provided linear values of red, green, blue components and alpha values in array

```js
sRGBColor.linArray(linaArray);
```

Takes array in [lin-red, lin-green, lin-blue, alpha] format. If no alpha value provided, it defaults to 1. Returns sRGBColor instance or undefined if parameters are given incorrectly.

### `color()`



