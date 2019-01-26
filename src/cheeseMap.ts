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
  eatCheese: (cell: Cell) => void;
  moldCheese: (cell: Cell) => void;

  constructor(
    config: ICellArgs,
    x: number,
    y: number,
    hp = 100,
    eatCheese: (cell: Cell) => void,
    moldCheese: (cell: CheeseCell) => void
  ) {
    super({ sprites: [], ...config });
    this.hp = hp;
    this.moldiness = 0;
    this.eatCheese = eatCheese;
    this.moldCheese = moldCheese;
    this.dataX = x;
    this.dataY = y;
  }

  consume(biteSize: number) {
    this.hp -= biteSize;
    if (this.hp < 0) {
      this.eatCheese(this);
    }
  }
  mold() {
    this.moldiness += 1;
    if (this.moldiness == 100) {
      this.moldCheese(this);
    }
  }
}

export class CheeseMap extends TileMap {
  public data: CheeseCell[] = [];
  config: ITileMapArgs;
  fgTiles: number[][];
  bgTiles: number[][];
  moldTiles: number[][];
  mapdata: boolean[][];
  moldData: boolean[][];
  background: boolean[][];

  constructor(engine: Game, config: ITileMapArgs) {
    super(config);

    const fgTilesheet = new SpriteSheet(
      engine.assets.fgTilefile,
      5,
      3,
      32,
      32
    );
    this.registerSpriteSheet('default', fgTilesheet);
    const bgTilesheet = new SpriteSheet(
      engine.assets.bgTilefile,
      5,
      3,
      32,
      32
    );
    this.registerSpriteSheet('background', bgTilesheet);
    const moldTilesheet = new SpriteSheet(
      engine.assets.moldTilefile,
      5,
      3,
      32,
      32
    );
    this.registerSpriteSheet('mold', moldTilesheet);

    const cheeseCenter = new Vector(
      Math.floor(config.rows / 2),
      Math.floor(config.cols / 2)
    );
    const cheeseMaxRadius = 5;
    const maxDistance = new Vector(
      cheeseMaxRadius,
      cheeseMaxRadius
    ).magnitude();

    this.mapdata = [];
    this.moldData = [];
    this.background = [];

    for (let col = 0; col < config.cols; col++) {
      this.mapdata[col] = [];
      this.moldData[col] = [];
      this.background[col] = [];
      for (let row = 0; row < config.cols; row++) {
        const distance =
          cheeseCenter.sub(new Vector(row, col)).magnitude() > maxDistance
            ? 1
            : 0;
        this.mapdata[col][row] =
          cheeseStructure.perlin(new Vector(row * 2, col * 2).scale(1 / 64)) -
            distance >
          0.5;
        this.background[col][row] = !distance;
        this.moldData[col][row] = false;
      }
    }

    this.fgTiles = getTiles(this.mapdata);
    this.bgTiles = getTiles(this.background);
    this.moldTiles = getTiles(this.moldData);

    this.config = config;
    this.data = new Array<CheeseCell>(config.rows * config.cols);
    for (let i = 0; i < config.cols; i++) {
      for (let j = 0; j < config.rows; j++) {
        (() => {
          let cd = new CheeseCell(
            {
              x: i * config.cellWidth + config.x,
              y: j * config.cellHeight + config.y,
              width: config.cellWidth,
              height: config.cellHeight,
              index: i + j * config.cols
            },
            Math.floor(i / 2),
            Math.floor(j / 2),
            100,
            this.eatCheese,
            this.moldCheese
          );
          this.data[i + j * config.cols] = cd;
        })();
      }
    }

    this.data.forEach(this.drawCell);
  }

  drawCell = (cell: CheeseCell) => {
    const y = Math.floor(cell.index / this.fgTiles.length);
    const x = cell.index % this.fgTiles.length;
    cell.solid = this.fgTiles[y][x] != 6;
    cell.pushSprite(new TileSprite('background', this.bgTiles[y][x]));
    cell.pushSprite(new TileSprite('default', this.fgTiles[y][x]));
    cell.pushSprite(new TileSprite('background', this.moldTiles[y][x]));
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
    this.moldData[y][x] = true;
    this.moldTiles = getTiles(this.moldData);
    this.data.forEach(cell => cell.clearSprites());
    this.data.forEach(this.drawCell);
  };

  cheeseAt = (x: number, y: number): CheeseCell | undefined => {
    const cell = this.getCellByPoint(x, y);

    if (cell) {
      return this.data[cell.y + cell.x * this.config.cols];
    }
  };

  findCheese = (pos: Vector): CheeseCell | undefined => {
    let max_pos = new Vector(1 / 0, 1 / 0);
    let targetCheese: CheeseCell | undefined = undefined;
    this.data.forEach(cheese => {
      const distance = new Vector(cheese.x + 8, cheese.y + 8);
      distance.subEqual(pos);
      if (
        cheese.solid &&
        cheese.moldiness < 100 &&
        distance.magnitude() < max_pos.magnitude()
      ) {
        max_pos = distance;
        targetCheese = cheese;
      }
    });
    return targetCheese;
  };

  hasCheese() {
    return this.data.some(cheese => cheese.solid && cheese.moldiness < 100);
  }
}

export class CheeseTileSprite extends TileSprite {
  constructor(spriteSheetKey: string, spriteId: number) {
    super(spriteSheetKey, spriteId);
  }
}
