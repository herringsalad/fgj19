import { Actor, Color, Vector } from 'excalibur';
import { CheeseCell } from './cheeseMap';
import { Game } from '.';

export const newMold = (game: Game) => {
  const rand = Math.random();
  let pos: Vector;
  if (rand < 0.25) {
    pos = new Vector(-game.width / 2, Math.random() * game.height);
  } else if (rand < 0.5) {
    pos = new Vector(game.width * 1.5, Math.random() * game.height);
  } else if (rand < 0.75) {
    pos = new Vector(Math.random() * game.width, -game.height / 2);
  } else {
    pos = new Vector(Math.random() * game.width, game.height * 1.5);
  }
  game.add(new Mold(pos, Math.random() * 10 + 50));
};

export class Mold extends Actor {
  target: Vector;
  targetCheese: CheeseCell | undefined;
  speed: number;
  hp: number;
  id: number;
  time: number;
  findCheese: (pos: Vector) => CheeseCell | undefined;

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

  update(game: Game, delta: number): void {
    super.update(game, delta);
    if (!this.targetCheese || !this.targetCheese.solid || this.targetCheese.moldiness > 100) {
      this.targetCheese = game.findCheese(this.pos);
      console.log("updating cheesetarget");
    }
    if (this.targetCheese && this.targetCheese.hp === 0) {
      console.log("updating cheesetarget");
      this.targetCheese = this.findCheese(this.pos);
      this.target = new Vector(this.targetCheese!.x + 16, this.targetCheese!.y + 16);
    } 
    if (this.targetCheese) {
      this.target = new Vector(this.targetCheese.x + 16, this.targetCheese.y + 16);

      const direction = this.target.sub(this.pos);

      this.vel = direction.normalize().scale(this.speed);
      this.time += delta;
      if (this.targetCheese && this.target.sub(this.pos).magnitude() < 40) {
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
