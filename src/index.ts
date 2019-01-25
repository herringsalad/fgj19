import * as ex from 'excalibur';

const game = new ex.Engine({
    width: 800,
    height: 600,
});
const rectangle = new ex.Actor(150, game.drawHeight - 40, 200, 20)
rectangle.color = ex.Color.Yellow;
rectangle.collisionType = ex.CollisionType.Fixed;
game.add(rectangle);
game.start();

game.input.pointers.primary.on('move', (evt) => {
    rectangle.pos.x = (<any>evt).worldPos.x
});