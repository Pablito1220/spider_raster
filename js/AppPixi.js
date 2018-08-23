'use strict';

const DIMENSION = {
  'width': 800,
  'height': 800,
};
const FOLDER = './sequence9/';
const PREFIX = 'Walking_Spider';
const EXT = '.jpg';
const MAX = 34;
const PARTICLE_AMOUT = 10000;
let SPEED = 2;
const PI = 3.14;

const chillAudio = new Audio('chillAudio.mp3');
const scaryAudio = new Audio('scaryAudio.mp3');
const punchAudio = new Audio('punchAudio.mp3');

const SCREEN = {
  'width': window.innerWidth,
  'height': window.innerHeight,

};
const OFFSET = {
  'x': (SCREEN.width - DIMENSION.width) / 2,
  'y': (SCREEN.height - DIMENSION.height) / 2,
};

// const click = false;

class App {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = DIMENSION.width;
    this.canvas.height = DIMENSION.height;
    this.ctx = this.canvas.getContext('2d');
    // document.body.appendChild(this.canvas);
    this.allImages = [];
    this.loadImage(0);
    this.counter = 0;
    this.line = new PIXI.Graphics();
    this.click = true;
    chillAudio.play();
    this.increment = 0;
    this.midx = SCREEN.width / 2;
    this.midy = SCREEN.height / 2;
  }

  loadImage(id) {
    this.img = new Image();
    this.img.onload = (function(e) {
                        this.allImages.push(this.img);
                        id++;
                        if (id < MAX) {
                          this.loadImage(id);
                        } else {
                          id = 0;
                          // console.log(this.allImages);
                          this.onAllImagesLoaded();
                        }
                      }).bind(this);
    this.img.src = FOLDER + PREFIX + id + EXT;
  }
  onAllImagesLoaded(e) {
    this.PX = new PIXI.Application(
        window.innerWidth, window.innerHeight, {antialias: true});
    document.body.appendChild(this.PX.view);
    this.PX.renderer.backgroundColor = 0xF4CDA5;
    this.PX.view.addEventListener('click', this.onClick.bind(this));

    this.allGraphics = [];
    this.allLineGraphics = [];

    this.sprites = new PIXI.particles.ParticleContainer(PARTICLE_AMOUT, {
      scale: true,
      position: true,
      rotation: true,
      alpha: true,
    });

    this.sprites2 = new PIXI.particles.ParticleContainer(PARTICLE_AMOUT, {
      scale: true,
      position: true,
      rotation: true,
      alpha: true,
    });

    for (let i = 0; i < PARTICLE_AMOUT; i++) {
      let graphic = PIXI.Sprite.fromImage('line.png');
      this.allGraphics.push(graphic);
      this.sprites.addChild(graphic);
      graphic.anchor.set(1);
      graphic.scale.set(0.1);
      graphic.alpha = 0.3;
      graphic.rotation = 0.5 * PI;
      graphic.col = {'r': 0, 'g': 0, 'b': 0};
      graphic.isBlue = function() {
        return this.col.b > 100 && this.col.r < 200 && this.col.g < 200;
      };

      let graphicLine = PIXI.Sprite.fromImage('line.png');
      this.allLineGraphics.push(graphicLine);
      this.sprites2.addChild(graphicLine);
      graphicLine.col = {'r': 0, 'g': 0, 'b': 0};
      graphicLine.isBlue = function() {
        return this.col.b > 100 && this.col.r < 200 && this.col.g < 200;
      };
      graphicLine.anchor.set(1);
      graphicLine.alpha = 0.1;
    }

    this.PX.stage.addChild(this.sprites2);
    this.PX.stage.addChild(this.sprites);
    this.PX.ticker.add(this.draw, this);
  }
  rgbToHex(r, g, b) {
    let bin = r << 16 | g << 8 | b;
    return (function(h) {
      return new Array(7 - h.length).join('0') + h;
    })(bin.toString(16).toUpperCase());
  }
  mapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }
  updateCanvas() {
    if (this.counter % SPEED == 0) {
      let shifted = this.allImages.shift();
      this.ctx.clearRect(0, 0, DIMENSION.width, DIMENSION.height);
      this.ctx.drawImage(shifted, 0, 0);
      this.imageDatas =
          this.ctx.getImageData(0, 0, shifted.width, shifted.height);
      this.allImages.push(shifted);
    }
    if (this.counter < 300 * 100) {
      this.counter++;
    } else {
      this.counter = 0;
    }
  }
  processData() {
    for (let i = 0; i < this.allGraphics.length; i++) {
      this.allGraphics[i].y = 0;
      this.allGraphics[i].x = 0;
    }
    for (let y = 0; y < DIMENSION.height; y += 4) {
      for (let x = 0; x < DIMENSION.width; x += 4) {
        let index = (y * DIMENSION.width + x) * 4;
        let red = this.imageDatas.data[index];
        let green = this.imageDatas.data[index + 1];
        let blue = this.imageDatas.data[index + 2];
        let brightness = Math.round(red * 0.3 + green * 0.59 + blue * 0.11);

        if (brightness > 10) {
          let shifted = this.allGraphics.shift();
          let degrade = this.mapRange(y, 0, DIMENSION.height * 0.68, 0, 255);
          shifted.tint = '0x' + this.rgbToHex(0, 0, 0);
          shifted.x = x + window.innerWidth / 2 - 400;
          shifted.y = y + window.innerHeight / 2 - 400;
          shifted.col = {'r': red, 'g': green, 'b': blue};
          shifted.isBlue = function() {
            return this.col.b > 100 && this.col.r < 200 && this.col.g < 200;
          };
          this.allGraphics.push(shifted);
        }
      }
    }

    for (let y = 0; y < DIMENSION.height; y += 6) {
      for (let x = 0; x < DIMENSION.width; x += 6) {
        let index = (y * DIMENSION.width + x) * 4;
        let red = this.imageDatas.data[index];
        let green = this.imageDatas.data[index + 1];
        let blue = this.imageDatas.data[index + 2];
        let brightness = Math.round(red * 0.3 + green * 0.59 + blue * 0.11);
        if (brightness > 10) {
          let shiftedLine = this.allLineGraphics.shift();
          shiftedLine.originx = x;
          shiftedLine.originy = y;
          if (!this.click) {
            // let degrade =
            //     this.mapRange(shiftedLine.x, 0, DIMENSION.width, 0, 255);
            shiftedLine.tint = '0x' + this.rgbToHex(0, 0, 0);

            shiftedLine.x = x + 50 + window.innerWidth / 2 - 400;
            shiftedLine.y = y + window.innerHeight / 2 - 400;
            shiftedLine.col = {'r': red, 'g': green, 'b': blue};
            shiftedLine.isBlue = function() {
              return this.col.b > 200 && this.col.r < 200 && this.col.g < 200;
            };
            shiftedLine.rotation = Math.sin(this.counter * 0.4);
          } else {
            shiftedLine.rotation += Math.random();
          }
          this.allLineGraphics.push(shiftedLine);
        }
      }
    }
  }
  moveParticles() {
    for (let i = 0; i < PARTICLE_AMOUT; i++) {
      let lp = this.allLineGraphics[i];
      let p = this.allGraphics[i];

      let x = lp.originx;
      let y = lp.originy;

      let index = (y * DIMENSION.width + x) * 4;
      let red = this.imageDatas.data[index];
      let green = this.imageDatas.data[index + 1];
      let blue = this.imageDatas.data[index + 2];
      lp.x -= 5;
      if (this.click) {
        lp.y += (Math.random() - 0.5) * this.midy * 0.1;
        let s = this.mapRange(this.increment, 0, 100, 0.8, 0);
        lp.scale.set(s);
        // lp.scale.x = lp.scale.x * 0.1;
        // lp.scale.y = lp.scale.y * 0.1;
        // lp.rotation = Math.sin(this.counter * 0.1);
      }
      if (this.click) {
        SPEED = 2;
        if (lp.isBlue()) {
          // lp.scale.set(1);
          // lp.tint = '0x' + this.rgbToHex(0, 0, 255);
          // this.allLineGraphics[i].y = 20;
        } else {
          lp.scale.set(0.01);
          // lp.tint = '0x' + this.rgbToHex(0, 0, 0);
        }
        if (p.isBlue()) {
          // p.scale.set(0.01);
          p.scale.set(0.4);
        } else {
          p.scale.set(0.4);
        }
      } else if (!this.click) {
        SPEED = 1;
        if (lp.isBlue()) {
          lp.x -= 10;
          lp.y += Math.sin(this.counter * 0.1);
          let taille = this.mapRange(
              lp.x, DIMENSION.width * 0.8, DIMENSION.width * 0.1, 0, 1.2);
          lp.scale.set(1);
        } else {
          lp.scale.set(0.01);
        }
        if (p.isBlue()) {
          p.scale.set(0.0);
        } else {
          p.scale.set(0.4);
        }
      }
    }
  }
  onClick(e) {
    this.click = true;
    scaryAudio.pause();
    scaryAudio.load();
    punchAudio.play();
    chillAudio.play();

  }
  draw() {
    if (this.counter % 500 == 0 && this.counter != 0) {
      this.click = false;
      chillAudio.pause();
      chillAudio.load();
      scaryAudio.play();
      
    }
    if (this.click && this.increment < 100) {
      this.increment++;
    } else if (this.click && this.increment >= 100) {
      this.increment = this.increment;
    } else {
      this.increment = 0;
    }
    // console.log(this.increment);
    this.updateCanvas();
    this.processData();
    this.moveParticles();
  }
}


window.onload = function() {
  window.app = new App();
};
