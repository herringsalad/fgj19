import * as ex from 'excalibur';
import {Engine, EventTypes, Label, PostUpdateEvent, Vector} from 'excalibur';
import {Mold, newMold} from './mold';
import {Player} from './player';
import {CheeseMap} from './cheeseMap';

const width = 1280;
const height = 1080;

/*
const moldmusicvol = 0; // 0.7;
const musicvol = 0; //1;
/*/
const moldmusicvol = 0.7;
const musicvol = 1;

//*/

export class Game extends Engine {
  width = 1280;
  height = 1080;

  assets = {
    fgTilefile: new ex.Texture('/assets/Kolo tiles.png'),
    bgTilefile: new ex.Texture('/assets/Tausta tiles.png'),
    moldTilefile: new ex.Texture('/assets/Home kolo tiles.png'),
    semimoldTilefile: new ex.Texture('/assets/Semihome kolo tiles.png'),
    moldTexture: new ex.Texture('/assets/Itiö sprites (10x10).png'),
    mouseTexture: new ex.Texture('/assets/Mouse sprites.png'),
    music: new ex.Sound('/assets/juustoa.ogg'),
    moldmusic: new ex.Sound('/assets/homejuustoa.ogg')
  };

  rows = 20;
  cols = 20;
  tileMap: CheeseMap;
  timer: number;
  moldcount = 0;
  score = 0;
  scoreLabel: ex.Label;

  constructor() {
    super({
      width: width,
      height: height
    });
  }

  modVolume = (event: PostUpdateEvent) => {
    this.assets.moldmusic.volume = Math.min(
      moldmusicvol,
      this.assets.moldmusic.volume + event.delta / 4000
    );
    this.assets.music.volume = Math.max(
      0,
      this.assets.music.volume - event.delta / 4000
    );
    if (
      this.assets.moldmusic.volume < moldmusicvol - 0.01 ||
      this.assets.music.volume > 0
    ) {
      game.once(EventTypes.PostUpdate, this.modVolume);
    }
  };

  findCheese = (pos: Vector, maxMold: number) => {
    return this.tileMap.findCheese(pos, maxMold);
  };

  addScore = (points: number) => {
    this.score += points;
  };

  start() {
    this.timer = 0;
    this.score = 0;

    this.assets.music.volume = musicvol;
    this.assets.moldmusic.volume = 0;

    game.on(EventTypes.PostUpdate, event => {
      if (!event) return;

      this.scoreLabel.text = `Score: ${this.score}`;

      this.timer += event.delta;
      if (this.timer > 2000 && this.tileMap.hasCheese()) {
        this.timer = 0;
        this.moldcount += 1;
        if (this.moldcount == 25) {
          game.once(EventTypes.PostUpdate, this.modVolume);
        }
        const sheet = new ex.SpriteSheet(game.assets.moldTexture, 1, 3, 10, 10);
        const anim = sheet.getAnimationForAll(game, 500);
        newMold(this, anim, () => {
          console.log("mold kill");
          this.moldcount -= 1;
        });
      }
    });

    // Loads all assets
    const loader = new ex.Loader([
      ...Object.keys(this.assets).map(textureName => this.assets[textureName])
    ]);
    return super.start(loader).then(() => {
      this.tileMap = new CheeseMap(this, {
        x: 0,
        y: 0,
        cellWidth: 32,
        cellHeight: 32,
        rows: this.rows * 2,
        cols: this.cols * 2
      });
      this.add(this.tileMap);

      this.scoreLabel = new Label('Hello world', -10, -10, '10px Arial');
      this.add(this.scoreLabel);

      const player = new Player(
        new Vector(300, 300),
        this.assets.mouseTexture,
        this.tileMap.eatCheese,
        this.tileMap

      );
      game.currentScene.camera.strategy.lockToActor(player);

      this.add(player);

      // Start game
      this.assets.music.play();
      this.assets.moldmusic.play();
      this.assets.music.loop = true;
      this.assets.moldmusic.loop = true;
    });
  }
}

const game = new Game();
game.start();
