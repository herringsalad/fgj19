import {Actor, Color, Engine, EventTypes, Label, Scene, TextAlign, Vector} from "excalibur";
import {Game} from "./index";

export class EndScene extends Scene {
  game: Game;

  constructor(game: Game) {
    super();
    this.game = game;
  }

  onInitialize(engine: Engine): void {
    super.onInitialize(engine);

    const screen = new Actor(0, 0, engine.canvas.width, engine.canvas.height);
    screen.color = Color.fromHex("#FFD132");

    const lostLabel = new Label(`You lost the game :(`, 0, -200, '');
    const scoreLabel = new Label(`Your score: ${this.game.score}`, 0, 200, 'monospace');

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

    scoreLabel.scale = lostLabel.scale = new Vector(3, 3);
    scoreLabel.color = lostLabel.color = Color.Black;
    scoreLabel.body.pos.x = scoreLabel.getCenter().x;
    scoreLabel.textAlign = TextAlign.Center;

    screen.add(scoreLabel);
    //screen.add(lostLabel);
    screen.add(rat);
    screen.add(homeover);

    rat.on(EventTypes.PointerDown, () => {
      window.location.reload();
    });

    this.add(screen);

    this.camera.strategy.lockToActor(screen);
  }
}
