import { Actor, ParticleEmitter, Input, Vector, Color, Sound, CollisionType, SpriteSheet, Sprite, EmitterType } from "excalibur";
import { Game } from ".";

export const blowParticleEmitter = new ParticleEmitter({
  startSize: 1,
  endSize: .5,
  emitterType: EmitterType.Rectangle,
  radius: 0,
  randomRotation: true,
  maxVel: 2,
  maxAngle: Math.PI * 2,
  // particleRotationalVelocity: 2, // rotates around center. Not good for gas
  minVel: .1,
  numParticles: 6,
  emitRate: 18,
  fadeFlag: true,
  particleLife: 1000,
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

    this.lifeLength = 3000;

  }

  onInitialize(engine: Game) {
    super.onInitialize(engine);

    let sound = engine.assets.moldDed;
    sound.play(.1);

    this.emitter = blowParticleEmitter;
    this.emitter.particleLife = this.lifeLength;
    
    const blowParticleSprite = new SpriteSheet(
      engine.assets.blowParticles,
      1,
      3,
      32,
      32
    );
      
    this.emitter.particleSprite = (blowParticleSprite.getAnimationForAll(
      engine,
      250
    ) as unknown) as Sprite;
        
    this.emitter.isEmitting = true;
    this.add(this.emitter);
      
    setTimeout(this.stopEmitting.bind(this), this.lifeLength - this.emitter.particleLife);
    setTimeout(this.kill.bind(this), this.lifeLength);
      
  }

  stopEmitting() {
    this.emitter.isEmitting = false;
  }

  draw(ctx: CanvasRenderingContext2D, delta: number) {
    super.draw(ctx, delta);

    this.getBounds().debugDraw(ctx, Color.Red);
  }

}