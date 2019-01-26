import {Vector} from 'excalibur';

function pRand2d(p: Vector, x: number, y: number, z: number): number {
  `
  Pseudo random 2d noise function. Returns value between 0 and 1.
  `;
  return (Math.sin(p.dot(new Vector(x, y))) * z) % 1;
}

export function perlin(p: Vector, params: [number, number, number]) {
  let val = 0;
  let steps = 8;
  while (steps >= 1) {
    val += steps * ((1 + pRand2d(p.scale(1 / steps), params[0], params[1], params[2])) / 2);
    steps /= 2;
  }
  return val / 8 / 2;
}

