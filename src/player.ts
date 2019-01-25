import {
  Actor,
  Vector,
  Texture,
  Engine,
  Input,
  CollisionType,
  CircleArea,
  Cell
} from 'excalibur';

export class Player extends Actor {
  texture: Texture;

  constructor(initPos: Vector, texture: Texture) {
    super(initPos.x, initPos.y, 40, 40);

    this.texture = texture;
    this.collisionType = CollisionType.Active;
    this.collisionArea = new CircleArea({ pos: new Vector(0, 0), radius: 20 });
  }

  onInitialize(engine: Engine) {
    this.addDrawing(this.texture.asSprite());
  }

  eatCheese = (cell: Cell) => {
    cell.clearSprites();
    cell.solid = false;
  };

  update(engine: Engine, delta: number) {
    super.update(engine, delta);

    let xVelocity = 0;
    let yVelocity = 0;

    if (engine.input.keyboard.isHeld(Input.Keys.Left)) xVelocity -= 1;
    if (engine.input.keyboard.isHeld(Input.Keys.Right)) xVelocity += 1;
    if (engine.input.keyboard.isHeld(Input.Keys.Up)) yVelocity -= 1;
    if (engine.input.keyboard.isHeld(Input.Keys.Down)) yVelocity += 1;

    // set player movement speed
    this.vel.x = xVelocity * 128;
    this.vel.y = yVelocity * 128;

    // try finding nearby cell in movement dir
    const cell = engine.currentScene.tileMaps[0].getCellByPoint(
      this.pos.x + xVelocity * 32,
      this.pos.y + yVelocity * 32
    );

    // if solid cell found, dinner time :-)
    if (cell && cell.solid) {
      this.eatCheese(cell);
    }
  }
}
