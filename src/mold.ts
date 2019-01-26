import { Actor, Color, Engine, Vector } from 'excalibur';
import { CheeseCell } from './cheeseBlocks';

export class Mold extends Actor {
  target: Vector;
  targetCheese: CheeseCell;
  speed: number;
  hp: number;
  id: number;
  time: number;
  findCheese: (pos: Vector) => CheeseCell;

  constructor(
    pos: Vector,
    findCheese: (pos: Vector) => CheeseCell,
    speed: number = 50
  ) {
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
    if (!this.targetCheese) {
      this.targetCheese = this.findCheese(this.pos);
      console.log("updating cheesetarget");
    }
    if (this.targetCheese.hp === 0) {
      console.log("updating cheesetarget");
      this.targetCheese = this.findCheese(this.pos);
      this.target = new Vector(this.targetCheese.x + 16, this.targetCheese.y + 16);
    } 
    if (this.targetCheese) {
      const direction = this.target.sub(this.pos);

      this.vel = direction.normalize().scale(this.speed);
      this.time += delta;
      if (this.target.sub(this.pos).magnitude() < 40) {
        this.targetCheese.mold();
      }
    } else {
      this.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5)
        .normalize()
        .scale(this.speed);
    }
    this.vel.addEqual(
      this.vel
        .perpendicular()
        .scale(Math.sin(this.time / 1000 + this.id))
        .scale(1 / 3)
    );
  }

  onClick(evt) {
    this.hp -= 1;
    if (this.hp < 0) {
      this.kill();
    }
  }
}
