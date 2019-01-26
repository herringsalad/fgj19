import {
  Actor,
  Cell,
  CircleArea,
  CollisionType,
  Color,
  Engine,
  Input,
  Polygon,
  Texture,
  Vector
} from 'excalibur';
import Vector2 = Phaser.Math.Vector2;

import { CheeseCell } from './cheeseBlocks';

export class Player extends Actor {
  texture: Texture;
  eatCheese: (cell: Cell) => void;
  biteSize: number;

  constructor(
    initPos: Vector,
    texture: Texture,
    eatCheese: (cell: Cell) => void
  ) {
    super(initPos.x, initPos.y, 40, 40);

    this.texture = texture;
    this.biteSize = 20;
    this.collisionType = CollisionType.Active;
    this.collisionArea = new CircleArea({ pos: new Vector(0, 0), radius: 20 });
    this.eatCheese = eatCheese;
  }

  onInitialize(engine: Engine) {
    let poly = new Polygon([
      new Vector(0, 0),
      new Vector(0, 40),
      new Vector(40, 40),
      new Vector(40, 0),
    ]);
    poly.lineWidth = 2;
    poly.lineColor = Color.Gray;
    this.addDrawing('polygon', poly);
    this.addDrawing('mouse', this.texture.asSprite());
  }

  maybeEat(
    engine: Engine,
    xVelocity: number,
    yVelocity: number,
    dx: number,
    dy: number
  ) {
    // try finding nearby cell in movement dir
    const cell = engine.currentScene.tileMaps[0].getCellByPoint(
      this.pos.x + dx + 20 + xVelocity * 32,
      this.pos.y + dy - 20 + yVelocity * 32
    );

    // if solid cell found, dinner time :-)
    if (cell && cell.solid) {
      this.eatCheese(cell);
    }
  }

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

    this.maybeEat(engine, xVelocity, yVelocity, -20, -20);
    this.maybeEat(engine, xVelocity, yVelocity, 20, -20);
    this.maybeEat(engine, xVelocity, yVelocity, -20, 20);
    this.maybeEat(engine, xVelocity, yVelocity, 20, 20);
  }
}
