import {
  Actor,
  Color,
  Engine,
  EventTypes,
  Label,
  ParticleEmitter,
  Sound,
  SpriteSheet,
  Texture,
  TileMap,
  TileSprite,
  Vector,
  PostUpdateEvent,
  Sprite,
  Scene
} from 'excalibur';
import { Mold, newMold } from './mold';
import { Player } from './player';
import { CheeseMap } from './cheeseMap';
import { Splash } from './loader';
import { EndScene } from './endscene';

const width = 1920 / 2;
const height = 1080 / 2;

/*
const moldmusicvol = 0; // 0.7;
const musicvol = 0; //1;
/*/
const moldmusicvol = 0.7;
const musicvol = 1;

//*/

export class Game extends Engine {
  width = width;
  height = height;

  assets = {
    fgTilefile: new Texture('/assets/images/Kolo tiles.png'),
    brokenCheeseTilefile: new Texture('assets/images/Syöty kolo tiles.png'),
    bgTilefile: new Texture('/assets/images/Tausta tiles.png'),
    moldTilefile: new Texture('/assets/images/Home kolo tiles.png'),
    cheeseParticles: new Texture(
      '/assets/images/Particulate cheese sprites (10x10).png'
    ),
    semimoldTilefile: new Texture('/assets/images/Semihome kolo tiles.png'),
    bgFile: new Texture('/assets/images/Lattia tiles.png'),
    furniture: new Texture('/assets/images/Sisustus.png'),
    moldTexture: new Texture('/assets/images/Itiö sprites (10x10).png'),
    mouseTexture: new Texture('/assets/images/Mouse sprites (45x39).png'),

    deadMouse: new Texture('/assets/images/Restrat big.png'),
    homeover: new Texture('/assets/images/Game over.png'),
    fatMouse: new Texture('/assets/images/Fatstart big.png'),
    moldover: new Texture('/assets/images/Mold over.png'),

    music: new Sound('/assets/sounds/juustoa.ogg'),
    moldmusic: new Sound('/assets/sounds/homejuustoa.ogg'),
    goodendmusic: new Sound('/assets/sounds/loppujuustoa.ogg'),
    badendmusic: new Sound('/assets/sounds/luuserijuustoa.ogg'),

    mouseSqueak: new Sound('assets/sounds/hiirulainen.ogg'),
    mouseEat: new Sound('assets/sounds/mumsmums.ogg'),
    moldParty: new Sound('assets/sounds/homeitio.ogg'),
    moldDed: new Sound('assets/sounds/homepois.ogg')
  };

  rows = 20;
  cols = 20;
  tileMap: CheeseMap;
  timer: number;
  moldcount = 0;
  score = 0;
  scoreLabel: Label;
  moldLabel: Label;
  particleEmitter: ParticleEmitter;
  player: Player;
  molds: Mold[] = [];
  active = false;

  constructor() {
    super({
      width: width,
      height: height
    });

    this.setAntialiasing(false);
  }

  modVolume = (delta: number) => {
    const step = delta / 4000;
    const targetMain = this.moldcount > 25 ? 0 : musicvol;
    const targetMold = this.moldcount > 25 ? moldmusicvol : 0;

    if (Math.abs(this.assets.moldmusic.volume - targetMold) > step) {
      if (this.assets.moldmusic.volume > targetMold) {
        this.assets.moldmusic.volume -= step;
      } else {
        this.assets.moldmusic.volume += step;
      }
    } else {
      if (this.assets.moldmusic.volume != targetMold) {
        this.assets.moldmusic.volume = targetMold;
      }
    }
    if (Math.abs(this.assets.music.volume - targetMain) > step) {
      if (this.assets.music.volume > targetMain) {
        this.assets.music.volume -= step;
      } else {
        this.assets.music.volume += step;
      }
    } else {
      if (this.assets.music.volume != targetMain) {
        this.assets.music.volume = targetMain;
      }
    }
  };

  findCheese = (pos: Vector, maxMold: number) => {
    return this.tileMap.findCheese(pos, maxMold);
  };

  addScore = (points: number) => {
    this.score += points;
  };

  activateGame = () => {
    this.active = true;
  };

  postUpdate = (event: PostUpdateEvent | undefined) => {
    if (!event) return;

    this.scoreLabel.text = `Score ${this.score} (needed: ${Math.max(
      0,
      10000 - this.score
    )})`;
    this.modVolume(event.delta);

    if (this.active) {
      this.timer += event.delta;
      if (this.timer > 2000 && this.tileMap.hasCheese()) {
        this.timer = 0;
        this.moldcount += 1;
        this.moldLabel.text = `Mold particle count: ${this.moldcount}`;
        const sheet = new SpriteSheet(game.assets.moldTexture, 1, 3, 10, 10);
        const anim = sheet.getAnimationForAll(game, 500);
        this.molds.push(
          newMold(
            this,
            anim,
            this.assets.moldDed,
            this.assets.moldParty,
            () => {
              this.moldcount -= 1;
              this.moldLabel.text = `Mold particle count: ${this.moldcount}`;
            }
          )
        );
      } else if (!this.tileMap.hasCheese()) {
        this.endGame();
      }
    }
  };

  postInit = () => {
    this.timer = 0;
    this.moldcount = 0;
    this.score = 0;
    this.active = false;

    const gameScene = new Scene(this);
    this.addScene('game', gameScene);

    this.assets.music.volume = musicvol;
    this.assets.moldmusic.volume = 0;

    game.on(EventTypes.PostUpdate, this.postUpdate);

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
        bg.getCellByIndex(i * bgSize + h).pushSprite(new TileSprite('wood', 0));
      }
    }
    gameScene.add(bg);

    const furniture = new Actor();
    furniture.addDrawing('furniture', this.assets.furniture.asSprite());
    furniture.pos = new Vector(705, 705);
    furniture.scale = new Vector(2, 2);
    gameScene.add(furniture);

    this.tileMap = new CheeseMap(this, {
      x: 0,
      y: 0,
      cellWidth: 32,
      cellHeight: 32,
      rows: this.rows * 2,
      cols: this.cols * 2
    });
    gameScene.add(this.tileMap);

    const scoreBg = new Actor(-150, -125, width, 20);
    scoreBg.color = Color.Black;
    this.scoreLabel = new Label('', 0, 5, 'monospace');
    this.scoreLabel.color = Color.White;
    this.moldLabel = new Label('', 200, 5, 'monospace');
    this.moldLabel.color = Color.White;

    const player = new Player(
      new Vector((width + 360) / 2, (height + 820) / 2),
      // new Vector(0, 0),
      this.assets.mouseTexture,
      this.assets.mouseSqueak,
      this.assets.mouseEat
    );
    scoreBg.add(this.scoreLabel);
    scoreBg.add(this.moldLabel);
    player.add(scoreBg);

    // best way of making room for player and furniture
    this.tileMap.deleteCheese(
      this.tileMap.cheeseAt((width + 380) / 2, (height + 800) / 2)!
    );
    this.tileMap.deleteCheese(
      this.tileMap.cheeseAt((width + 470) / 2, (height + 800) / 2)!
    );
    this.tileMap.deleteCheese(
      this.tileMap.cheeseAt((width + 380) / 2, (height + 900) / 2)!
    );
    this.tileMap.deleteCheese(
      this.tileMap.cheeseAt((width + 470) / 2, (height + 900) / 2)!
    );

    gameScene.camera.strategy.lockToActor(player);

    gameScene.add(player);
    this.player = player;

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

    // oddly enough typings won't let you pass animations to particleEmitters,
    // but they work just fine ¯\_(ツ)_/¯
    this.particleEmitter.particleSprite = (particleSprite.getAnimationForAll(
      game,
      250
    ) as unknown) as Sprite;

    gameScene.add(this.particleEmitter);

    //for (let i = 0; i < Math.max(width/64, height/64); i++) {
    //  const col = new Actor(i * 64, 0,
    //    1, height * 2, Color.White);
    //  game.add(col);
    //  const row = new Actor(0, i * 64,
    //    width * 2, 1, Color.White);
    //  game.add(row);
    //}

    // Start game
    this.assets.music.play();
    this.assets.moldmusic.play();
    this.assets.music.loop = true;
    this.assets.moldmusic.loop = true;

    this.goToScene('game');
  };

  start() {
    // Loads all assets
    const loader = new Splash([
      ...Object.keys(this.assets).map(textureName => this.assets[textureName])
    ]);

    const endscene = new EndScene(this);
    this.addScene('end', endscene);

    // this.isDebug = true;

    return super.start(loader).then(this.postInit);
  }

  restrat = () => {
    this.postInit();
  };

  endGame = () => {
    game.player.kill();
    this.molds.forEach(mold => mold.emit('stopsound'));
    game.off(EventTypes.PostUpdate);
    this.assets.music.stop();
    this.assets.moldmusic.stop();
    this.removeScene('game');
    this.goToScene('end');
  };
}

const game = new Game();
game.start();
