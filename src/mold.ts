import { Animation, Actor, CollisionType, EventTypes, Sound, Vector } from 'excalibur';
import { CheeseCell } from './cheeseMap';
import { Game } from '.';
import { Player } from './player';

export const newMold = (game: Game, anim: Animation, killSound: Sound, moldPartySound: Sound, onKill: () => void) => {
  const rand = Math.random();
  let pos: Vector;
  if (rand < 0.25) {
    pos = new Vector(-game.width, Math.random() * game.height);
  } else if (rand < 0.5) {
    pos = new Vector(game.width * 2, Math.random() * game.height);
  } else if (rand < 0.75) {
    pos = new Vector(Math.random() * game.width, -game.height);
  } else {
    pos = new Vector(Math.random() * game.width, game.height * 2);
  }
  game.add(new Mold(pos, Math.random() * 10 + 50, anim, killSound, moldPartySound, onKill));
};

export class Mold extends Actor {
  target: Vector;
  targetCheese: CheeseCell | undefined;
  speed: number;
  hp: number;
  id: number;
  time: number;
  targetMoldiness: number;
  partySound: Sound;
  killSound: Sound;

  constructor(pos: Vector, speed, moldTexture: Animation, killSound, moldPartySound, onKill: () => void) {
    super(pos.x, pos.y, 20, 20);
    this.addDrawing('stock', moldTexture);
    this.target = new Vector(400, 300);
    this.collisionType = CollisionType.Passive;
    this.speed = speed;
    this.hp = 3;
    this.on('pointerdown', this.onClick.bind(this));
    this.id = Math.random() * 10;
    this.time = 0;
    this.targetMoldiness = this.id > 5 ? 50 : 100;
    this.partySound = moldPartySound;
    this.killSound = killSound;
    this.on(EventTypes.PreCollision, event => {
      if (event!.other instanceof Player) {
        onKill();
        this.kill();
      }
    });

    this.on(EventTypes.Kill, () => {
      this.partySound.volume = 0;
      this.killSound.volume = 0;
      this.partySound.stop();
    })
  }

  onInitialize() {
    if (this.partySound.instanceCount() < 5 && this.id < 1) {
      this.partySound.loop = true;
      this.partySound.play(.1);
    }
  }

  onPreKill() {
    this.killSound.play(.2);
    this.partySound.stop();
  }

  update(game: Game, delta: number): void {
    super.update(game, delta);
    if (
      !this.targetCheese ||
      !this.targetCheese.solid ||
      this.targetCheese.moldiness > this.targetMoldiness
    ) {
      this.targetCheese = game.findCheese(this.pos, this.targetMoldiness);
      if (this.targetCheese) {
        this.targetCheese = game.findCheese(this.pos, 100);
      }

      if (this.targetCheese) {
        this.target = new Vector(
          this.targetCheese!.x + 16,
          this.targetCheese!.y + 16
        );
      }
    }
    if (this.targetCheese) {
      this.target = new Vector(
        this.targetCheese.x + 16,
        this.targetCheese.y + 16
      );

      const direction = this.target.sub(this.pos);

      this.vel = direction.normalize().scale(this.speed);
      this.time += delta;
      if (this.targetCheese && this.target.sub(this.pos).magnitude() < 40) {

        this.targetCheese.mold(delta);
      }
      this.vel.addEqual(
        this.vel
          .perpendicular()
          .scale(Math.sin(this.time / 1000 + this.id))
          .scale(1 / 3)
      );
    } else {
      this.kill();
    }
  }

  onClick(evt) {
    this.hp -= 1;
    if (this.hp < 0) {
      this.kill();
    }
  }
}
