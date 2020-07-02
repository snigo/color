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

```