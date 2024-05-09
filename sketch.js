/**
 * Kyle Santos
 * CSE 493F A3: Input Devices and P5JS
 * Drawin' 3D!
 * A 3d pixel drawing app. Inspired by Warioware DIY and Mario Paint. 
 */

let DRAW_GRID_FULL = false; // debug
let MOVE_BRUSH_MODE = false; // if true, using real axis to move. otherwise, using arrow keys to move pixel position.
const BACKGROUND_COLOR = "#D0EAF2";
const PATH_DESIGNS = "designs/";

const GRID_SIZE = 16; // how many cells there are, CELL_SIZE ^ 3.
const CELL_SIZE = 32; // how big pixels are, CELL_SIZE x CELL_SIZE x CELL_SIZE. 
const CAMERA_NUDGE_SPEED = 6; // nudgin the camera with arrow keys
let CAMERA_RESET; // assigned at setup, cant use const?
let CAMERA_ORIGIN;

let _boxx = 0;
let _boxy = 0;
let _curMouseRotate = 0; // current rotation along the y axis mapped to mouseX
let _lastCameraPos; // 1st vector of camera(), the position in 3d space 
let _lastCameraPoint; // 2nd vector of camera(), position camera is pointing at
let _cameraIsPerspective; // default is false, perspective mode is true;

let _firstPixelPlaced;
let _lastBrushPos;
let _clrIndex = 0;
let _currentFillColor;
let myFont;
let _myColors; // colors available to draw in. read in on preload()
let _preload_paletteText;
let _preload_design;
let _designs;
let _drawnPixels; // Map (p5.Vector => p5.Color[])

// This is a basic web serial template for p5.js using the Makeability Lab
// serial.js library:
// https://github.com/makeabilitylab/p5js/blob/master/_libraries/serial.js
//
// See a basic example of how to use the library here:
// https://editor.p5js.org/jonfroehlich/sketches/5Knw4tN1d
//
// For more information, see:
// https://makeabilitylab.github.io/physcomp/communication/p5js-serial
// 
// By Jon E. Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//
let pHtmlMsg;
let serialOptions = { baudRate: 115200  };
let serial;
let serialVal_a0 = 0.0; // values from pins on web serial.
let serialVal_a1 = 0.0;
let serialVal_a2 = 0.0;
let serialVal_a3 = 0.0; // slider
let lastSerialVal_a3 = 0.0;
let serialVal_a4 = 0.0;
let lastSerialVal_a4 = 0.0;
let button0value = 0;

function preload() {
  myFont = loadFont("resources/Litebulb 8-bit.ttf");
  _myColors = [];
  _preload_paletteText = loadStrings("resources/pico-8.txt", loadPalette);
  _preload_design = loadStrings("designs/designs_Penguin_Island_design_2024-05-09T00_05_09.469Z.txt");
}

function setup() {
  createCanvas(640, 480, WEBGL);
  frameRate(30); // 24 is stop-motion
  
  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("Click here to open the serial connection dialog");
  pHtmlMsg.style('color', 'deeppink');
  document.querySelector("p").addEventListener("click", openSerial);

  let saveButton = document.getElementById("save-btn");
  saveButton.addEventListener("click", exportDesign);
  
  // _lastCameraPos = createVector(0, 0, 800);
  // CAMERA_RESET = createVector(
  //   719.1626069130599,
  //   -383.62382814710674,
  //   821.2028251092735
  // );
  CAMERA_RESET = createVector(
    1074.0294641043608,
    -424.18733772705235,
    72.5395714035885
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
  ortho(undefined, undefined, undefined, undefined, undefined, max(width, height) + 1000);
  _currentFillColor = color(0, 0, 0);
  _drawnPixels = new Map();
  _firstPixelPlaced = false;
  console.log(_preload_design[0])
  importDesignString(_preload_design[0]);
  console.log(_drawnPixels);
  console.log("loaded file");
}

function loadPalette(paletteFile) {
  for (const hex of paletteFile) {
    let char = hex[0];
    if (char !== ";" && char !== undefined) {
      _myColors.push(hex);
    }
  }
  console.log(_myColors);
}

// its just one line
// function loadDesignStrings(designStringFile) {
//   // for (const hex of paletteFile) {
//   // }
//   let s = designStringFile[0];
  
// }

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
  console.log(t);
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
  
  let currBrushPos;
  if (MOVE_BRUSH_MODE) {
    // move the brush with the IRL axis (serial, a0, a1, a2) 
    currBrushPos = snapToGrid(moveGridCursor());
  } else {
    // move the brush with the camera
    currBrushPos = snapToGrid(_lastCameraPoint);
  }
  
  // console.log("currBrushPos: " + currBrushPos);
  
  drawCamera();
  
  drawAxisNames();
  drawGrid();
  drawGridCursor(currBrushPos);  

  // pointLight(255, 255, 255, mouseX, mouseY, 0);
  checkChangePixelColorSerial();
  
  // "z" for placing a pixel
  if (keyIsDown(90) || button0value) {
    addPixel(currBrushPos);
  }
  
  drawPixels();
  lastSerialVal_a3 = serialVal_a3;
  lastSerialVal_a4 = serialVal_a4;
  // if (!currBrushPos.equals(_lastBrushPos)) {
  //   _lastBrushPos = currBrushPos;
  //   console.log("bruh pos changed");
  // }
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

/**
 * Uses read in Serial values to create the position of the brush.
 * @returns {p5.Vector}
 */
function moveGridCursor() {
  let xpos = serialVal_a0 * CELL_SIZE * GRID_SIZE;
  let zpos = serialVal_a1 * CELL_SIZE * GRID_SIZE;
  let ypos = serialVal_a2 * -CELL_SIZE * GRID_SIZE; // NEGATIVE CAUSE WEB
  let res = createVector(xpos, ypos, zpos);
  // console.log("moveGridCursor: " + res);
  return res;
}

function drawGrid() {
  stroke(0, 0, 0, 20);
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
  fill(color(_currentFillColor));
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
 * Using the given color, set the 
 * pixel fill color globally.
 * @param {p5.Color} color 
 */
function setPixelColor(color) {
  _currentFillColor = color;
  console.log("_currentFillColor"+_currentFillColor)
  fill(color);
}

function checkChangePixelColorSerial() {
  if (serialVal_a3 === lastSerialVal_a3) {
    return;
  }
  
  if (serialVal_a3 >= 1) {
    serialVal_a3 = 0.99;
  }
  _clrIndex = Math.trunc(serialVal_a3 * _myColors.length);
  let newClr = "#" + _myColors[_clrIndex].substring(2, 9);
  if (newClr != _currentFillColor) {
    setPixelColor(newClr);
  }
}

function checkChangePixelColorClrIndex() {
  let newClr = "#" + _myColors[_clrIndex].substring(2, 9);
  if (newClr != _currentFillColor) {
    setPixelColor(newClr);
  }
}

/**
 * Adds a pixel to the canvas.
 * Uses the fill color that was set previously.
 * @param {p5.Vector} pos x, y, z pos
 */
function addPixel(pos) {
  // for now, I'm just gonna have one pixel per cell.
  // performance reasons
  
  if (!_firstPixelPlaced) {
    _firstPixelPlaced = true;
    _lastBrushPos = createVector(-255, -255, -255);
  }
  
  // also check if new position is different
  // (only draw when new position)
  if (pos.equals(_lastBrushPos)) {
    console.log("same pos");
    return;
  }
  
  // check if there is already a coordinate in _drawnPixels
  let possibleColor = _drawnPixels.get(pos);
  
  // if not, set a new position entry with a new color array
  if (possibleColor === undefined) {
    _drawnPixels.set(pos, []);
    // add the color to the array
    _drawnPixels.get(pos).push(_currentFillColor);
    console.log("added color");
  }
  
  _lastBrushPos = pos;
}

/**
 * Using _drawnPixels, draws all the pixels added to the canvas.
 */
function drawPixels() {
  for (const pos of _drawnPixels.keys()) {
    for (const color of _drawnPixels.get(pos)) {
      push();
      // let gray = color(255, 255, 255);
      // stroke(gray.setAlpha(128));
      stroke(0, 0, 0, 15);
      // specularMaterial(red(color), green(color), blue(color));
      fill(color);
      // CELL SIZE OFFSET
      translate(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE / 2);
      translate(pos.x, pos.y, pos.z);
      box(CELL_SIZE, CELL_SIZE);
      pop();
    }
  }  
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
  let a4delta = serialVal_a4 - lastSerialVal_a4;
  // console.log(mouseVelx);
  // console.log(a4delta * 100.0);
  if (mouseIsPressed && (mouseVelx !== 0 || mouseVely !== 0)) {
    // rotateCameraAroundPointY(mouseVelx, createVector(0,0,0));
    // rotateCameraAroundPointX(mouseVely, createVector(0,0,0));
    // rotateCameraAroundOrigin(mouseVelx);

    rotateCameraAroundOriginX(mouseVely);
    rotateCameraAroundOriginY(mouseVelx);
    // console.log("mouse move xvel: " + mouseVelx);
  } else if (a4delta != 0) {
    // rotateCameraAroundPointY(a4delta * 10.0 * 90, _lastCameraPoint);
    rotateCameraAroundOriginY(a4delta * 100.0 * 2);
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

function exportDesign() {
  let date = new Date().toJSON();
  saveCanvas("Penguin_Island_design_" + date, "png");

  let textArea = document.getElementById("design-output");
  textArea.readonly = false;
  let designStr = designToString();
  console.log(designStr);
  textArea.textContent = designStr;
  navigator.clipboard.writeText(designStr);
  
  let writer = createWriter(PATH_DESIGNS + "Penguin_Island_" + date + '.txt');
  // write 'Hello world!'' to the file
  writer.write(designStr);
  // close the PrintWriter and save the file
  writer.close();
  
  alert("saved ur design to file!");
}

/**
 * pos0=color1/color2&pos1=color1/color2
 */
function designToString() {
  let designString = ""
  for (const pos of _drawnPixels.keys()) {
    designString += JSON.stringify(pos) + "=";
    for (const color of _drawnPixels.get(pos)) {
      designString += color.toString() + "/";
    }
    designString += "&";
  } 
  return designString;
}

/**
 * Given a design string, imports its contents into the 
 * current canvas. 
 * !!!!WARNING!!!! clears current canvas.
 * @param {String} designString 
 */
function importDesignString(designString) {
  _drawnPixels.clear();
  let positions = designString.split("&");
  // console.log(positions);
  for (let i = 0; i < positions.length - 1; i++) {
    let currPositionSplit = positions[i].split("=");
    // console.log(currPositionSplit);
    let co = JSON.parse(currPositionSplit[0]);
    let curVect = createVector(co.x, co.y, co.z);
    // console.log("curVect: " + curVect);
    _drawnPixels.set(curVect, []);
    let posColors = currPositionSplit[1].split("/");
    for (let j = 0; j < posColors.length - 1; j++) {
      let cc = color(posColors[j]);
      _drawnPixels.get(curVect).push(cc);
      // console.log("currcolor: "+cc);
    }
  }
}

function keyPressed() {
  // "p" for perspective
  if (keyCode === 80) {
    _cameraIsPerspective = !_cameraIsPerspective;
    
    if (_cameraIsPerspective) {
      perspective(0.5, 1.5, 100, 10000);
    } else {
      ortho(undefined, undefined, undefined, undefined, undefined, max(width, height) + 1000);
    }
  }
    
  // "x" for toggle pixel color left
  if (keyCode === 88) {
    _clrIndex--;
    if (_clrIndex === -1) {
      _clrIndex = _myColors.length - 1;
    }
    checkChangePixelColorClrIndex();
  }
  
  // "c" for toggle pixel color left
  if (keyCode === 67) {
    _clrIndex = (_clrIndex + 1) % _myColors.length;
    checkChangePixelColorClrIndex();
  }

  // "c" for log the last camera position
  if (keyCode === 67) {
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

/**
 * Callback function by serial.js when there is an error on web serial
 * 
 * @param {} eventSender 
 */
function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  console.log("onSerialErrorOccurred", eventSender);
  pHtmlMsg.html(error);
}

/**
 * Callback function by serial.js when web serial connection is opened
 * 
 * @param {} eventSender 
 */
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("Serial connection opened successfully");
}

/**
 * Callback function by serial.js when web serial connection is closed
 * 
 * @param {} eventSender 
 */
function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
}

/**
 * Callback function serial.js when new web serial data is received
 * 
 * @param {*} eventSender 
 * @param {String} newData new data received over serial
 */
function onSerialDataReceived(eventSender, newData) {
  // console.log("onSerialDataReceived", newData);
  // pHtmlMsg.html("onSerialDataReceived: " + newData);
  let pinData = newData.split(",");
  // for (let i = 0; i < peripherals.length; i++) {
  //   let currPin = peripherals[i];
    
  // }

  serialVal_a0 = parseFloat(pinData[0]);
  serialVal_a1 = parseFloat(pinData[1]);
  serialVal_a2 = parseFloat(pinData[2]);
  serialVal_a3 = parseFloat(pinData[3]);
  button0value = parseInt(pinData[4]);
  serialVal_a4 = parseFloat(pinData[5]);

  // let a0split = pinData[0].split(":");
  // serialVal_a0 = parseFloat(a0split[1]);
  // let a1split = pinData[1].split(":");
  // serialVal_a1 = parseFloat(a1split[1]);
  // let a2split = pinData[2].split(":");
  // serialVal_a2 = parseFloat(a2split[1]);

  // console.log("serialVal_a0: " + serialVal_a0 +
  //  " serialVal_a1: " + serialVal_a1 +
  //  " serialVal_a2: " + serialVal_a2 +
  //  " serialVal_a3: " + serialVal_a3 +
  //  " button0value: " + button0value +
  //  " serialVal_a4: " + serialVal_a4
  // );
}

/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function openSerial() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}