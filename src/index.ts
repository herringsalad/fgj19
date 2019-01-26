import * as ex from 'excalibur';
import {Cell, EventTypes, Vector} from 'excalibur';
import {Mold} from './mold';
import {Player} from './player';
import {TileMapCollisionDetection} from 'excalibur/dist/Traits/Index';
import * as cheeseStructure from './cheeseBuilder';
import {getTiles} from './tilebuilder';
import {CheeseCell, CheeseMap} from './cheeseBlocks';

const width = 1280;
const height = 1080;

const game = new ex.Engine({width, height});

const findCheese = (mold: Mold) => {
  return tm.findCheese(mold.pos);
};

const newMold = () => {
  const rand = Math.random();
  let pos: Vector;
  if (rand < 0.25) {
    pos = new Vector(-width / 2, Math.random() * height);
  } else if (rand < 0.5) {
    pos = new Vector(width * 1.5, Math.random() * height);
  } else if (rand < 0.75) {
    pos = new Vector(Math.random() * width, -height / 2);
  } else {
    pos = new Vector(Math.random() * width, height * 1.5);
  }
  game.add(new Mold(pos, findCheese, Math.random() * 10 + 50));
};

function drawCell(cell: CheeseCell) {
  const y = Math.floor(cell.index / fgTiles.length);
  const x = cell.index % fgTiles.length;
  cell.solid = fgTiles[y][x] != 6;
  cell.pushSprite(new ex.TileSprite('background', bgTiles[y][x]));
  cell.pushSprite(new ex.TileSprite('default', fgTiles[y][x]));
}

const eatCheese = (cell: CheeseCell) => {
  const y = cell.dataY;
  const x = cell.dataX;
  cell.solid = false;
  mapdata[y][x] = false;
  fgTiles = getTiles(mapdata);
  tm.data.forEach(cell => cell.clearSprites());
  tm.data.forEach(drawCell);
};

let timer = 0;

game.on(EventTypes.PostUpdate, event => {
  timer += event.delta;
  if (timer > 2000 && tm.hasCheese()) {
    timer = 0;
    newMold();
  }
});

const fgTilefile = new ex.Texture('/assets/Kolo tiles.png');
const bgTilefile = new ex.Texture('/assets/Tausta tiles.png');
const mouseTexture = new ex.Texture('/assets/mouse.png');
const loader = new ex.Loader([fgTilefile, bgTilefile, mouseTexture]);
const tileMapCollision = new TileMapCollisionDetection();
const rows = 40;
const cols = 40;

const cheeseCenter = new Vector(Math.floor(rows / 2), Math.floor(cols / 2));
const cheeseMaxRadius = 5;
const maxDistance = new Vector(cheeseMaxRadius, cheeseMaxRadius).magnitude();

const tm = new CheeseMap({
  x: 0,
  y: 0,
  cellWidth: 32,
  cellHeight: 32,
  rows: rows * 2,
  cols: cols * 2
}, eatCheese);

const mapdata: boolean[][] = [];
const background: boolean[][] = [];
for (let col = 0; col < cols; col++) {
  mapdata[col] = [];
  background[col] = [];
  for (let row = 0; row < cols; row++) {
    const distance = cheeseCenter.sub(new Vector(row, col)).magnitude() > maxDistance ? 1 : 0;
    mapdata[col][row] = cheeseStructure
      .perlin(new Vector(row * 2, col * 2)
        .scale(1 / 64)) - distance > 0.5;
    background[col][row] = !distance;
  }
}

let fgTiles = getTiles(mapdata);
let bgTiles = getTiles(background);

let fgTilesheet = new ex.SpriteSheet(fgTilefile, 5, 3, 32, 32);
tm.registerSpriteSheet('default', fgTilesheet);
let bgTilesheet = new ex.SpriteSheet(bgTilefile, 5, 3, 32, 32);
tm.registerSpriteSheet('background', bgTilesheet);

tm.data.forEach(drawCell);


game.start(loader).then(() => {
  game.add(tm);

  const player = new Player(new Vector(300, 300), mouseTexture, eatCheese);
  game.currentScene.camera.strategy.lockToActor(player);

  game.add(player);
});
