import 'phaser';
import * as Phaser from 'phaser';

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade'
    }
};

const game = new Phaser.Game(config);
let cursors: Phaser.Input.Keyboard.CursorKeys;
let logo: Phaser.Physics.Arcade.Image;

function preload(this: Phaser.Scene) {
    this.load.image('logo', 'assets/logo.png');
}

function create(this: Phaser.Scene) {
    logo = this.physics.add
        .image(400, 150, 'logo')
        .setDrag(0.90)
        .setDamping(true);
    cursors = this.input.keyboard.createCursorKeys();

    logo.setCollideWorldBounds(true);
}


function update() {
    const speed = 400;
    if (cursors.left.isDown) {
        logo.setAccelerationX(-speed);
    } else if (cursors.right.isDown) {
        logo.setAccelerationX(speed);
    } else {
        logo.setAccelerationX(0);
        //logo.setVelocityX(logo.body.velocity.x / 2);
    }
    if (cursors.up.isDown) {
        logo.setAccelerationY(-speed);
    } else if (cursors.down.isDown) {
        logo.setAccelerationY(speed);
    } else {
        logo.setAccelerationY(0);
        //logo.setVelocityY(logo.body.velocity.y / 2);
    }
}