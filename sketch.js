/**
 * Kyle Santos
 * CSE 493F A3: Input Devices and P5JS
 * Drawin' 3D!
 * A 3d pixel drawing app. Inspired by Warioware DIY and Mario Paint. 
 */

let DRAW_GRID_FULL = false; // debug
const BACKGROUND_COLOR = "#D0EAF2";

const GRID_SIZE = 16; // how many cells there are, CELL_SIZE ^ 3.
const CELL_SIZE = 32; // how big pixels are, CELL_SIZE x CELL_SIZE x CELL_SIZE. 
const CAMERA_NUDGE_SPEED = 3; // nudgin the camera with arrow keys
let CAMERA_RESET; // assigned at setup, cant use const?
let CAMERA_ORIGIN;

let _boxx = 0;
let _boxy = 0;
let _curMouseRotate = 0; // current rotation along the y axis mapped to mouseX
let _lastCameraPos; // 1st vector of camera(), the position in 3d space 
let _lastCameraPoint; // 2nd vector of camera(), position camera is pointing at
let _cameraIsPerspective; // default is false, perspective mode is true;

let _lastBrushPos;

let myFont;
let colors;
let paletteText;

function preload() {
  myFont = loadFont("resources/Litebulb 8-bit.ttf");
  colors = [];
  paletteText = loadStrings("resources/pico-8.txt", loadPalette);
}

function setup() {
  createCanvas(640, 480, WEBGL);
  frameRate(60); // 24 is stop-motion
  // _lastCameraPos = createVector(0, 0, 800);
  CAMERA_RESET = createVector(
    719.1626069130599,
    -383.62382814710674,
    821.2028251092735
  );
  CAMERA_ORIGIN = createVector(
    (CELL_SIZE * GRID_SIZE) / 2,
    -69,
    (CELL_SIZE * GRID_SIZE) / 2
  );
  _lastCameraPos = CAMERA_RESET;
  _lastCameraPoint = CAMERA_ORIGIN;
  _lastBrushPos = CAMERA_ORIGIN;
  textFont(myFont);
  textSize(36);
  _cameraIsPerspective = false;
  ortho();
}

function loadPalette(paletteFile) {
  for (const hex of paletteFile) {
    let char = hex[0];
    if (char !== ";" && char !== undefined) {
      colors.push(hex);
    }
  }
  console.log(colors);
}

function drawAxisNames() {
  
  push();
  textSize(100);
  translate(CELL_SIZE * GRID_SIZE,0,0);
  rotateY(radians(90));
  fill("blue");
  text("x", 0, 0);
  pop(); 

  push();
  textSize(100);
  translate(0,0,CELL_SIZE * GRID_SIZE);
  fill("red")
  text("z", 0, 0);
  pop(); 
  
  push();
  textSize(100);
  fill("green")
  // translate(0, CELL_SIZE * GRID_SIZE, 0);
  rotateX(radians(90));
  text("y", 0, 0);
  pop(); 
  
}

/**
 * Rotates the camera around the point's Y axis.
 * Credit to this video https://youtu.be/E9MnSQ9_hk0
 * @param {Number} theta rotation in DEGREES
 * @param {p5.Vector} point point the camera is pointing at
 */
function rotateCameraAroundPointY(theta, point) {
  let t = radians(theta);
  let cameraPos = _lastCameraPos;
  // console.log(t);
  // console.log(cameraPos);
  let x = ((cameraPos.x - point.x) * cos(t)) - ((cameraPos.z - point.z) * sin(t)) + point.x;
  let z = ((cameraPos.x - point.x) * sin(t)) + ((cameraPos.z - point.z) * cos(t)) + point.y;
  let y = cameraPos.y; // + radius * math.sin(rad);
  // console.log("x:" + x + " y: " + y + " z: " + z);
  let newCameraPos = createVector(x, y, z);
  // console.log(res);
  camera(newCameraPos.x, newCameraPos.y, newCameraPos.z);
  _lastCameraPos = newCameraPos;
  return _lastCameraPos;
}

/**
 * Rotates the camera around the point's X axis.
 * Credit to this video https://youtu.be/E9MnSQ9_hk0
 * @param {Number} theta rotation in DEGREES
 * @param {p5.Vector} point point the camera is pointing at
 */
function rotateCameraAroundPointX(theta, point) {
  let t = radians(theta);
  let cameraPos = _lastCameraPos;
  // console.log(t);
  // console.log(cameraPos);
  let y = ((cameraPos.y - point.y) * cos(t)) - ((cameraPos.z - point.z) * sin(t)) + point.x;
  let z = ((cameraPos.y - point.y) * sin(t)) + ((cameraPos.z - point.z) * cos(t)) + point.y;
  let x = cameraPos.x; // + radius * math.sin(rad);
  // console.log("x:" + x + " y: " + y + " z: " + z);
  let newCameraPos = createVector(x, y, z);
  // console.log(res);
  camera(newCameraPos.x, newCameraPos.y, newCameraPos.z);
  _lastCameraPos = newCameraPos;
  return _lastCameraPos;
}

/**
 * Will rotate the camera around the Y axis
 * using theta.
 * @param {Number} theta rotation 
 */
function rotateCameraAroundOriginY(theta) {
  rotateCameraAroundPointY(theta, createVector(0,0,0));
}

/**
 * Will rotate the camera around the Y axis
 * using theta.
 * @param {Number} theta rotation 
 */
function rotateCameraAroundOriginX(theta) {
  rotateCameraAroundPointX(theta, createVector(0,0,0));
}

function draw() {
  clear();
  background(BACKGROUND_COLOR);
  
  let currBrushPos = snapToGrid(_lastCameraPoint); // This will be set from potentiometers later
  
  
  if (!currBrushPos.equals(_lastBrushPos)) {
    console.log(currBrushPos);
  }
  
  drawCamera();
  
  drawAxisNames();
  drawGrid();
  drawGridCursor(currBrushPos);
  
  //drawPixel(currBrushPos);
  
  _lastBrushPos = currBrushPos;
  // draw test box!!! spinning!!!
  // push();
  // fill("white");
  // rotateY(radians(_boxx));
  // box(100, 90);
  // _boxx = (_boxx + 1) % 360 ;
  // pop();
  
}

/**
 * Given the current position, snaps it to the grid. uses CELL_SIZE.
 * @param {p5.Vector} currentPos
 * @returns {p5.Vector} snapped position
 */
function snapToGrid(currentPos) {
  let snapx = round((currentPos.x - CELL_SIZE /2) / CELL_SIZE) * CELL_SIZE;
  let snapy = round((currentPos.y - CELL_SIZE /2) / CELL_SIZE) * CELL_SIZE;
  let snapz = round((currentPos.z - CELL_SIZE /2) / CELL_SIZE) * CELL_SIZE;
  
  return createVector(snapx, snapy, snapz);
}

function drawGrid() {
  stroke(0, 0, 0, 128);
  noFill();
  if (DRAW_GRID_FULL) {
    push();
    // creates z-x grid
    // along z
    for (let i = 0; i <= GRID_SIZE; i++) {
      line(i * CELL_SIZE, 0, 0, i * CELL_SIZE, 0, CELL_SIZE * GRID_SIZE);
    }
    // along x
    for (let i = 0; i <= GRID_SIZE; i++) {
      line(0, 0, i * CELL_SIZE, CELL_SIZE * GRID_SIZE, 0, i * CELL_SIZE);
    }
    // creates xy grid
    // along y
    for (let i = 0; i <= GRID_SIZE; i++) {
      line(i * CELL_SIZE, 0, 0, i * CELL_SIZE, -CELL_SIZE * GRID_SIZE, 0);
    }
    for (let i = 0; i <= GRID_SIZE; i++) {
      line(0, i * -CELL_SIZE, 0, CELL_SIZE * GRID_SIZE, i * -CELL_SIZE, 0);
    }
    // creates zy grid
    // along y
    for (let i = 0; i <= GRID_SIZE; i++) {
      line(0, 0, i * CELL_SIZE, 0, -CELL_SIZE * GRID_SIZE, i * CELL_SIZE);
    }
    // lines along z
    for (let i = 0; i <= GRID_SIZE; i++) {
      line(0, i * -CELL_SIZE, 0, 0, i * -CELL_SIZE, CELL_SIZE * GRID_SIZE);
    }
    pop();
  } else {
    push()
    translate(0, -CELL_SIZE * GRID_SIZE, 0);
    rect(0,0, CELL_SIZE * GRID_SIZE, CELL_SIZE * GRID_SIZE);
    pop()
    
    push()
    rotateX(radians(90));
    rect(0,0, CELL_SIZE * GRID_SIZE, CELL_SIZE * GRID_SIZE);
    pop()
    
    push()
    rotateY(radians(-90));
    translate(0, -CELL_SIZE * GRID_SIZE, 0);
    rect(0,0, CELL_SIZE * GRID_SIZE, CELL_SIZE * GRID_SIZE);
    pop()
    // x,y,z axes from origin
    // line(0, 0, 0, 0, 0, CELL_SIZE * GRID_SIZE);
    // line(0, 0, 0, 0, -CELL_SIZE * GRID_SIZE, 0);
    // line(0, 0, 0, CELL_SIZE * GRID_SIZE, 0, 0);
    
    // line(CELL_SIZE * GRID_SIZE, 0, 0,  CELL_SIZE * GRID_SIZE, 0, CELL_SIZE * GRID_SIZE);
    // line(0, 0, 0, 0, -CELL_SIZE * GRID_SIZE, 0);
    // line(0, 0, 0, CELL_SIZE * GRID_SIZE, 0, 0);
  }
}

function drawGridCursor(currBrushPos) {
  // grid cursor
  push();
  // CELL SIZE OFFSET
  translate(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE / 2);
  translate(currBrushPos.x, currBrushPos.y, currBrushPos.z);
  box(CELL_SIZE, CELL_SIZE);
  pop();
  
  // XZ PLANE
  push();
  noStroke();
  fill(246,237,195,128);
  rotateX(radians(90));
  // translate(currBrushPos.x, currBrushPos.z, -currBrushPos.y);
  translate(currBrushPos.x, currBrushPos.z, 0);
  rect(0, 0, CELL_SIZE, CELL_SIZE);
  pop();
  
  // XY PLANE
  push();
  noStroke();
  fill(246,237,195,200);
  // rotateX(radians(90));
  // translate(currBrushPos.x, currBrushPos.z, -currBrushPos.y);
  translate(currBrushPos.x, currBrushPos.y, 0);
  rect(0, 0, CELL_SIZE, CELL_SIZE);
  pop();
  
  // YZ PLANE
  push();
  noStroke();
  fill(246,237,195,200);
  // translate(currBrushPos.x, currBrushPos.z, -currBrushPos.y);
  translate(0, currBrushPos.y, currBrushPos.z);
  rotateY(radians(-90));
  rect(0, 0, CELL_SIZE, CELL_SIZE);
  pop();
}

/**
 * Draws a box at the specified position.
 * Uses the fill color that was set previously.
 * @param {p5.Vector} coord x, y, z coordinate
 */
function drawPixel(coord) {
  push();
  // CELL SIZE OFFSET
  translate(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE / 2);
  translate(coord.x, coord.y, coord.z);
  box(CELL_SIZE, CELL_SIZE);
  pop();
}

function drawCamera() {
  
  // draw camera point indicator
  push();
  rectMode(CENTER);
  rotateX(radians(90));
  fill("gray");
  translate(_lastCameraPoint.x, _lastCameraPoint.z, -_lastCameraPoint.y);
  circle(0, 0, 10);
  // text("camerapoint", 0, 0);
  pop();

  if (keyIsDown(RIGHT_ARROW)) {
    // console.log("move camera right");
    _lastCameraPos.x += CAMERA_NUDGE_SPEED;
    _lastCameraPoint.x += CAMERA_NUDGE_SPEED; 
  }
  if (keyIsDown(LEFT_ARROW)) {
    // console.log("move camera left");
    _lastCameraPos.x -= CAMERA_NUDGE_SPEED;
    _lastCameraPoint.x -= CAMERA_NUDGE_SPEED; 
  }
  if (keyIsDown(UP_ARROW)) {
    // console.log("move camera up");
    _lastCameraPos.z -= CAMERA_NUDGE_SPEED;
    _lastCameraPoint.z -= CAMERA_NUDGE_SPEED; 
  }
  if (keyIsDown(DOWN_ARROW)) {
    // console.log("move camera down");
    _lastCameraPos.z += CAMERA_NUDGE_SPEED;
    _lastCameraPoint.z += CAMERA_NUDGE_SPEED; 
  }
  if (keyIsDown(32)) {
    _lastCameraPos.y -= CAMERA_NUDGE_SPEED;
    _lastCameraPoint.y -= CAMERA_NUDGE_SPEED; 
  }
  if (keyIsDown(16)) {
    _lastCameraPos.y += CAMERA_NUDGE_SPEED;
    _lastCameraPoint.y += CAMERA_NUDGE_SPEED; 
  }
  camera(_lastCameraPos.x, _lastCameraPos.y, _lastCameraPos.z,
          _lastCameraPoint.x, _lastCameraPoint.y, _lastCameraPoint.z);

  let mouseVelx = mouseX - pmouseX;
  let mouseVely = mouseY - pmouseY;
  if ((mouseVelx !== 0 || mouseVely !== 0) && mouseIsPressed) {
    // rotateCameraAroundPointY(mouseVelx, createVector(0,0,0));
    // rotateCameraAroundPointX(mouseVely, createVector(0,0,0));
    // rotateCameraAroundOrigin(mouseVelx);

    rotateCameraAroundOriginX(mouseVely);
    rotateCameraAroundOriginY(mouseVelx);
    // console.log("mouse move xvel: " + mouseVelx);
  }
  
  // if (keyIsDown(RIGHT_ARROW)) {
  //   console.log("right");
  //   rotateCameraAroundOriginY(1)
  // } else if (keyIsDown(LEFT_ARROW)) {
  //   console.log("left");
  //   rotateCameraAroundOriginY(-1);
  // } else if (keyIsDown(UP_ARROW)) {
  //   console.log("up");
  //   rotateCameraAroundOriginX(1)
  // } else if (keyIsDown(DOWN_ARROW)) {
  //   console.log("down");
  //   rotateCameraAroundOriginX(-1);
  // }
}

function keyPressed() {
  // "p" for perspective
  if (keyCode === 80) {
    _cameraIsPerspective = !_cameraIsPerspective;
    
    if (_cameraIsPerspective) {
      perspective();
    } else {
      ortho();
    }
  }
  // "z" for zlog the last camera position
  if (keyCode === 90) {
    console.log(_lastCameraPos);
    console.log(_lastCameraPoint);
  }
  // "r" for reset camera
  if (keyCode === 82) {
    _lastCameraPos = CAMERA_RESET;
    _lastCameraPoint = CAMERA_ORIGIN;
  }
  // Uncomment to prevent any default behavior.
  return false;
}