import {
  Actor,
  Cell,
  CircleArea,
  CollisionType,
  Color,
  Engine,
  Input,
  Texture,
  Vector
} from 'excalibur';

import { Game } from './';
import { CheeseMap } from './cheeseMap';

export class Player extends Actor {
  texture: Texture;
  eatCheese: (cell: Cell) => void;
  biteSize: number;
  speed = 256;

  constructor(
    initPos: Vector,
    texture: Texture,
    eatCheese: (cell: Cell) => void,
    tm: CheeseMap
  ) {
    super(initPos.x, initPos.y, 40, 40);

    this.texture = texture;
    this.biteSize = 20;
    this.collisionType = CollisionType.Active;
    //this.collisionArea = new PolygonArea({
    //  points: [
    //    new Vector(-20, -20),
    //    new Vector(-20, 60),
    //    new Vector(60, 60),
    //    new Vector(60, -20),
    //  ]
    //});
    this.eatCheese = eatCheese;

    // make player hitbox smaller
    // this.setWidth(this.getWidth() * 0.3);
    // this.setHeight(this.getHeight() * 0.3);

    //this.on(EventTypes.PreCollision, e => {
    //  console.log("precoll")
    //  e.actor.vel = e.actor.vel.scale(-1);
    //})
  }

  onInitialize(engine: Engine) {
    this.addDrawing('mouse', this.texture.asSprite());
  }

  maybeEat(engine: Game, delta: number, xVelocity: number, yVelocity: number) {
    // try finding nearby cell in movement dir

    if (xVelocity && yVelocity) return;

    const cheese = engine.tileMap.cheeseAt(
      this.pos.x + xVelocity * 64,
      this.pos.y + yVelocity * 64
    );

    if (cheese && !cheese.moldiness && cheese.hp > 0) {
      cheese.consume(delta);
    }
  }

  draw(ctx: CanvasRenderingContext2D, delta: number) {
    super.draw(ctx, delta);

    // draw player hitbox
    this.getBounds().debugDraw(ctx, Color.fromRGB(0, 255, 0, 0.5));
  }

  update(engine: Game, delta: number) {
    super.update(engine, delta);

    let xVelocity = 0;
    let yVelocity = 0;

    if (engine.input.keyboard.isHeld(Input.Keys.Left)) xVelocity -= 1;
    if (engine.input.keyboard.isHeld(Input.Keys.Right)) xVelocity += 1;
    if (engine.input.keyboard.isHeld(Input.Keys.Up)) yVelocity -= 1;
    if (engine.input.keyboard.isHeld(Input.Keys.Down)) yVelocity += 1;

    // set player movement speed
    this.vel.x = xVelocity * this.speed;
    this.vel.y = yVelocity * this.speed;

    if (xVelocity || yVelocity) {
      this.maybeEat(engine, delta, xVelocity, yVelocity);
    }
  }
}
