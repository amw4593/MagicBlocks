let video;
let detectorArray = [];
let scalar = 1;
let possibleColors = [
  [0, 255, 255], //cyan 0
  [255, 255, 0], //yellow 1
  [255, 0, 255], //magenta 2
  [255, 255, 255], //white 3
  [0, 0, 0], //black 4
];

function preload() {}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped:true});
  video.hide();

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      detectorArray.push(new ColorRec(75 + 125 * x, 75 + 125 * y, 125, 125));
    }
  }
}

function draw() {
  scalar = video.width / 640;
  background(0);
  //image(video, 0, 0, width, width * video.height / video.width);
  image(video, 0, 0, video.width, video.height);

  noStroke();
  fill("lime");
  text(video.width + ", " + video.height, 10, 10);

  noFill();
  stroke("lime");
  strokeWeight(10);
  rect(45 * scalar, 45 * scalar, 550 * scalar, 425 * scalar);

  //bounding box
  rect(75, 75, 375, 375);

  for (let i = 0; i < detectorArray.length; i++) {
    detectorArray[i].display();
  }
}

function keyPressed() {
  for (let i = 0; i < detectorArray.length; i++) {
    detectorArray[i].update();
  }
}

function closestColor(c, colors) {
  let currentMin = 999999;
  let currentClosest = 0;
  for (let i = 0; i < colors.length; i++) {
    let [r, g, b] = colors[i];
    let rgbDistance = dist(r, g, b, red(c), green(c), blue(c));
    if (rgbDistance < currentMin) {
      currentMin = rgbDistance;
      currentClosest = i;
    }
  }
  return currentClosest;
}

class ColorRec {
  constructor(x, y, w, l) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.l = l;

    this.r = 0;
    this.g = 0;
    this.b = 0;

    this.sub = 0;
    this.col = "white";
  }

  update() {
    let subImg = video.get(this.x, this.y, this.w, this.l);
    let pixArray = subImg.loadPixels();

    let avgRed = 0;
    let avgGreen = 0;
    let avgBlue = 0;

    for (let y = 0; y < subImg.height; y++) {
      for (let x = 0; x < subImg.width; x++) {
        // Calculate the pixel index
        const index = (y * subImg.width + x) * 4;

        // Sum the red, green, and blue values
        avgRed += subImg.pixels[index + 0];
        avgGreen += subImg.pixels[index + 1];
        avgBlue += subImg.pixels[index + 2];
      }
    }

    subImg.updatePixels();

    let numPixels = subImg.pixels.length / 4;

    avgRed /= numPixels;
    avgGreen /= numPixels;
    avgBlue /= numPixels;

    this.r = avgRed;
    this.g = avgGreen;
    this.b = avgBlue;

    let closest = closestColor(color(this.r, this.g, this.b), possibleColors);

    switch (closest) {
      case 0:
        this.col = "cyan";
        break;
      case 1:
        this.col = "yellow";
        break;
      case 2:
        this.col = "magenta";
        break;
      default:
        this.col = "white";
        break;
    }
  }

  display() {
    noFill();
    stroke(color(this.r, this.g, this.b));
    strokeWeight(10);
    rect(this.x, this.y, this.w, this.l);

    noStroke();
    // fill(color(this.r, this.g, this.b));
    // rect(this.x, this.y, this.w, this.l);

    fill(this.col);
    text(this.col, this.x + 10, this.y + 10);
    // if (this.sub != 0) {
    //   image(this.sub, this.x, this.y, this.w, this.l);
    // }
  }
}
