import {Actor, Color, Engine, EventTypes, Label, Scene, Vector} from "excalibur";
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

    const lostLabel = new Label(`You lost the game :(`, -450, -50, '');
    const scoreLabel = new Label(`Your score: ${this.game.score}`, -450, 0, 'monospace');

    const deadrat = new Actor( 300, 100, 204, 180);
    deadrat.addDrawing(this.game.assets.deadMouse.asSprite());

    const homeover = new Actor( 300, -100, 210, 108);
    homeover.addDrawing(this.game.assets.homeover.asSprite());

    scoreLabel.scale = lostLabel.scale = new Vector(5, 5);
    scoreLabel.color = lostLabel.color = Color.Black;

    screen.add(scoreLabel);
    //screen.add(lostLabel);
    screen.add(deadrat);
    screen.add(homeover);

    deadrat.on(EventTypes.PointerDown, () => {
      window.location.reload();
    });

    this.add(screen);

    this.camera.strategy.lockToActor(screen);

    this.game.assets.goodendmusic.play();
  }
}