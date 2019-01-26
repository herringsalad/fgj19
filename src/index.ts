import * as ex from 'excalibur';
import { Cell, Color, Vector } from 'excalibur';
import { Mold } from './mold';
import { Player } from './player';
import { TileMapCollisionDetection } from 'excalibur/dist/Traits/Index';
import * as cheeseStructure from './cheeseBuilder';
import { getTiles } from './tilebuilder';
import { CheeseCell, CheeseMap } from './cheeseBlocks';

const width = 1280;
const height = 1080;

const game = new ex.Engine({ width, height });

for (let i = 0; i < Math.max(width / 64, height / 64); i++) {
  const col = new ex.Actor(i * 64, 0, 1, height * 2, Color.White);
  game.add(col);
  const row = new ex.Actor(0, i * 64, width * 2, 1, Color.White);
  game.add(row);
}

const findCheese = (mold: Mold) => {
  return tm.findCheese(mold.pos);
};

game.add(new Mold(new Vector(500, 500), findCheese, 5));
game.add(new Mold(new Vector(400, 600), findCheese, 5));

const tileSheet = new ex.Texture('/assets/Kolo tiles.png');
const mouseTexture = new ex.Texture('/assets/mouse.png');
const loader = new ex.Loader([tileSheet, mouseTexture]);
const tileMapCollision = new TileMapCollisionDetection();
const rows = 8;
const cols = 12;

const tm = new CheeseMap({
  x: 0,
  y: 0,
  cellWidth: 32,
  cellHeight: 32,
  rows: rows * 2,
  cols: cols * 2
});

const mapdata = [];
for (let col = 0; col < cols; col++) {
  mapdata[col] = [];
  for (let row = 0; row < cols; row++) {
    mapdata[col][row] =
      cheeseStructure.perlin(new Vector(row * 2, col * 2).scale(1 / 64)) > 0.6;
  }
}

let tiles = getTiles(mapdata);

function drawCell(cell: CheeseCell) {
  const y = Math.floor(cell.index / tiles.length);
  const x = cell.index % tiles.length;
  cell.solid = tiles[y][x] != 6;
  cell.pushSprite(new ex.TileSprite('default', tiles[y][x]));
}

let spriteTiles = new ex.SpriteSheet(tileSheet, 5, 3, 32, 32);
tm.registerSpriteSheet('default', spriteTiles);
tm.data.forEach(drawCell);

const eatCheese = (cell: Cell) => {
  const y = Math.floor(cell.index / 2 / tiles.length);
  const x = Math.floor(cell.index / 2) % tiles.length;
  mapdata[y][x] = 0;
  tiles = getTiles(mapdata);
  tm.data.forEach(cell => cell.clearSprites());
  tm.data.forEach(drawCell);
};

game.start(loader).then(() => {
  game.add(tm);

  const player = new Player(new Vector(300, 300), mouseTexture, eatCheese);
  game.currentScene.camera.strategy.lockToActor(player);

  game.add(player);
});
