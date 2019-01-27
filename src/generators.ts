import {Vector} from "excalibur";
import {perlin} from "./cheeseBuilder";

//for (let col = 0; col < config.cols / 2 + 1; col++) {
//  mapmask[col] = [];
//  for (let row = 0; row < config.cols / 2 + 1; row++) {
//    mapmask[col][row] = false;
//  }
//}
//for (let col = 0; col < config.cols / 2 + 1; col++) {
//  for (let row = 0; row < config.cols / 2 + 1; row++) {
//    mapmask[col][row] =
//  }
//}

export function perlinCircle(rows: number, cols: number, center: Vector): [boolean[][], boolean[][]] {
  const mapdata: boolean[][] = [];
  const background: boolean[][] = [];

  const maxDistance = new Vector(1,1).scale((rows+cols)/6).magnitude();

  const p: [number, number, number] = [
    Math.random() * 15,
    Math.random() * 15,
    Math.random() * 10000
  ];

  for (let col = 0; col < cols; col++) {
    mapdata[col] = [];
    background[col] = [];
    for (let row = 0; row < rows; row++) {
      const distance =
        center.sub(new Vector(row, col)).magnitude() > maxDistance
          ? 1
          : 0;
      mapdata[col][row] = perlin(new Vector(row, col).scale(1 / 64), p) - distance > 0.58;
      background[col][row] = !distance;
    }
  }
  return [mapdata, background];
}
