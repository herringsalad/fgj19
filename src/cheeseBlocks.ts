import {
  Cell,
  ICellArgs,
  ITileMapArgs,
  TileMap,
  TileSprite,
  Vector
} from 'excalibur';

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

  constructor(
    config: ITileMapArgs,
    eatCheese: (cell: Cell) => void,
    moldCheese: (cell: CheeseCell) => void
  ) {
    super(config);

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
            eatCheese,
            moldCheese
          );
          this.data[i + j * config.cols] = cd;
        })();
      }
    }
  }

  findCheese(pos: Vector) {
    let max_pos = new Vector(1 / 0, 1 / 0);
    let targetCheese: CheeseCell = undefined;
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
  }

  hasCheese() {
    return this.data.some(cheese => cheese.solid && cheese.moldiness < 100);
  }
}

export class CheeseTileSprite extends TileSprite {
  constructor(spriteSheetKey: string, spriteId: number) {
    super(spriteSheetKey, spriteId);
  }
}
