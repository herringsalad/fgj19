import {Color, ILoadable, Loader} from "excalibur";
import {logo} from "./logo";
import {DrawUtil} from "excalibur/dist/Util/Index";

export class Splash extends Loader {
  constructor(loadables: ILoadable[]) {
    super(loadables);
    this.logo = logo;
    this.logoWidth = 600;
    this.logoHeight = 600;
    this.backgroundColor = '#FFD132';
  }

  startButtonFactory = () => {
    const buttonElement = document.createElement('button');
    buttonElement.textContent = "";
    buttonElement.id = 'start-button';
    buttonElement.style.display = 'none';
    buttonElement.style.alignContent = 'none';
    return buttonElement;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // @ts-ignore
    const engine = this._engine;
    let canvasHeight = engine.canvasHeight / window.devicePixelRatio;
    let canvasWidth = engine.canvasWidth / window.devicePixelRatio;

    if (this._playButtonRootElement) {
      let left = ctx.canvas.offsetLeft ;
      let top = ctx.canvas.offsetTop;
      let buttonWidth = this._playButton.clientWidth;
      let buttonHeight = this._playButton.clientHeight;
      this._playButtonRootElement.style.left = `${left + canvasWidth / 2 - buttonWidth / 2}px`;
      this._playButtonRootElement.style.top = `${top + canvasHeight / 2 - buttonHeight / 2 + 100}px`;
    }

    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    var y = canvasHeight + 300;
    var width = Math.min(this.logoWidth, canvasWidth * 0.75);
    var x = canvasWidth / 2 + 100;

    var imageHeight = Math.floor(width * (this.logoHeight / this.logoWidth)); // OG height/width factor
    var oldAntialias = engine.getAntialiasing();
    engine.setAntialiasing(true);

    ctx.drawImage(this._image, 0, 0, this.logoWidth, this.logoHeight, x, y - imageHeight - 20, width + 50, imageHeight + 50);

    // loading box
    // @ts-ignore
    if (!this.suppressPlayButton && this._playButtonShown) {
      engine.setAntialiasing(oldAntialias);
      return;
    }

    ctx.lineWidth = 2;
    DrawUtil.roundRect(ctx, x, y, width, 20, 10);
    // @ts-ignore
    var progress = width * (this._numLoaded / this._resourceCount);
    var margin = 5;
    var progressWidth = progress - margin * 2;
    var height = 20 - margin * 2;
    // @ts-ignore
    DrawUtil.roundRect(ctx, x + margin, y + margin, progressWidth > 0 ? progressWidth : 0, height, 5, null, Color.White);
    engine.setAntialiasing(oldAntialias);
  }
}