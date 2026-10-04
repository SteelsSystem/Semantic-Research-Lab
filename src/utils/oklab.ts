/**
 * Perceptual Colorimetry & Affective Chromatic Synthesis in OKLab / OKLCh Space
 *
 * Implements the exact affine transformations separated by cubic non-linearity
 * simulating human LMS cone response as defined in the technical specification.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface OKLab {
  L: number;
  a: number;
  b: number;
}

export interface OKLCh {
  L: number;
  C: number;
  h: number; // degrees 0 - 360
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const clamped = Math.max(0, Math.min(1, c));
  return clamped <= 0.0031308
    ? 12.92 * clamped
    : 1.055 * Math.pow(clamped, 1.0 / 2.4) - 0.055;
}

export function linearRgbToOklab(rLin: number, gLin: number, bLin: number): OKLab {
  const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin;
  const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin;
  const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

export function oklabToLinearRgb(L: number, a: number, b: number): RGB {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  };
}

export function oklabToHex(L: number, a: number, b: number): string {
  const lin = oklabToLinearRgb(L, a, b);
  const r = Math.round(linearToSrgb(lin.r) * 255);
  const g = Math.round(linearToSrgb(lin.g) * 255);
  const bl = Math.round(linearToSrgb(lin.b) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

export function oklabToOklch(L: number, a: number, b: number): OKLCh {
  const C = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
}

export function interpolateOklab(c1: OKLab, c2: OKLab, t: number): OKLab {
  const clamped = Math.max(0, Math.min(1, t));
  return {
    L: (1 - clamped) * c1.L + clamped * c2.L,
    a: (1 - clamped) * c1.a + clamped * c2.a,
    b: (1 - clamped) * c1.b + clamped * c2.b,
  };
}
