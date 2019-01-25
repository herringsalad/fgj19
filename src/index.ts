import * as ex from 'excalibur';
import {Mold} from "./mold";
import {Vector} from "excalibur";

const game = new ex.Engine({
  width: 800,
  height: 600
});
const rectangle = new ex.Actor(150, game.drawHeight - 40, 200, 20);
rectangle.color = ex.Color.Yellow;
rectangle.collisionType = ex.CollisionType.Fixed;
game.add(rectangle);

game.input.pointers.primary.on('move', evt => {
  rectangle.pos.x = (evt as any).worldPos.x;
});


game.add(new Mold(new Vector(500, 500)));
game.add(new Mold(new Vector(400, 600)));

game.start();
