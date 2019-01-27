import {Actor, CollisionType, Color, EmitterType, ParticleEmitter, Sound, Sprite, SpriteSheet, Vector} from "excalibur";
import {Game} from ".";
import {getTiles} from "./tilebuilder";

export const blowParticleEmitter = new ParticleEmitter({
  startSize: 1,
  endSize: .5,
  emitterType: EmitterType.Rectangle,
  radius: 0,
  randomRotation: true,
  maxVel: 0,
  maxAngle: Math.PI * 2,
  // particleRotationalVelocity: 2, // rotates around center. Not good for gas
  // minVel: .1,
  numParticles: 5,
  emitRate: 10,
  fadeFlag: false,
  particleLife: 2000,
  opacity: 1,
  isEmitting: false,
  // beginColor: Color.Green,
  // endColor: Color.Gray,
});

export class Blow extends Actor {
  isEmitting: boolean;
  lifeLength: number;
  sound: Sound;
  emitter: ParticleEmitter;


  constructor(pos: Vector, size = 30) {
    super();

    this.pos = pos;
    this.setHeight(size);
    this.setWidth(size);

    this.collisionType = CollisionType.Passive;
    this.collisionGroups.push("gas");

    this.lifeLength = 4000;

  }

  onInitialize(engine: Game) {
    super.onInitialize(engine);

    let sound = engine.assets.moldDed;
    sound.play(.1);

    this.emitter = blowParticleEmitter;

    const blowParticleSprite = new SpriteSheet(
      engine.assets.blowParticles,
      1,
      3,
      32,
      32
    );

    const sprite = blowParticleSprite.getAnimationForAll(engine, 250);
    this.emitter.particleSprite = sprite as any as Sprite;

    this.emitter.isEmitting = true;
    this.add(this.emitter);

    setTimeout(this.stopEmitting.bind(this), this.lifeLength - this.emitter.particleLife);
    setTimeout(this.kill.bind(this), this.lifeLength);
  }

  update(engine: Game, delta: number): void {
    super.update(engine, delta);

    const cheese = engine.tileMap.cheeseAt(this.x, this.y);
    if (cheese) {
      if (cheese.moldiness < 100) {
        const prev = cheese.moldiness;
        cheese.moldiness = Math.max(0, cheese.moldiness - delta / 100);
        if(cheese.moldiness < 50 && prev > 50) {
          engine.tileMap.semimoldData[cheese.dataY][cheese.dataX] = false;
          engine.tileMap.semimoldTiles = getTiles(engine.tileMap.semimoldData);
        }
      }
    }
  }

  stopEmitting() {
    this.emitter.isEmitting = false;
  }
}