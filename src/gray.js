import LabColor from './lab/lab.class';

export default function gray(lightness, alpha = 1) {
  return LabColor.lab({
    lightness,
    a: 0,
    b: 0,
    alpha,
  });
}
