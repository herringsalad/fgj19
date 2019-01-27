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
    let windowAspectRatio = window.innerWidth / window.innerHeight;
    
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

    var x = canvasWidth / 2 + 100;
    // var y = Math.max(canvasHeight / 3, window.innerWidth / windowAspectRatio);
    var y = canvasHeight / 4;
    let mouseAspectRatio = 180 / 126;
    // var imageHeight = Math.floor(width * (this.logoHeight / this.logoWidth)); // OG height/width factor
    
    var oldAntialias = engine.getAntialiasing();
    // engine.setAntialiasing(true);
    // console.log(window.innerWidth);
    
    ctx.drawImage(this._image, x, y, y * mouseAspectRatio * 1.5, y * windowAspectRatio);
    
    // loading box
    // @ts-ignore
    if (!this.suppressPlayButton && this._playButtonShown) {
      engine.setAntialiasing(oldAntialias);
      return;
    }
    
    var progBarWidth = window.innerWidth * 0.75;
    var progBarPosX = window.innerWidth / 2 - progBarWidth / 2;
    var progBarPosY = window.innerHeight * .7;
    
    ctx.lineWidth = 2;
    DrawUtil.roundRect(ctx, progBarPosX, progBarPosY, progBarWidth, 20, 10);
    // @ts-ignore
    var progress = progBarWidth * (this._numLoaded / this._resourceCount);
    var margin = 5;
    var progressWidth = progress - margin * 2;
    var height = 20 - margin * 2;
    // @ts-ignore
    DrawUtil.roundRect(ctx, progBarPosX + margin, progBarPosY + margin, progressWidth > 0 ? progressWidth : 0, height, 5, null, Color.White);
    // engine.setAntialiasing(oldAntialias);
  }
}