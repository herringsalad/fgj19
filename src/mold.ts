import {Actor, Color, Engine, Vector} from 'excalibur';

export class Mold extends Actor {
    target: Vector;
    speed: number;

    constructor(pos: Vector, speed: number = 50) {
        super(pos.x, pos.y, 20, 20);
        this.color = Color.Blue;
        this.target = new Vector(400, 300);
        this.speed = speed;
    }

    update(engine: Engine, delta: number): void {
        super.update(engine, delta);

        const direction = this.target.sub(this.pos);
        this.vel = direction.normalize().scale(this.speed);
    }
}