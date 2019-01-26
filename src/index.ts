import * as ex from 'excalibur';
import {
  Cell,
  PostUpdateEvent,
  EventTypes,
  Vector,
  Engine,
  DisplayMode
} from 'excalibur';
import { Mold, newMold } from './mold';
import { Player } from './player';
import { CheeseMap } from './cheeseMap';

const width = 1280;
const height = 1080;

const moldmusicvol = 0 // 0.7;
const musicvol = 0 //1;

export class Game extends Engine {
  width = 1280;
  height = 1080;

  assets = {
    fgTilefile: new ex.Texture('/assets/Kolo tiles.png'),
    bgTilefile: new ex.Texture('/assets/Tausta tiles.png'),
    moldTilefile: new ex.Texture('/assets/Home kolo tiles.png'),
    mouseTexture: new ex.Texture('/assets/mouse.png'),
    music: new ex.Sound('/assets/juustoa.ogg'),
    moldmusic: new ex.Sound('/assets/homejuustoa.ogg')
  };

  rows = 20;
  cols = 20;
  tileMap: CheeseMap;
  timer: number;
  moldcount = 0;

  constructor() {
    super({
      width: width,
      height: height,
      displayMode: DisplayMode.FullScreen
    });
  }

  modVolume = (event: PostUpdateEvent) => {
    console.log(this.assets.moldmusic.volume, this.assets.music.volume);
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

  findCheese = (pos: Vector) => {
    return this.tileMap.findCheese(pos);
  };

  start() {
    this.timer = 0;

    this.assets.music.volume = musicvol;
    this.assets.moldmusic.volume = 0;

    game.on(EventTypes.PostUpdate, event => {
      if (!event) return;

      this.timer += event.delta;
      if (this.timer > 2000 && this.tileMap.hasCheese()) {
        this.timer = 0;
        this.moldcount += 1;
        if (this.moldcount == 10) {
          game.once(EventTypes.PostUpdate, this.modVolume);
        }
        newMold(this);
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

      const player = new Player(
        new Vector(300, 300),
        this.assets.mouseTexture,
        this.tileMap.eatCheese,
        this.tileMap
      );
      game.currentScene.camera.strategy.lockToActor(player as any);

      this.add(player as any);

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
