import {Actor, CollisionType, Engine, Input, Sound, SpriteSheet, Texture, Vector} from 'excalibur';

import {Game} from './';

type Direction = 'Up' | 'Down' | 'Left' | 'Right';

export class Player extends Actor {
  texture: Texture;
  biteSize: number;
  speed = 256;
  spriteSheet: SpriteSheet;
  squeak: Sound;
  eatSound: Sound;
  lastDirectionPressed?: Direction;

  constructor(
    initPos: Vector,
    texture: Texture,
    squeak: Sound,
    eatSound: Sound
  ) {
    super(initPos.x, initPos.y, 40, 40);

    this._postupdate = (engine: Game, delta: number) => {
      super._postupdate(engine, delta);
      this.pos.x = Math.floor(this.pos.x);
      this.pos.y = Math.floor(this.pos.y);

      this.pos.x = Math.max(this.pos.x, 65);
      this.pos.x = Math.min(this.pos.x, 1200);
      this.pos.y = Math.max(this.pos.y, 65);
      this.pos.y = Math.min(this.pos.y, 1200);
    };

    this.texture = texture;
    this.biteSize = 20;
    this.collisionType = CollisionType.Active;

    // make player hitbox smaller
    this.setWidth(24);
    this.setHeight(24);

    this.squeak = squeak;
    this.eatSound = eatSound;
  }

  onInitialize(game: Engine) {
    this.spriteSheet = new SpriteSheet(this.texture, 1, 20, 39, 45);
    this.scale = new Vector(2, 2);

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

    // sounds
    // mouse squeak
    this.squeak.loop = true;
    this.squeak.play(0.1);
  }

  maybeEat(engine: Game, delta: number, xVelocity: number, yVelocity: number) {
    // try finding nearby cell in movement dir

    if (xVelocity && yVelocity) return false;

    const cheeseSearchDist = 32;
    const cheese = engine.tileMap.cheeseAt(
      this.pos.x + xVelocity * cheeseSearchDist,
      this.pos.y + yVelocity * cheeseSearchDist
    );

    if (cheese && cheese.moldiness < 50 && cheese.hp > 0) {
      if (this.eatSound.instanceCount() === 0) {
        this.eatSound.play(0.5);
      }
      cheese.consume(delta * 2);
      return true;
    }

    return false;
  }

  draw(ctx: CanvasRenderingContext2D, delta: number) {
    super.draw(ctx, delta);

    // draw player hitbox
    // this.getBounds().debugDraw(ctx, Color.fromRGB(0, 255, 0, 0.5));
  }

  update(engine: Game, delta: number) {
    super.update(engine, delta);

    let xVelocity = 0;
    let yVelocity = 0;

    // Store last pressed input
    if (engine.input.keyboard.wasPressed(Input.Keys.Up))
      this.lastDirectionPressed = 'Up';
    if (engine.input.keyboard.wasPressed(Input.Keys.Down))
      this.lastDirectionPressed = 'Down';
    if (engine.input.keyboard.wasPressed(Input.Keys.Left))
      this.lastDirectionPressed = 'Left';
    if (engine.input.keyboard.wasPressed(Input.Keys.Right))
      this.lastDirectionPressed = 'Right';

    // If last pressed input was released, reset last pressed button
    if (
      (this.lastDirectionPressed === 'Up' &&
        engine.input.keyboard.wasReleased(Input.Keys.Up)) ||
      (this.lastDirectionPressed === 'Down' &&
        engine.input.keyboard.wasReleased(Input.Keys.Down)) ||
      (this.lastDirectionPressed === 'Left' &&
        engine.input.keyboard.wasReleased(Input.Keys.Left)) ||
      (this.lastDirectionPressed === 'Right' &&
        engine.input.keyboard.wasReleased(Input.Keys.Right))
    ) {
      this.lastDirectionPressed = undefined;
    }

    if (this.lastDirectionPressed) {
      // If we still have a last pressed direction, move in that dir
      switch (this.lastDirectionPressed) {
        case 'Up': {
          yVelocity -= 1;
          break;
        }
        case 'Down': {
          yVelocity += 1;
          break;
        }
        case 'Left': {
          xVelocity -= 1;
          break;
        }
        case 'Right': {
          xVelocity += 1;
          break;
        }
      }
    } else {
      // Otherwise move in whatever dir is pressed
      if (engine.input.keyboard.isHeld(Input.Keys.Up)) {
        yVelocity -= 1;
      } else if (engine.input.keyboard.isHeld(Input.Keys.Down)) {
        yVelocity += 1;
      } else if (engine.input.keyboard.isHeld(Input.Keys.Left)) {
        xVelocity -= 1;
      } else if (engine.input.keyboard.isHeld(Input.Keys.Right)) {
        xVelocity += 1;
      }
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

      if (!didEat) {
        this.eatSound.stop();
      }
    } else {
      this.eatSound.stop();
    }
  }
}
