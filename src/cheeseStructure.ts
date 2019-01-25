import {Actor, Vector, Color, Texture, Sprite, TileMap} from "excalibur";

const cheeseTexture = new Texture('assets/cheese.png');

function lerp(a: number, b: number, steps: number) {
  `
  Linearly interpolates between a and b. Weight should be between 0 and 1.
  `
  return (1.0 - steps)*a + steps*b;
}

function clamp(xmin: number, xmax: number, x: number) {
  `
  The clamp function returns x if it is larger than minVal and smaller than maxVal. In case x is smaller than minVal, minVal is returned. If x is larger than maxVal, maxVal is returned. 
  `
  if (x > xmax) {
    return xmax;
  }
  if (x < xmin) {
    return xmin;
  }
  return x;
}

function step(edge: number, x: number) {
  if (x > edge) {
    return 1.;
  }
  return 0.;
}

function pRand2d(p: Vector): number {
  `
  Pseudo random 2d noise function. Returns value between 0 and 1.
  `
  return (Math.sin(p.dot(new Vector(12.9898, 4.1414))) * 43758.5453) % 1;
}

var valNoise = (x) => x*x*x*(x*(x*6-15)+10);

export function noise(x: Vector) {
  let p = new Vector(Math.floor(x.x), Math.floor(x.y));
  let w = new Vector(x.x % 1, x.y % 1);

  let u = new Vector(valNoise(w.x), valNoise(w.y));

  let a = pRand2d(p.add(new Vector(0,0)));
  let b = pRand2d(p.add(new Vector(1,0)));
  let c = pRand2d(p.add(new Vector(0,1)));
  let d = pRand2d(p.add(new Vector(1,1)));

  return 2 * (a + (b - a) * u.x + (c - a) * u.y + d * u.x*u.y);
}

export function round(p: Vector, center: Vector, r: number) {
  `
  function to generate a circle with radius r around center.
  `
  if (p.distance(center) < r) {
    return 1.;
  }
  return 0.;
}

export function square(p: Vector, center: Vector, a: number) {
  `
  function to generate a square with the side length a, centered on center.
  `
  if (Math.abs(p.x - center.x) < a / 2 && Math.abs(p.y - center.y) < a / 2) {
    return 1.;
  }
  return 0.;
}

export function perlin(p: Vector, size = 8) {
  let val = 0.;
  let steps = size;
  while (steps >= 1.) {
    val += steps * ((1 + pRand2d(p.scale(1/steps))) / 2);
    steps /= 2;
  }
  return val / size / 2;
}

export function centeredPerlin(p: Vector, center: Vector, r: number) {
  return (step(.24, perlin(p)) * round(p,center,r));
}