import * as ex from 'excalibur';
import {Color, Vector} from 'excalibur';
import {Mold} from "./mold";

const width = 800;
const height = 600;

const game = new ex.Engine({width, height});

for (let i = 0; i < Math.max(width/64, height/64); i++) {
    const col = new ex.Actor(i * 64, 0,
        1, height*2, Color.White);
    game.add(col);
    const row = new ex.Actor(0, i * 64,
        width*2, 1, Color.White);
    game.add(row);
}

game.add(new Mold(new Vector(500, 500)));
game.add(new Mold(new Vector(400, 600)));

game.start();
