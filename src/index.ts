import * as ex from 'excalibur';
import { Color, Vector } from 'excalibur';
import { Mold } from './mold';
import { Player } from './player';
import { TileMapCollisionDetection } from 'excalibur/dist/Traits/Index';

const width = 800;
const height = 600;

const game = new ex.Engine({ width, height });

for (let i = 0; i < Math.max(width / 64, height / 64); i++) {
  const col = new ex.Actor(i * 64, 0, 1, height * 2, Color.White);
  game.add(col);
  const row = new ex.Actor(0, i * 64, width * 2, 1, Color.White);
  game.add(row);
}

game.add(new Mold(new Vector(500, 500)));
game.add(new Mold(new Vector(400, 600)));

const tileSheet = new ex.Texture('/assets/cheese.png');
const mouseTexture = new ex.Texture('/assets/mouse.png');
const loader = new ex.Loader([tileSheet, mouseTexture]);
const tileMapCollision = new TileMapCollisionDetection();

const tm = new ex.TileMap({
  x: 0,
  y: 0,
  cellWidth: 64,
  cellHeight: 64,
  rows: 12,
  cols: 12
});
let spriteTiles = new ex.SpriteSheet(tileSheet, 1, 1, 64, 64);
tm.registerSpriteSheet('default', spriteTiles);
tm.data.forEach((cell: ex.Cell) => {
  if (Math.random() > 0.5) {
    cell.solid = true;
    cell.pushSprite(new ex.TileSprite('default', 0));
  }
});

const rectangle = new ex.Actor(150, game.drawHeight - 40, 200, 20);
rectangle.color = ex.Color.Yellow;
rectangle.collisionType = ex.CollisionType.Fixed;

game.input.pointers.primary.on('move', evt => {
  rectangle.pos.x = (evt as any).worldPos.x;
});

game.start(loader).then(() => {
  game.add(tm);

  const player = new Player(new Vector(100, 100), mouseTexture);

  game.add(player);
});
