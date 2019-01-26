import {
  Engine,
  EventTypes,
  Label,
  PostUpdateEvent,
  SpriteSheet,
  TileMap,
  TileSprite,
  Vector,
  ParticleEmitter,
  Loader,
  Texture,
  Sound
} from 'excalibur';
import { newMold } from './mold';
import { Player } from './player';
import { CheeseMap } from './cheeseMap';

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
    fgTilefile: new Texture('/assets/images/Kolo tiles.png'),
    bgTilefile: new Texture('/assets/images/Tausta tiles.png'),
    moldTilefile: new Texture('/assets/images/Home kolo tiles.png'),
    cheeseParticles: new Texture(
      '/assets/images/Particulate cheese sprites (10x10).png'
    ),
    semimoldTilefile: new Texture('/assets/images/Semihome kolo tiles.png'),
    bgFile: new Texture('/assets/images/Lattia tiles.png'),
    moldTexture: new Texture('/assets/images/Itiö sprites (10x10).png'),
    mouseTexture: new Texture('/assets/images/Mouse sprites.png'),
    music: new Sound('/assets/sounds/juustoa.ogg'),
    moldmusic: new Sound('/assets/sounds/homejuustoa.ogg'),
    mouseSqueak: new Sound('assets/sounds/Hiirulainen.wav'),
    mouseEat: new Sound('assets/sounds/MumsMums.wav'),
    moldParty: new Sound('assets/sounds/Homeitio.wav')
  };

  rows = 20;
  cols = 20;
  tileMap: CheeseMap;
  timer: number;
  moldcount = 0;
  score = 0;
  scoreLabel: Label;
  particleEmitter: ParticleEmitter;

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
        const sheet = new SpriteSheet(game.assets.moldTexture, 1, 3, 10, 10);
        const anim = sheet.getAnimationForAll(game, 500);
        newMold(this, anim, this.assets.moldParty, () => {
          this.moldcount -= 1;
        });
      }
    });

    // Loads all assets
    const loader = new Loader([
      ...Object.keys(this.assets).map(textureName => this.assets[textureName])
    ]);

    return super.start(loader).then(() => {
      const bgSize = 64;
      const bg = new TileMap({
        x: -700,
        y: -700,
        cellWidth: 64,
        cellHeight: 64,
        rows: bgSize,
        cols: bgSize
      });
      const bgTiles = new SpriteSheet(game.assets.bgFile, 1, 1, 64, 64);
      bg.registerSpriteSheet('wood', bgTiles);
      for (let i = 0; i < bgSize; i++) {
        for (let h = 0; h < bgSize; h++) {
          bg.getCellByIndex(i * bgSize + h).pushSprite(
            new TileSprite('wood', 0)
          );
        }
      }
      this.add(bg);

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

      const player = new Player(new Vector(300, 300), this.assets.mouseTexture, this.assets.mouseSqueak, this.assets.mouseEat);
      game.currentScene.camera.strategy.lockToActor(player);

      this.add(player);

      const particleSprite = new SpriteSheet(
        this.assets.cheeseParticles,
        1,
        3,
        10,
        10
      );

      this.particleEmitter = new ParticleEmitter({
        startSize: 1,
        endSize: 0.5,
        randomRotation: true,
        maxVel: 20,
        maxAngle: Math.PI * 2,
        minVel: 5,
        numParticles: 3,
        emitRate: 4,
        fadeFlag: true,
        particleLife: 1000,
        opacity: 1,
        isEmitting: false
      });

      // @ts-ignore: this works fine ¯\_(ツ)_/¯
      this.particleEmitter.particleSprite = particleSprite.getAnimationForAll(
        game,
        250
      );

      this.add(this.particleEmitter);

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
