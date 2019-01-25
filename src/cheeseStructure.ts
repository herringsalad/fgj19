import {Actor, Vector, Color, Texture, Sprite, TileMap} from "excalibur";

const cheeseTexture = new Texture('assets/cheese.png');

function lerp(a: number, b: number, weight: number) {
  `
  Linearly interpolates between a and b. Weight should be between 0 and 1.
  `
  return (1.0 - weight)*a + weight*b;
}

function rand2d(p: Vector): number {
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

  let a = rand2d(p.add(new Vector(0,0)));
  let b = rand2d(p.add(new Vector(1,0)));
  let c = rand2d(p.add(new Vector(0,1)));
  let d = rand2d(p.add(new Vector(1,1)));

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
