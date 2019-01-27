import { Color, ILoadable, Loader, Engine, Label, Actor } from 'excalibur';
import { logo } from './logo';
import { DrawUtil } from 'excalibur/dist/Util/Index';

export class Splash extends Loader {
  constructor(loadables: ILoadable[]) {
    super(loadables);
    this.logo = logo;
    this.logoWidth = 600;
    this.logoHeight = 600;
    this.backgroundColor = 'rgb(245, 209, 1)';
  }

  startButtonFactory = () => {
    const buttonElement = document.createElement('button');
    buttonElement.textContent = '';
    buttonElement.id = 'start-button';
    buttonElement.style.display = 'none';
    buttonElement.style.alignContent = 'none';
    return buttonElement;
  };

  public draw(ctx: CanvasRenderingContext2D) {
    const engine: Engine = (this as any)._engine;
    let canvasHeight = engine.canvasHeight / window.devicePixelRatio;
    let canvasWidth = engine.canvasWidth / window.devicePixelRatio;
    let windowAspectRatio = window.innerWidth / window.innerHeight;

    if (this._playButtonRootElement) {
      let left = ctx.canvas.offsetLeft;
      let top = ctx.canvas.offsetTop;
      let buttonWidth = this._playButton.clientWidth;
      let buttonHeight = this._playButton.clientHeight;
      this._playButtonRootElement.style.left = `${left +
        canvasWidth / 2 -
        buttonWidth / 2}px`;
      this._playButtonRootElement.style.top = `${top +
        canvasHeight / 2 -
        buttonHeight / 2 +
        100}px`;
    }

    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    var x = canvasWidth / 2 + 100;
    // var y = Math.max(canvasHeight / 3, window.innerWidth / windowAspectRatio);
    var y = canvasHeight / 4;
    let mouseAspectRatio = 180 / 126;
    // var imageHeight = Math.floor(width * (this.logoHeight / this.logoWidth)); // OG height/width factor

    var oldAntialias = engine.getAntialiasing();
    // engine.setAntialiasing(true);
    // console.log(window.innerWidth);

    ctx.drawImage(
      this._image,
      x,
      y,
      y * mouseAspectRatio * 1.5,
      y * windowAspectRatio
    );

    let credPos = 400;

    ctx.fillStyle = '#000000';
    ctx.font = '12px monospace';

    const pushCred = (content: string) => {
      ctx.fillText(content, 50, credPos);
      credPos += 20;
    };

    pushCred('Credits');
    pushCred('Rasmus Eskola, programming');
    pushCred('Jaakko Hannikainen, programming');
    pushCred('Henrik Hillner, programming');
    pushCred('Susanna Rantakylä, music and sound effects');
    pushCred('Nils Skogman, graphics');

    // loading box
    if (!this.suppressPlayButton && (this as any)._playButtonShown) {
      engine.setAntialiasing(oldAntialias);
      return;
    }

    var progBarWidth = (ctx.canvas.clientWidth * 0.7) / 2;
    var progBarPosX = ctx.canvas.clientWidth / 2 - progBarWidth * 1.25;
    var progBarPosY = (ctx.canvas.clientHeight * 0.1) / 2;

    ctx.lineWidth = 2;
    DrawUtil.roundRect(ctx, progBarPosX, progBarPosY, progBarWidth, 20, 10);
    var progress =
      progBarWidth * ((this as any)._numLoaded / (this as any)._resourceCount);
    var margin = 5;
    var progressWidth = progress - margin * 2;
    var height = 20 - margin * 2;

    DrawUtil.roundRect(
      ctx,
      progBarPosX + margin,
      progBarPosY + margin,
      progressWidth > 0 ? progressWidth : 0,
      height,
      5,
      undefined,
      Color.White
    );
    // engine.setAntialiasing(oldAntialias);
  }
}
