import { TileMap, Cell, ICellArgs } from 'excalibur';

export class CheeseCell extends Cell {
  hp: number;

  constructor(config: ICellArgs) {
    super(config);
    this.hp = 100;
  }
}
