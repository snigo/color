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
* [sRGBColor](#srgbcolor)
  * [sRGBColor.rgb()](#static-srgbcolorrgb)
  * [sRGBColor.rgbArray()](#static-srgbcolorrgbarray)
  * [sRGBColor.hsl()](#static-srgbcolorhsl)
  * [sRGBColor.hslArray()](#static-srgbcolorhslarray)
  * [sRGBColor.hwb()](#static-srgbcolorhwb)
  * [sRGBColor.hwbArray()](#static-srgbcolorhwbarray)
  * [sRGBColor.lin()](#static-srgbcolorlin)
  * [sRGBColor.linArray()](#static-srgbcolorlinarray)
  * [sRGBColor.name](#srgbcolorname)
  * [sRGBColor.red](#srgbcolorred)
  * [sRGBColor.green](#srgbcolorgreen)
  * [sRGBColor.blue](#srgbcolorblue)
  * [sRGBColor.hue](#srgbcolorhue)
  * [sRGBColor.hrad](#srgbcolorhrad)
  * [sRGBColor.hgrad](#srgbcolorhgrad)
  * [sRGBColor.hturn](#srgbcolorhturn)
  * [sRGBColor.saturation](#srgbcolorsaturation)
  * [sRGBColor.lightness](#srgbcolorlightness)
  * [sRGBColor.alpha](#srgbcoloralpha)
  * [sRGBColor.luminance](#srgbcolorluminance)
  * [sRGBColor.mode](#srgbcolormode)
  * [sRGBColor.whitepoint](#srgbcolorwhitepoint)
  
* [color()](#color-1)

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

***

#### `sRGBColor.name`

Returns color name if color is one of CSS-supported [named colors](https://www.w3.org/TR/css-color-4/#named-colors). If color is semi-transparent (has alpha value less than 1) color name is concatenated with `*`.

```js

const crimson = sRGBColor.rgbArray([220, 20 ,60]);
crimson.name; // "crimson"

const semiBlack = sRGBColor.rgbArray([0, 0, 0, 0.4]);
semiBlack.name; // "black*"

```

***

#### `sRGBColor.red`
#### `sRGBColor.green`
#### `sRGBColor.blue`

Return red, green and blue values of the color identifying a point in the sRGB color space. Output is a number in [0...255] range:

```js

import { color } from 'snigos/color';


// Color input is case-insensitive
const white = color('WhItE');
white.red; // 255
white.green; // 255
white.blue; // 255

const royalblue = color('#4169E1');
royalblue.red; // 65
royalblue.green; // 105
royalblue.blue; // 225

```

***

#### `sRGBColor.hue`
#### `sRGBColor.hrad`
#### `sRGBColor.hgrad`
#### `sRGBColor.hturn`

Returns the hue angle of the color on the color wheel in degrees (`hue`), radians (`hrad`), gradients (`hgrad`) and turns or cycles (`hturn`) respectively. 0 degrees is referred to red color.

```js

import { color } from 'snigos/color';

const darkgreen = color('hsl(120deg 100% 25%)');
darkgreen.hue; // 120
darkmagenta.hrad; // 2.0944
darkmagenta.hgrad; // 133.3333
darkmagenta.hturn; // 0.3333

const darkmagenta = color('hsla(-0.125turn, 65%, 35%)');
darkmagenta.hue; // 315
darkmagenta.hrad; // 5.4978
darkmagenta.hgrad; // 350
darkmagenta.hturn; // 0.875


```

***


#### `sRGBColor.saturation`

Returns the color saturation value of HSL representation **as number**. Number in [0...1] range, where 0 is completely desaturated color and 1 - fully saturated color.

```js

import { color } from 'snigos/color';

const gold = color('#fc9');
gold.saturation; // 1
gold.toHslString(); // "hsl(30 100% 80%)"

const slateGray = color('slategray');
slateGray.saturation; // 0.13

```

***

#### `sRGBColor.lightness`

Returns the color lightness value of HSL representation **as number**. Number in [0...1] range, where 0 is completely dark color (black) and 1 - fully light color (white).

```js

import { color } from 'snigos/color';

const deepSkyBlue = color('rgb(0 191 255)');
deepSkyBlue.lightness; // 0.5
deepSkyBlue.toHslString(); // "hsl(195 100% 50%)"

const textColor = color('#2a2e2f');
textColor.lightness; // 0.17


```

***

#### `sRGBColor.alpha`

Returns the value of the alpha-channel of the color. Number in [0...1] range, where 0 is completely transparent and 1 - has full opacity.

```js

import { color } from 'snigos/color';

const blue = color('#23f');
blue.alpha; // 1

const semiTransparent = color('#23f4');
semiTransparent.alpha; // 0.2667

const transparent = color('transparent');
transparent.alpha; // 0

```

***

#### `sRGBColor.luminance`

Returns relative luminance of the color of any point in a colorspace, normalized to 0 for darkest black and 1 for lightest white. Number in [0...1] range. Relative luminance is used for calculating color contrast.

```js

import { color, contrast } from 'snigos/color';

const royalblue = color('#4169e1');
royalblue.luminance; // 0.1666104

const violet = color('violet');
violet.luminance; // 0.4031848

// Calculate contrast ratio
(violet.luminance + 0.05) / (royalblue.luminance + 0.05); // 2.0921654731259443
contrast(royalblue, violet); // 2.09

```

***

#### `sRGBColor.hueGroup`
#### `sRGBColor.hueGroupOffset`

Returns index of the color group of the color's hue on color wheel. Color groups:
| **hueGroup index** | **Group name**  | **Hue range** |
|--------------------|-----------------|---------------|
| 0                  | Red-Violet      | 315 ... 344   |
| 1                  | Red             | 345 ... 14    |
| 2                  | Orange          | 15 ... 44     |
| 3                  | Yellow          | 45 ... 74     |
| 4                  | Yellow-Green    | 75 ... 104    |
| 5                  | Green           | 105 ... 134   |
| 6                  | Green-Cyan      | 135 ... 164   |
| 7                  | Cyan            | 165 ... 194   |
| 8                  | Blue-Cyan       | 195 ... 224   |
| 9                  | Blue            | 225 ... 254   |
| 10                 | Blue-Violet     | 255 ... 284   |
| 11                 | Violet          | 285 ... 314   |

Property `Color.hueGroupOffset` returns hue offset within color's group. Number in [0...29] range.

```js

import { color } from 'snigos/color';

const fire = color('#fd4523');
fire.hue; // 9
fire.hueGroup; // 0
fire.hueGroupOffset; // 24

const coolNavy = color('rgb(60, 20, 220)');
coolNavy.hue; // 252
coolNavy.hueGroup; // 8
coolNavy.hueGroupOffset; // 27

```

Even though color warmth is hugely subjective, you can can presume color groups 0 - 5 as warm colors and 6 - 11 as cool, that's actually the main reason why group indexation shifted back.

**NOTE:** The central color of each group will have `Color.hueGroupOffset` equal to 15, not 0.


***

#### `sRGBColor.mode`

Returns mode of the color, `0` is color is light and `1` if color is dark. Useful to determine font color for certain background. It is **guaranteed** that 'black' color will always have sufficient contrast with any colors of mode "0" and otherwise 'white' color will have sufficient contrast with colors of mode "1".

```js

import { color } from 'snigos/color';

const backgroundColor = color('#2980B9');
const textColor = color(backgroundColor.mode ? 'white' : 'black');

backgroundColor.mode; // 1
textColor.mode; // 0

```

***

#### `sRGBColor.whitePoint`

Returns array of XYZ tristimulus values of CIE standard illuminant of current color. Defaults to `XYZColor.D65`: https://en.wikipedia.org/wiki/Illuminant_D65 for sRGBColor

***

#### `sRGBColor.prototype.copyWith()`

Copies color instance with provided parameters and returns new sRGBColor instance. Accepted parameters: `red`, `green`, `blue`, `hue`, `saturation`, `lightness`, `alpha`. Note: red, green and blue parameters have priority over hue, saturation and lightness, meaning if you use red and hue value at the same time, the latter will be ignored.

```js

import { color } from '@snigos/color';

const maroon = color('maroon');
const lightMaroon = maroon.copyWith({ lightness: maroon.lightness + 0.2 });

maroon.lightness; // 0.25
lightMaroon.lightness; // 0.45

```

***

#### `sRGBColor.prototype.withAlpha()`

Copies color instance with provided alpha value. Shortcut method for `.copyWith({ alpha: value })`.

```js

import { color } from '@snigos/color';

const lipsRed = color('#fa3c24');
const lipsRed24 = lipsRed.withAlpha(0.24);

lipsRed24.alpha; // 0.24
lipsRed24.toHexString(); // #fa3c243d

```

***

#### `sRGBColor.prototype.invert()`

Inverts color. Returns new instance of Color representing inverted color.

```js

import { color } from '@snigos/color';

const invertedPink = color('pink').invert();
invertedPink.toRgbString(); // rgb(0 63 52)

invertedPink.invert().name; // pink

```

***

#### `sRGBColor.prototype.toLin()`

Returns array of linear (gamma decoded) values of red, green and blue.

```js

import { color } from '@snigos/color';

const green = color('forestgreen');
green.toLin(); // [0.0159963, 0.2581829, 0.0159963]

```

**NOTE**: Return value doesn't include alpha value

***

#### `sRGBColor.prototype.toHwb()`

Returns array of hue, whiteness and blackness values of the according [HWB color model](https://en.wikipedia.org/wiki/HWB_color_model), as well as alpha channel value.

```js

import { color } from '@snigos/color';

const cyan = color('cyan');
cyan.toHwb(); // [180, 0, 0, 1]
cyan.toHwbString(); // hwb(180deg 0% 0%)

```

***

#### `sRGBColor.prototype.toLab()`

Returns new LabColor instance of the color representing the color in CIELab Color space.

```js

import { color, sRGBColor, LabColor } from '@snigos/color';

const purpleBlue = color('hwb(264 13% 0%)');
const purpleBlueLab = purpleBlue.toLab();

purpleBlueLab instanceof sRGBColor; // false
purpleBlueLab instanceof LabColor; // true
purpleBlueLab.toLabString(); // lab(30.998% 65.18 -90.771)
purpleBlueLab.toLchString(); // lch(30.998% 111.749 305.681deg)

```

***

#### `sRGBColor.prototype.toXyz(whitePoint)`

Returns new XYZColor instance of the color representing the color in CIEXYZ Color space. Takes optional whitepoint argument, array of XYZ tristimulus values of CIE standard illuminant, either XYZColor.D50 or XYZColor.D65, if no value provided, default sRGBColor.whitePoint is used.

```js

import { color, sRGBColor, XYZColor } from '@snigos/color';

const bikingRed = color('#77212E');
const bikingRedXyz = purpleBlue.toXyz();

bikingRedXyz instanceof sRGBColor; // false
bikingRedXyz instanceof XYZColor; // true
bikingRedXyz.x; // 0.1730064
bikingRedXyz.y; // 0.0739667
bikingRedXyz.z; // 0.6960912

bikingRed.whitePoint; // [0.9505, 1, 1.089]
bikingRedXyz.whitePoint; // [0.9505, 1, 1.089]

```

***

#### `sRGBColor.prototype.toGrayscale()`

Returns new grayscale color - shade of gray with the same intensity as initial color.

```js

import { color } from '@snigos/color';

const green = color('green');
const gray = green.toGrayscale();

gray.saturation; // 0
gray.toRgbString('relative'); // rgb(42.7% 42.7% 42.7%)

```

**NOTE:** grayscale conversion is not the same as desaturation!
![Grayscale Demo](/__screenshots__/to-grayscale-demo.jpg)

**NOTE:** because of the nature of Lab color space (separating lightness from chromacity), converting to LabColor before converting to grayscale will generally give you result with greater precision:

```js

import { color } from '@snigos/color';

const green = color('green');
const gray = green.toGrayscale();
const grayLab = green.toLab().toGrayscale();

green.luminance; // 0.1543731
gray.luminance; // 0.1529262
grayLab.luminance; // 0.1547457

```

### `color()`



