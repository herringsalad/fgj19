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
  homeover = new Actor(0, -150, 210, 108);
  rat = new Actor(0, 50, 204, 180);

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

    if (score >= 10000) {
      if (score >= 13000) {
        this.rat.setDrawing('extraFatMouse');
      } else {
        this.rat.setDrawing('fatMouse');
      }
      this.rat.setDrawing('moldover');
      this.game.assets.goodendmusic.play();
    } else {
      this.rat.setDrawing('deadMouse');
      this.rat.setDrawing('hoveover');
      this.game.assets.badendmusic.play();
    }
  }

  onInitialize(engine: Game): void {
    super.onInitialize(engine);

    const screen = new Actor(0, 0, engine.canvas.width, engine.canvas.height);
    screen.color = Color.fromHex('#FFD132');

    this.rat.addDrawing(
      'extraFatMouse',
      this.game.assets.extraFatMouse.asSprite()
    );
    this.rat.addDrawing('fatMouse', this.game.assets.fatMouse.asSprite());
    this.homeover.addDrawing('moldover', this.game.assets.moldover.asSprite());
    this.rat.addDrawing('deadMouse', this.game.assets.deadMouse.asSprite());
    this.homeover.addDrawing('homeover', this.game.assets.homeover.asSprite());

    this.homeover.body.pos.x = this.homeover.getCenter().x;
    this.rat.body.pos.x = this.rat.getCenter().x;

    this.scoreLabel.scale = this.hiscoreLabel.scale = new Vector(3, 3);
    this.scoreLabel.color = this.hiscoreLabel.color = Color.Black;
    this.scoreLabel.body.pos.x = this.scoreLabel.getCenter().x;
    this.hiscoreLabel.body.pos.x = this.hiscoreLabel.getCenter().x;
    this.scoreLabel.textAlign = this.hiscoreLabel.textAlign = TextAlign.Center;

    screen.add(this.scoreLabel);
    screen.add(this.hiscoreLabel);
    screen.add(this.rat);
    screen.add(this.homeover);

    this.rat.on(EventTypes.PointerDown, () => {
      engine.restrat();
    });

    this.add(screen);

    this.camera.strategy.lockToActor(screen);
  }
}
