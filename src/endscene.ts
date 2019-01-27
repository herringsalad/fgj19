import {
  Actor,
  Color,
  EventTypes,
  Label,
  Scene,
  TextAlign,
  Vector
} from 'excalibur';
import { Game } from './index';

export class EndScene extends Scene {
  game: Game;

  scoreLabel = new Label(``, 0, 200, 'monospace');
  hiscoreLabel = new Label(``, 0, 250, 'monospace');

  constructor(game: Game) {
    super();
    this.game = game;
  }

  updateScore(score: number) {
    const bestScore = Number(window.localStorage.getItem('hiscore') || '0');
    this.scoreLabel.text = `Your score: ${score}`;

    if (score <= bestScore) {
      this.hiscoreLabel.text = `High score: ${bestScore}`;
    } else {
      this.hiscoreLabel.text = `New high score! (previously: ${bestScore})`;
      window.localStorage.setItem('hiscore', `${score}`);
    }
  }

  onInitialize(engine: Game): void {
    super.onInitialize(engine);

    const screen = new Actor(0, 0, engine.canvas.width, engine.canvas.height);
    screen.color = Color.fromHex('#FFD132');

    const homeover = new Actor(0, -150, 210, 108);
    const rat = new Actor(0, 50, 204, 180);

    if (this.game.score > 10000) {
      rat.addDrawing(this.game.assets.fatMouse.asSprite());
      homeover.addDrawing(this.game.assets.moldover.asSprite());
      this.game.assets.goodendmusic.play();
    } else {
      rat.addDrawing(this.game.assets.deadMouse.asSprite());
      homeover.addDrawing(this.game.assets.homeover.asSprite());
      this.game.assets.badendmusic.play();
    }

    homeover.body.pos.x = homeover.getCenter().x;
    rat.body.pos.x = rat.getCenter().x;

    this.scoreLabel.scale = this.hiscoreLabel.scale = new Vector(3, 3);
    this.scoreLabel.color = this.hiscoreLabel.color = Color.Black;
    this.scoreLabel.body.pos.x = this.scoreLabel.getCenter().x;
    this.hiscoreLabel.body.pos.x = this.hiscoreLabel.getCenter().x;
    this.scoreLabel.textAlign = this.hiscoreLabel.textAlign = TextAlign.Center;

    screen.add(this.scoreLabel);
    screen.add(this.hiscoreLabel);
    screen.add(rat);
    screen.add(homeover);

    rat.on(EventTypes.PointerDown, () => {
      engine.restrat();
    });

    this.add(screen);

    this.camera.strategy.lockToActor(screen);
  }
}
