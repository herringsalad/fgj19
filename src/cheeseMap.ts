import {
  Cell,
  ICellArgs,
  ITileMapArgs,
  TileMap,
  TileSprite,
  Vector,
  SpriteSheet
} from 'excalibur';
import { getTiles } from './tilebuilder';
import * as cheeseStructure from './cheeseBuilder';
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

  consume(biteSize: number) {
    this.hp -= biteSize;
    this.game.addScore(biteSize);

    if (this.hp < 0) {
      this.game.tileMap.eatCheese(this);
    }
  }
  mold() {
    this.moldiness += 1;
    if (this.moldiness == 50) {
      this.game.tileMap.moldCheese(this);
    }
    if (this.moldiness == 100) {
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

  constructor(game: Game, config: ITileMapArgs) {
    super(config);

    this.drawCell = this.drawCell.bind(this);

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
      engine.assets.semimoldTilefile,
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
    const cheeseMaxRadius = 5;
    const maxDistance = new Vector(
      cheeseMaxRadius,
      cheeseMaxRadius
    ).magnitude();

    this.mapdata = [];
    this.moldData = [];
    this.semimoldData = [];
    this.background = [];

    for (let col = 0; col < config.cols / 2; col++) {
      this.mapdata[col] = [];
      this.moldData[col] = [];
      this.semimoldData[col] = [];
      this.background[col] = [];
      for (let row = 0; row < config.cols / 2; row++) {
        const distance =
          cheeseCenter.sub(new Vector(row, col)).magnitude() > maxDistance
            ? 1
            : 0;
        this.mapdata[col][row] =
          cheeseStructure.perlin(new Vector(row, col).scale(1 / 64)) -
            distance >
          0.5;
        this.background[col][row] = !distance;
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
            100
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
    //console.log(this.moldTiles[y][x])
    cell.pushSprite(new TileSprite('background', this.bgTiles[y][x]));
    cell.pushSprite(new TileSprite('default', this.fgTiles[y][x]));
    cell.pushSprite(new TileSprite('semimold', this.semimoldTiles[y][x]));
    cell.pushSprite(new TileSprite('mold', this.moldTiles[y][x]));
  };

  eatCheese = (cell: CheeseCell) => {
    const y = cell.dataY;
    const x = cell.dataX;
    cell.solid = false;
    this.mapdata[y][x] = false;
    this.fgTiles = getTiles(this.mapdata);
    this.data.forEach(cell => cell.clearSprites());
    this.data.forEach(this.drawCell);
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
    const cell = this.getCellByPoint(x, y);

    if (cell) {
      return this.data[
        cell.x / cell.width + (cell.y / cell.height) * this.config.rows
      ];
    }
  };

  findCheese = (pos: Vector, maxMold: number): CheeseCell | undefined => {
    let best_pos = new Vector(1 / 0, 1 / 0).magnitude();
    let max_pos = new Vector(1 / 0, 1 / 0).magnitude();
    let targetCheese: CheeseCell | undefined = undefined;
    this.data.forEach(cheese => {
      const distance = new Vector(cheese.x + 8, cheese.y + 8);
      distance.subEqual(pos);
      if (
        cheese.index % 2 == 0
        && Math.floor(cheese.index/this.config.cols) % 2 == 0 &&
        cheese.solid &&
        cheese.moldiness < maxMold
      ) {
        let dist = distance.magnitude();
        let delta = dist - max_pos;
        if(delta < 0) {
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
    return this.data.some(cheese => cheese.solid && cheese.moldiness < 100);
  };
}

export class CheeseTileSprite extends TileSprite {
  constructor(spriteSheetKey: string, spriteId: number) {
    super(spriteSheetKey, spriteId);
  }
}
