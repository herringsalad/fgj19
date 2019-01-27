import {
  Cell,
  ICellArgs,
  ITileMapArgs,
  SpriteSheet,
  TileMap,
  TileSprite,
  Vector
} from 'excalibur';
import { getTiles } from './tilebuilder';
import * as generators from './generators';
import { Game } from '.';

export class CheeseCell extends Cell {
  public hp: number;
  public moldiness: number;
  dataX: number;
  dataY: number;
  tileX: number;
  tileY: number;
  game: Game;

  constructor(game: Game, config: ICellArgs, x: number, y: number, hp = 100) {
    super({ sprites: [], ...config });
    this.game = game;
    this.hp = hp;
    this.moldiness = 0;
    this.tileX = x;
    this.tileY = y;
    this.dataX = Math.floor(x / 2);
    this.dataY = Math.floor(y / 2);
  }

  consume(delta: number) {
    if (this.solid) {
      this.hp -= delta / 20;
      this.game.addScore(Math.round(delta / 10));

      if (this.hp <= 0) {
        this.game.tileMap.eatCheese(this);
      }
    }
  }

  mold(delta: number) {
    const prev = this.moldiness;
    this.moldiness += delta / 50;
    if (this.moldiness > 50 && prev < 50) {
      this.game.tileMap.moldCheese(this);
    }
    if (this.moldiness > 100 && prev < 100) {
      this.game.tileMap.moldCheese(this);
    }
  }
}

export class CheeseMap extends TileMap {
  public data: CheeseCell[] = [];
  config: ITileMapArgs;
  fgTiles: number[][];
  bgTiles: number[][];
  moldTiles: number[][];
  semimoldTiles: number[][];
  mapdata: boolean[][];
  moldData: boolean[][];
  semimoldData: boolean[][];
  background: boolean[][];
  game: Game;

  constructor(game: Game, config: ITileMapArgs) {
    super(config);

    this.game = game;
    const fgTilesheet = new SpriteSheet(game.assets.fgTilefile, 5, 3, 32, 32);
    this.registerSpriteSheet('default', fgTilesheet);
    const bgTilesheet = new SpriteSheet(game.assets.bgTilefile, 5, 3, 32, 32);
    this.registerSpriteSheet('background', bgTilesheet);
    const moldTilesheet = new SpriteSheet(
      game.assets.moldTilefile,
      5,
      3,
      32,
      32
    );
    this.registerSpriteSheet('mold', moldTilesheet);
    const semimoldTilesheet = new SpriteSheet(
      game.assets.semimoldTilefile,
      5,
      3,
      32,
      32
    );
    this.registerSpriteSheet('semimold', semimoldTilesheet);

    const cheeseCenter = new Vector(
      Math.floor(config.rows / 4),
      Math.floor(config.cols / 4)
    );

    [this.mapdata, this.background] = generators.perlinCircle(
      config.rows / 2,
      config.cols / 2,
      cheeseCenter
    );
    //[this.mapdata, this.background] = generators.prim(config.rows/2, config.cols/2, cheeseCenter);
    this.moldData = [];
    this.semimoldData = [];

    for (let col = 0; col < config.cols / 2; col++) {
      this.moldData[col] = [];
      this.semimoldData[col] = [];
      for (let row = 0; row < config.rows / 2; row++) {
        this.moldData[col][row] = false;
        this.semimoldData[col][row] = false;
      }
    }

    this.fgTiles = getTiles(this.mapdata);
    this.bgTiles = getTiles(this.background);
    this.moldTiles = getTiles(this.moldData);
    this.semimoldTiles = getTiles(this.moldData);

    this.config = config;
    this.data = new Array<CheeseCell>(config.rows * config.cols);
    for (let i = 0; i < config.cols; i++) {
      for (let j = 0; j < config.rows; j++) {
        (() => {
          let cd = new CheeseCell(
            game,
            {
              x: i * config.cellWidth + config.x,
              y: j * config.cellHeight + config.y,
              width: config.cellWidth,
              height: config.cellHeight,
              index: i + j * config.cols
            },
            i,
            j,
            this.mapdata[Math.floor(j / 2)][Math.floor(i / 2)] ? 100 : 0
          );
          this.data[i + j * config.cols] = cd;
        })();
      }
    }

    this.data.forEach(this.drawCell);
  }

  drawCell = (cell: CheeseCell) => {
    const y = cell.tileY;
    const x = cell.tileX;
    cell.solid = this.mapdata[cell.dataY][cell.dataX];
    cell.pushSprite(new TileSprite('background', this.bgTiles[y][x]));
    cell.pushSprite(new TileSprite('default', this.fgTiles[y][x]));
    cell.pushSprite(new TileSprite('semimold', this.semimoldTiles[y][x]));
    cell.pushSprite(new TileSprite('mold', this.moldTiles[y][x]));
  };

  deleteCheese = (cell: CheeseCell) => {
    const y = cell.dataY;
    const x = cell.dataX;
    cell.solid = false;
    cell.hp = 0;
    this.mapdata[y][x] = false;
    this.fgTiles = getTiles(this.mapdata);
    this.data.forEach(cell => cell.clearSprites());
    this.data.forEach(this.drawCell);
  };

  eatCheese = (cell: CheeseCell) => {
    this.deleteCheese(cell);
    this.game.particleEmitter.clearParticles();
    setTimeout(() => this.game.particleEmitter.clearParticles(), 10);
  };

  moldCheese = (cell: CheeseCell) => {
    const y = cell.dataY;
    const x = cell.dataX;
    if (this.semimoldData[y][x]) {
      this.moldData[y][x] = true;
    } else {
      this.semimoldData[y][x] = true;
    }
    this.moldTiles = getTiles(this.moldData);
    this.semimoldTiles = getTiles(this.semimoldData);
    this.data.forEach(cell => cell.clearSprites());
    this.data.forEach(this.drawCell);
  };

  cheeseAt = (x: number, y: number): CheeseCell | undefined => {
    const cell: CheeseCell = this.getCellByPoint(x, y) as CheeseCell;

    return this.data[cell.dataY * 2 * this.cols + cell.dataX * 2];
  };

  findCheese = (pos: Vector, maxMold: number): CheeseCell | undefined => {
    let best_pos = new Vector(1 / 0, 1 / 0).magnitude();
    let max_pos = new Vector(1 / 0, 1 / 0).magnitude();
    let targetCheese: CheeseCell | undefined = undefined;
    this.data.forEach(cheese => {
      const distance = new Vector(cheese.x + 8, cheese.y + 8);
      distance.subEqual(pos);
      if (
        cheese.index % 2 == 0 &&
        Math.floor(cheese.index / this.config.cols) % 2 == 0 &&
        cheese.solid &&
        cheese.moldiness < maxMold
      ) {
        let dist = distance.magnitude();
        let delta = dist - max_pos;
        if (delta < 0) {
          max_pos = distance.magnitude();
          best_pos = distance.magnitude();
          targetCheese = cheese;
        } else if (dist - best_pos < 20 && Math.random() > 0.5) {
          max_pos = distance.magnitude();
          targetCheese = cheese;
        }
      }
    });
    return targetCheese;
  };

  hasCheese = () => {
    return this.data.some(
      cheese =>
        cheese.index % 2 == 0 &&
        Math.floor(cheese.index / this.config.cols) % 2 == 0 &&
        cheese.solid &&
        cheese.moldiness < 100
    );
  };
}

export class CheeseTileSprite extends TileSprite {
  constructor(spriteSheetKey: string, spriteId: number) {
    super(spriteSheetKey, spriteId);
  }
}
