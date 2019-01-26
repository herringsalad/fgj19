import {
  Cell, ICellArgs,
  TileMap, ITileMapArgs,
  TileSprite, Vector
} from 'excalibur';

export class CheeseCell extends Cell {
  public hp: number;
  
  constructor(config: ICellArgs, hp = 100) {
    super({sprites: [], ...config});
    this.hp = hp;
  }

  consume(biteSize: number) {
    this.hp -= biteSize;
  }
}

export class CheeseMap extends TileMap {
  public data: CheeseCell[] = []

  constructor(config: ITileMapArgs) {
    super(config);
    console.log(this);

    this.data = new Array<CheeseCell>(config.rows * config.cols);
    for (let i = 0; i < config.cols; i++) {
      for (let j = 0; j < config.rows; j++) {
        (() => {
          let cd = new CheeseCell({
            x: i * config.cellWidth + config.x, 
            y: j * config.cellHeight + config.y,
            width: config.cellWidth,
            height: config.cellHeight,
            index: i + j * config.cols});
          this.data[i + j * config.cols] = cd;
        })();
      }
    }
  }

  findCheese(pos: Vector) {
    let max_pos = new Vector(1/0, 1/0);
    let targetCheese: CheeseCell = undefined;
    this.data.forEach(cheese => {
      const distance = new Vector(cheese.x, cheese.y);
      distance.subEqual(pos);
      if (cheese.solid && distance.magnitude() < max_pos.magnitude()) {
        max_pos = distance;
        targetCheese = cheese;
      }
    });
    return targetCheese;
  }
}

export class CheeseTileSprite extends TileSprite {
  constructor(spriteSheetKey: string, spriteId: number) {
    super(spriteSheetKey, spriteId);
  }
}
