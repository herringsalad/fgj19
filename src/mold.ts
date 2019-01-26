import { Actor, Color, Engine, Vector } from 'excalibur';
import {CheeseCell} from "./cheeseBlocks";

export class Mold extends Actor {
  target: Vector;
  speed: number;
  hp: number;
  id: number;
  time: number;
  findCheese: (mold: Mold) => CheeseCell;

  constructor(pos: Vector, findCheese: (mold: Mold) => CheeseCell, speed: number = 50) {
    super(pos.x, pos.y, 20, 20);
    this.color = Color.Blue;
    this.target = new Vector(400, 300);
    this.speed = speed;
    this.hp = 3;
    this.on('pointerdown', this.onClick.bind(this));
    this.id = Math.random() * 10;
    this.time = 0;
    this.findCheese = findCheese;
  }

  update(engine: Engine, delta: number): void {
    super.update(engine, delta);
    const targetCheese = this.findCheese(this);
    if (targetCheese) {
      this.target = new Vector(targetCheese.x + 8, targetCheese.y + 8);

      const direction = this.target.sub(this.pos);
      this.vel = direction.normalize().scale(this.speed);
      this.time += delta;
      if (direction.magnitude() > 50) {
        this.vel.addEqual(
          this.vel
            .perpendicular()
            .scale(Math.sin(this.time / 1000 + this.id))
            .scale(1 / 3)
        );
      }
    }
  }

  onClick(evt) {
    this.hp -= 1;
    if (this.hp < 0) {
      this.kill();
    }
  }
}
