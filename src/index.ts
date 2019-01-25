import * as Phaser from 'phaser';

class HelloWorldScene extends Phaser.Scene {
  cursors: Phaser.Input.Keyboard.CursorKeys;
  logo: Phaser.Physics.Arcade.Image;

  preload = () => {
    this.load.image('logo', 'assets/logo.png');
  };

  create = () => {
    this.logo = this.physics.add
      .image(400, 150, 'logo')
      .setDrag(0.9)
      .setDamping(true);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.logo.setCollideWorldBounds(true);
  };

  update = () => {
    const speed = 400;
    if (this.cursors.left.isDown) {
      this.logo.setAccelerationX(-speed);
    } else if (this.cursors.right.isDown) {
      this.logo.setAccelerationX(speed);
    } else {
      this.logo.setAccelerationX(0);
      //logo.setVelocityX(logo.body.velocity.x / 2);
    }
    if (this.cursors.up.isDown) {
      this.logo.setAccelerationY(-speed);
    } else if (this.cursors.down.isDown) {
      this.logo.setAccelerationY(speed);
    } else {
      this.logo.setAccelerationY(0);
      //logo.setVelocityY(logo.body.velocity.y / 2);
    }
  };
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  scene: HelloWorldScene,
  physics: {
    default: 'arcade'
  }
});
