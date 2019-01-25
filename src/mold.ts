import { Actor, Color, Engine, Vector } from 'excalibur';

export class Mold extends Actor {
  target: Vector;
  speed: number;
  hp: number;
  id: number;
  time: number;

  constructor(pos: Vector, speed: number = 50) {
    super(pos.x, pos.y, 20, 20);
    this.color = Color.Blue;
    this.target = new Vector(400, 300);
    this.speed = speed;
    this.hp = 3;
    this.on('pointerdown', this.onClick.bind(this));
    this.id = Math.random() * 10;
    this.time = 0;
  }

  update(engine: Engine, delta: number): void {
    super.update(engine, delta);

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

  onClick(evt) {
    this.hp -= 1;
    if (this.hp < 0) {
      this.kill();
    }
  }
}
