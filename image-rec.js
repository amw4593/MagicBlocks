// holds the entire video capture, accesible as a p5 image object
let video;

// the updated data for all the squares
let dataArray = [];

// holds an array of objects that take a slice of image and run processes on it
let detectorArray = [];

// range of value for the colors
let colorRangeDark = 50;
let colorRangeLight = 150;

// rgb values for colors that the closestColor function picks between
let possibleColors = [
  [0, 255 - colorRangeDark, 255 - colorRangeDark], // cyan min 0
  [0, 255, 255], // cyan 1
  [colorRangeLight, 255, 255], // cyan max 2
  
  [255 - colorRangeDark, 255 - colorRangeDark, 0], // yellow min 3
  [255, 255, 0], // yellow 4
  [255, 255, colorRangeLight], // yellow max 5
  
  [255 - colorRangeDark, 0, 255 - colorRangeDark], // magenta min 6
  [255, 0, 255], // magenta 7
  [255, colorRangeLight, 255], // magenta max 8
  
  [255, 255, 255], // white 9
  [0, 0, 0], // black  10
];

// canvas and camera feed dimensions
let cWidth = 1280 * 2;
let cHeight = 0.5625 * cWidth;

// position and scale values for the paper in the frame
let paper = {
  x: 800,
  y: 1000,
  w: 340,
};

// holds the length of an "inch" of paper in pixels
let inch = paper.w / 11;

// Classifier Variable
  let classifier;

// Model URL
  let imageModelURL = 'https://teachablemachine.withgoogle.com/models/FIJhicqHN/';

function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
  }

function setup() {
  createCanvas(cWidth, cHeight);

  // capture constraints object
  let constraints = {
    flipped: true,
    video: {
      mandatory: {
        minWidth: cWidth,
        minHeight: cHeight,
        
      },
    },
    audio: false,
  };

  // creates a capture object in the dom and then hides the dom version
  video = createCapture(constraints);
  video.hide();

  let index = 0;
  // creates capture objects in the array
  for (let y = 0; y < 3; y++) {
  for (let x = 0; x < 3; x++) {
      detectorArray.push(
        new Detector(
          paper.x + 0.5 * inch + x * 2.5 * inch,
          paper.y + 0.5 * inch + y * 2.5 * inch,
          2.5 * inch,
          2.5 * inch,
          index
        )
      );
      index++;
    }
  }
}

function draw() {
  background(0);

  image(video, 0, 0, video.width, video.height);

  // draw the paper bounding box
  noFill();
  stroke("lime");
  strokeWeight(2);
  rect(paper.x, paper.y, 8.5 * inch, 11 * inch);


  // display all the detectors
  for (let i = 0; i < detectorArray.length; i++) {
    detectorArray[i].display();
  }
}

// on key press update all of the detectors and run their processes
// no params
// we can change this event as needed
function keyPressed() {
  for (let i = 0; i < detectorArray.length; i++) {
    detectorArray[i].update();
  }
}


// loops through a provided array of colors and finds which index is closest to the first parameter
// params:
//   c - (p5 color object) the color to check
//   colors - (array of arrays) the possible colors to pick from
// returns real, array index
function closestColor(c, colors) {
  // the minimum distance as it loops through
  let currentMin = 999999;
  
  // current closest index
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

// classification and callback functions, called from each detector object
function classifyShape(img, detector) {
  classifier.classify(img, (results, error) => {
    if (error) {
    let shape = error[0].label;
    
    detectorArray[detector].shape = shape;
    detectorArray[detector].shapeIn = true;
    detectorArray[detector].colorUpdate();
    } else {
    let shape = results[0].label;
    
    detectorArray[detector].shape = shape;
    detectorArray[detector].shapeIn = true;
    detectorArray[detector].colorUpdate();
    }
  });
}


// detector class creates and stores a p5 image object, then runs a color recognition and a teachable machine process on it to
// get color and shape data and store it as properties

// params:
//   x - (real) x coordinate of the top left corner
//   y - (real) y coordinate of the top left corner
//   w - (real) width of the slice
//   h - (real) height of the slice
class Detector {
  constructor(x, y, w, l, index) {
    this.x = round(x);
    this.y = round(y);
    this.w = round(w);
    this.l = round(l);
    this.index = index;
    this.socket = io();
    
    // gets some measurments for the smaller average slice;
    this.padding = 0.2;
    this.subW = round((this.w - (this.w * this.padding)) / 3);
    
    //console.log(this.x + ", " + this.y + ", " + this.w + ", " + this.l)

    // color values of the detected color and the name of the closest color
    this.r = 0;
    this.g = 0;
    this.b = 0;
    
    
    // holds whether the shape has been recognized
    this.shapeIn = false;

    // stores the slice image
    this.slice = 0;
    
    //final values
    this.col = "white";
    this.shape = "blank"
    
  }

  update() {
    this.shapeIn = false;
    
    // creates the slice
    let subImg = video.get(this.x, this.y, this.w, this.l);
    
    // runs the machine learning
    classifyShape(subImg, this.index);
    
    this.slice = subImg;
  }
  
  colorUpdate() {
    // position modifier based on shape type
    let modX = 0;
    let modY = 0;
    switch (this.shape) {
      case "square":
        modX = this.subW;
        modY = this.subW;
        break;
      case "triTL":
        modX = 0;
        modY = 0;
        break;
      case "triTR":
        modX = 2 * this.subW;
        modY = 0;
        break;
      case "triBL":
        modX = 0;
        modY = 2 * this.subW;
        break;
      case "triBR":
        modX = 2 * this.subW;
        modY = 2 * this.subW;
        break;
      default:
        modX = this.subW;
        modY = this.subW;
        break;
    }
    
    let paddingPx = round(this.padding * this.w * 0.5);
    let subImg = this.slice.get(paddingPx + modX,
                               paddingPx + modY,
                               this.subW,
                               this.subW);
    
     //subImg = this.slice;
    
    // an array of all the pixels un the slice
     subImg.loadPixels();

    // declares the average variables before running
    let avgRed = 0, avgGreen = 0, avgBlue = 0;

    for (let y = 0; y < subImg.height; y++) {
      for (let x = 0; x < subImg.width; x++) {
        // calculate the pixel index
        const index = (y * subImg.width + x) * 4;
        
        
        // sum the red, green, and blue values
        avgRed += subImg.pixels[index + 0];
        avgGreen += subImg.pixels[index + 1];
        avgBlue += subImg.pixels[index + 2];
      }
    }
    
    
    // closes the pixel array
    subImg.updatePixels();
    
    // the total number of pixels
    let numPixels = subImg.pixels.length / 4;

    
    avgRed /= numPixels;
    avgGreen /= numPixels;
    avgBlue /= numPixels;

    
    this.r = avgRed;
    this.g = avgGreen;
    this.b = avgBlue;
    
    
  
    // runs the closest color function
    let closest = closestColor(color(this.r, this.g, this.b), possibleColors);
    this.col = closest < 3 ? "cyan" : closest < 6 ? "yellow" : closest < 9 ? "magenta" : "white";
    
    this.updateDataArray();
  }

  display() {
    
    
    // display the bounding box in the average color
    noFill();
    stroke(color(this.r, this.g, this.b));
    strokeWeight(2);
    rect(this.x, this.y, this.w, this.l);
    
    // color detector box
    let modX = 0;
    let modY = 0;
    switch (this.shape) {
      case "square":
        modX = this.subW;
        modY = this.subW;
        break;
      case "triTL":
        modX = 0;
        modY = 0;
        break;
      case "triTR":
        modX = 2 * this.subW;
        modY = 0;
        break;
      case "triBL":
        modX = 0;
        modY = 2 * this.subW;
        break;
      case "triBR":
        modX = 2 * this.subW;
        modY = 2 * this.subW;
        break;
      default:
        modX = this.subW;
        modY = this.subW;
        break;
    }
    
    let paddingPx = round(this.padding * this.w * 0.5);
    rect(this.x + paddingPx + modX,
                              this.y + paddingPx + modY,
                               this.subW,
                               this.subW);

    
    // label the color
    noStroke();
    fill(this.col);
    text(this.col + " "  + this.shape, this.x + 10, this.y + 10);

  }
  
  updateDataArray() {
    dataArray[this.index] = [this.col, this.shape];
    this.socket.emit('newData', dataArray);
  }
}