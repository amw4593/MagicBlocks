// temporary declaration. this array should be gotten from the dataArray variable in the recognizer
let detectorArray = [
  ["white", "blank"],
  ["cyan", "triBR"],
  ["magenta", "square"],
  
  ["cyan", "square"],
  ["yellow", "square"],
  ["yellow", "square"],
  
  
  ["cyan", "triBL"],
  ["yellow", "square"],
  ["magenta", "square"]
];

// array of shape objects
let shapeArray = [];

// media
let parts = {
  windows: [],
  doors: [],
  chimneys: [],
  roofs: [],
  scaffolds: [],
  tallPlants: [],
  shortPlants: [],
};
let windowArray = ["/media/doorA.gif"];

// units
let paperWidth = 1080;
let inch = 100;

// projection mapping objects
let pMapper;
let quadMap;
let whiteMap;


function preload() {
    
  for (let i = 0; i < windowArray.length; i++) {
    parts.windows[i] = loadImage(windowArray[i]);
  }
  
  
}


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // graphics buffers
  shapeBuffer = createGraphics(11 * inch, 8.5 * inch);
  decorBuffer = createGraphics(11 * inch, 8.5 * inch);
  projectionBuffer = createGraphics(11 * inch, 8.5 * inch);
  saveBuffer = createGraphics(8.5 * inch, 8.5 * inch); // this one can go to the neighborhood screen
  
  
  // create projection mappers
  pMapper = createProjectionMapper(this);
  quadMap = pMapper.createQuadMap(11 * inch, 8.5 * inch);
  whiteMap = pMapper.createPolyMap(4);
  pMapper.load("maps/map.json");
  
  let index = 0;
  // creates shape objects in the array
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      shapeArray.push(
        new Shape(
          0.5 * inch + x * 2.5 * inch,
          0.5 * inch + y * 2.5 * inch,
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

  decorBuffer.clear();

  // draw all of the shape arrays to the correct buffers
  for (let i = 0; i < shapeArray.length; i++) {
    shapeArray[i].display();
  }
  
  projectionBuffer.image(shapeBuffer, 0, 0);
  projectionBuffer.image(decorBuffer, 0, 0);

  // draw projection mapping
  whiteMap.display(color('white'));
  let scalar = 0.95;
  quadMap.displayTexture(projectionBuffer, 0, 0, 11 * inch * scalar, 8.5 * inch * scalar);
  
}

// projection mapping config controls
function keyPressed() {
    switch (key) {
        case 'c':
            pMapper.toggleCalibration();
            break;
        case 'f':
            let fs = fullscreen();
            fullscreen(!fs);
            break;
        case 'l':
            pMapper.load("maps/map.json");
            break;

        case 's':
            //pMapper.save("map.json");
            break;
    }
}

// auto resize canvas
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


// update all of the shapes from the detectorArray, idk where you wanna put this
function updateData() {
  for (let i = 0; i < shapeArray.length; i++) {
    shapeArray[i].updateShape();
  }
}

function easeOutElastic(x){
  const c4 = (2 * Math.PI) / 3;
  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

// interprets data and draws things to the proper buffers. this is what will do all the proc gen too
class Shape {
  constructor(x, y, size, index) {
    this.tl = [x, y]; // top left point
    this.tr = [x + size, y]; // top right point
    this.bl = [x, y + size]; // bottom left point
    this.br = [x + size, y + size];  // bottom right point

    this.center = [x + 0.5 * size, y + 0.5 * size];
    
    this.col = "white";
    this.shape = "blank";
    
    this.vertexArray = [];
    
    this.size = size;
    this.index = index;

    this.decorArray = [];
    
    this.updateShape();
  }
  
  updateShape() {
    this.decorArray = [];
    // gets data from the data array
    this.col = detectorArray[this.index][0];
    this.shape = detectorArray[this.index][1];
    
    // gets the proper vertices based on the shape type
    switch (this.shape) {
      case "square" :
        this.vertexArray = [this.tl, this.tr, this.br, this.bl];
        this.decorArray.push(new Decor(this.center[0], this.center[1], "window"));
        break;
      case "triTL" :
        this.vertexArray = [this.tl, this.tr, this.bl];
        break;
      case "triTR" :
        this.vertexArray = [this.tr, this.tl, this.br];
        break;
      case "triBL" :
        this.vertexArray = [this.bl, this.br, this.tl];
        break;
      case "triBR" :
        this.vertexArray = [this.br, this.bl, this.tr];
        break;
      default:
        this.vertexArray = [];
        break;
    }
  }
  
  display() {
    // draw basic shapes to the shapeBuffer
    //shapeBuffer.background(color(255, 255, 255, 59));
    shapeBuffer.noStroke();
    shapeBuffer.fill(this.col);
    shapeBuffer.beginShape();
      for (let i = 0; i < this.vertexArray.length; i++) {
        shapeBuffer.vertex(this.vertexArray[i][0], this.vertexArray[i][1]);
      }
    shapeBuffer.endShape(CLOSE);
    
    
    // draw placed animations to the decorBuffer
    decorBuffer.fill(0);
    decorBuffer.text(this.index, this.tr[0], this.tr[1]);
    for (let i = 0; i < this.decorArray.length; i++) {
      this.decorArray[i].display();
    }
  }
}

class Decor {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    
    this.scaling = 1;
    this.img = null;
    this.sound = null;
    
    this.scaling = 0;
    this.time = 0;
    this.timer = 0;
    this.start = random(10, 100);
    
    switch (this.type) {
      case "door":
        
        break;
      case "window":
        this.img = random(parts.windows);
        this.sound = null;
        break;
      case "chimney":
        
        break;
      case "triTLRoof":
        
        break;
      case "triTRRoof":
        
        break;
      case "blankScaffold":
        
        break;
      case "triTRScaffold":
        
        break;
      case "triTLScaffold":
        
        break;
      case "shortPlant":
        
        break;
      case "tallPlant":
        
        break;
      default:
        this.img = null;
        this.sound = null;
        break;
    }
    console.log(this.img);
  }
  display() {
    
    if (this.timer > this.start) {
      this.time += 0.01;
      this.scaling = easeOutElastic(this.time) * 2.5 * inch;
    } else {
      this.scaling = 1;
      this.timer++;
    }
    
    decorBuffer.imageMode(CENTER);
    decorBuffer.image(this.img, this.x, this.y, this.scaling, this.scaling);
  }
}