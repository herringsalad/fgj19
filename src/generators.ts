import { Vector } from 'excalibur';
import { perlin } from './cheeseBuilder';

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

export function prim(rows: number, cols: number, center: Vector) {
  /*
  Start with a grid full of walls.
Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list.
While there are walls in the list:
Pick a random wall from the list. If only one of the two cells that the wall divides is visited, then:
Make the wall a passage and mark the unvisited cell as part of the maze.
Add the neighboring walls of the cell to the wall list.
Remove the wall from the list.
   */
  const visited: boolean[][] = [];
  const mapdata: boolean[][] = [];
  const background: boolean[][] = [];
  for (let col = 0; col < cols; col++) {
    visited[col] = [];
    mapdata[col] = [];
    background[col] = [];
    for (let row = 0; row < rows; row++) {
      visited[col][row] = false;
      mapdata[col][row] = true;
      background[col][row] = true;
    }
  }

  const queue: [number, number, number, number][] = [];

  mapdata[center.y][center.x] = false;

  const nbor = (x, y) => {
    if (x > 1) {
      queue.push([x - 2, y, x, y]);
    }
    if (y > 1) {
      queue.push([x, y - 2, x, y]);
    }
    if (x < cols - 2) {
      queue.push([x + 2, y, x, y]);
    }
    if (y < rows - 2) {
      queue.push([x, y + 2, x, y]);
    }
  };

  nbor(center.x, center.y);

  while (queue.length > 0) {
    const i = Math.floor(Math.random() * queue.length);
    const [x, y, px, py] = queue[i];
    queue.splice(i, 1);
    if (visited[y][x]) {
      continue;
    }
    visited[y][x] = true;
    mapdata[y][x] = false;
    mapdata[(y + py) / 2][(x + px) / 2] = false;
    nbor(x, y);
  }

  return [mapdata, background];
}

export function perlinCircle(
  rows: number,
  cols: number,
  center: Vector
): [boolean[][], boolean[][]] {
  const mapdata: boolean[][] = [];
  const background: boolean[][] = [];

  const maxDistance = new Vector(1, 1).scale((rows + cols) / 8).magnitude();

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
        center.sub(new Vector(row, col)).magnitude() >
        maxDistance + Math.random() * 3
          ? 1
          : 0;
      mapdata[col][row] =
        perlin(new Vector(row, col).scale(1 / 64), p) - distance > 0.58;
      background[col][row] = !distance;
    }
  }
  return [mapdata, background];
}
