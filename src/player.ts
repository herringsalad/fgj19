import {
  Actor,
  Cell,
  CircleArea,
  CollisionType,
  Color,
  Engine,
  Input,
  Texture,
  Vector,
  Sprite,
  SpriteSheet,
  PolygonArea,
  EventTypes
} from 'excalibur';

import { Game } from './';
import { CheeseMap } from './cheeseMap';

export class Player extends Actor {
  texture: Texture;
  biteSize: number;
  speed = 256;
  spriteSheet: SpriteSheet;

  constructor(initPos: Vector, texture: Texture) {
    super(initPos.x, initPos.y, 40, 40);

    this.texture = texture;
    this.biteSize = 20;
    this.collisionType = CollisionType.Active;

    // make player hitbox smaller
    // this.setWidth(this.getWidth() * 0.2);
    // this.setHeight(this.getHeight() * 0.2);
  }

  onInitialize(game: Engine) {
    this.spriteSheet = new SpriteSheet(this.texture, 1, 20, 39, 45);

    const animSpeed = 200;

    const idleLeft = this.spriteSheet.getAnimationBetween(
      game,
      0,
      1,
      animSpeed
    );
    const walkLeft = this.spriteSheet.getAnimationBetween(
      game,
      1,
      3,
      animSpeed
    );
    const eatLeft = this.spriteSheet.getAnimationBetween(game, 3, 5, animSpeed);
    this.addDrawing('idleLeft', idleLeft);
    this.addDrawing('walkLeft', walkLeft);
    this.addDrawing('eatLeft', eatLeft);

    const idleRight = this.spriteSheet.getAnimationBetween(
      game,
      5,
      6,
      animSpeed
    );
    const walkRight = this.spriteSheet.getAnimationBetween(
      game,
      6,
      8,
      animSpeed
    );
    const eatRight = this.spriteSheet.getAnimationBetween(
      game,
      8,
      10,
      animSpeed
    );
    this.addDrawing('idleRight', idleRight);
    this.addDrawing('walkRight', walkRight);
    this.addDrawing('eatRight', eatRight);

    const idleDown = this.spriteSheet.getAnimationBetween(
      game,
      10,
      11,
      animSpeed
    );
    const walkDown = this.spriteSheet.getAnimationBetween(
      game,
      11,
      13,
      animSpeed
    );
    const eatDown = this.spriteSheet.getAnimationBetween(
      game,
      13,
      15,
      animSpeed
    );
    this.addDrawing('idleDown', idleDown);
    this.addDrawing('walkDown', walkDown);
    this.addDrawing('eatDown', eatDown);

    const idleUp = this.spriteSheet.getAnimationBetween(
      game,
      15,
      16,
      animSpeed
    );
    const walkUp = this.spriteSheet.getAnimationBetween(
      game,
      16,
      18,
      animSpeed
    );
    const eatUp = this.spriteSheet.getAnimationBetween(game, 18, 20, animSpeed);
    this.addDrawing('idleUp', idleUp);
    this.addDrawing('walkUp', walkUp);
    this.addDrawing('eatUp', eatUp);

    this.setDrawing('idleRight');
  }

  maybeEat(engine: Game, delta: number, xVelocity: number, yVelocity: number) {
    // try finding nearby cell in movement dir

    if (xVelocity && yVelocity) return false;

    const cheese = engine.tileMap.cheeseAt(
      this.pos.x + xVelocity * 64,
      this.pos.y + yVelocity * 64
    );

    if (cheese && cheese.moldiness < 50 && cheese.hp > 0) {
      cheese.consume(delta);
      return true;
    }

    return false;
  }

  draw(ctx: CanvasRenderingContext2D, delta: number) {
    super.draw(ctx, delta);

    // draw player hitbox
    //this.getBounds().debugDraw(ctx, Color.fromRGB(0, 255, 0, 0.5));
  }

  update(engine: Game, delta: number) {
    super.update(engine, delta);

    let xVelocity = 0;
    let yVelocity = 0;

    if (engine.input.keyboard.isHeld(Input.Keys.Up) && this.pos.y > 65) {
      yVelocity -= 1;
    }
    if (engine.input.keyboard.isHeld(Input.Keys.Down) && this.pos.y < 1200) {
      yVelocity += 1;
    }
    if (engine.input.keyboard.isHeld(Input.Keys.Left) && this.pos.x > 65) {
      xVelocity -= 1;
    }
    if (engine.input.keyboard.isHeld(Input.Keys.Right) && this.pos.x < 1200) {
      xVelocity += 1;
    }

    if (!xVelocity && !yVelocity) {
      if (this.oldVel.y < 0) {
        this.setDrawing('idleUp');
      }
      if (this.oldVel.y > 0) {
        this.setDrawing('idleDown');
      }
      if (this.oldVel.x < 0) {
        this.setDrawing('idleLeft');
      }
      if (this.oldVel.x > 0) {
        this.setDrawing('idleRight');
      }
    }

    this.vel.x = 0;
    this.vel.y = 0;

    engine.particleEmitter.pos.x = this.pos.x + xVelocity * 48;
    engine.particleEmitter.pos.y = this.pos.y + yVelocity * 48;

    engine.particleEmitter.isEmitting = false;

    if (xVelocity || yVelocity) {
      // set player movement speed
      const newVel = new Vector(xVelocity, yVelocity).normalize();

      this.vel.x = newVel.x * this.speed;
      this.vel.y = newVel.y * this.speed;

      const didEat = this.maybeEat(engine, delta, xVelocity, yVelocity);
      engine.particleEmitter.isEmitting = didEat;

      if (yVelocity < 0) {
        this.setDrawing(didEat ? 'eatUp' : 'walkUp');
      }
      if (yVelocity > 0) {
        this.setDrawing(didEat ? 'eatDown' : 'walkDown');
      }
      if (xVelocity < 0) {
        this.setDrawing(didEat ? 'eatLeft' : 'walkLeft');
      }
      if (xVelocity > 0) {
        this.setDrawing(didEat ? 'eatRight' : 'walkRight');
      }
    }
  }
}
