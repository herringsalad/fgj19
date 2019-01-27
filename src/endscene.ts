import {Actor, Color, EventTypes, Label, Scene, TextAlign, Vector} from "excalibur";
import {Game} from "./index";

export class EndScene extends Scene {
  game: Game;

  constructor(game: Game) {
    super();
    this.game = game;
  }

  onInitialize(engine: Game): void {
    super.onInitialize(engine);
    const bestScore = Number(window.localStorage.getItem('hiscore') || '0');

    const screen = new Actor(0, 0, engine.canvas.width, engine.canvas.height);
    screen.color = Color.fromHex("#FFD132");

    const scoreLabel = new Label(`Your score: ${this.game.score}`, 0, 200, 'monospace');
    const hiscore = new Label(``, 0, 250, 'monospace');
    if (this.game.score <= bestScore) {
      hiscore.text = `High score: ${bestScore}`
    } else {
      hiscore.text = 'New high score!';
      window.localStorage.setItem('hiscore', `${this.game.score}`)
    }

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

    scoreLabel.scale = hiscore.scale = new Vector(3, 3);
    scoreLabel.color = hiscore.color = Color.Black;
    scoreLabel.body.pos.x = scoreLabel.getCenter().x;
    hiscore.body.pos.x = hiscore.getCenter().x;
    scoreLabel.textAlign = hiscore.textAlign = TextAlign.Center;

    screen.add(scoreLabel);
    screen.add(hiscore);
    screen.add(rat);
    screen.add(homeover);

    rat.on(EventTypes.PointerDown, () => {
      engine.restrat();
    });

    this.add(screen);

    this.camera.strategy.lockToActor(screen);
  }
}
