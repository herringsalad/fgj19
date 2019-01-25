import 'phaser';
import CursorKeys = Phaser.Input.Keyboard.CursorKeys;

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
let cursors: CursorKeys;
let logo: Phaser.Physics.Arcade.Image;

function preload(this: Phaser.Scene) {
    this.load.image('logo', 'assets/logo.png');
}

function create(this: Phaser.Scene) {
    logo = this.physics.add.image(400, 150, 'logo');
    cursors = this.input.keyboard.createCursorKeys();

    logo.setCollideWorldBounds(true);
}


function update() {
    if (cursors.left.isDown) {
        logo.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        logo.setVelocityX(160);
    } else {
        logo.setVelocityX(0);
    }
    if (cursors.up.isDown) {
        logo.setVelocityY(-160);
    } else if (cursors.down.isDown) {
        logo.setVelocityY(160);
    } else {
        logo.setVelocityY(0);
    }
}