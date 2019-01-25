import {
  Actor,
  Vector,
  Texture,
  Engine,
  Input,
  CollisionType,
  CircleArea
} from 'excalibur';

export class Player extends Actor {
  texture: Texture;

  constructor(initPos: Vector, texture: Texture) {
    super(initPos.x, initPos.y, 40, 40);

    this.texture = texture;
    this.collisionType = CollisionType.Active;
    this.collisionArea = new CircleArea({ pos: new Vector(0, 0), radius: 20 });
  }

  public onInitialize(engine: Engine) {
    this.addDrawing(this.texture.asSprite());
  }

  update(engine: Engine, delta: number) {
    super.update(engine, delta);

    const mvVel = 128;

    let xVelocity = 0;
    let yVelocity = 0;

    if (engine.input.keyboard.isHeld(Input.Keys.Left)) xVelocity -= mvVel;
    if (engine.input.keyboard.isHeld(Input.Keys.Right)) xVelocity += mvVel;
    if (engine.input.keyboard.isHeld(Input.Keys.Up)) yVelocity -= mvVel;
    if (engine.input.keyboard.isHeld(Input.Keys.Down)) yVelocity += mvVel;

    this.vel.x = xVelocity;
    this.vel.y = yVelocity;
  }
}
