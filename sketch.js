
const ROTATE_CAMERA_SPEED = 1;

let _boxx = 0;
let _boxy = 0;
let _curMouseRotate = 0; // current rotation along the y axis mapped to mouseX  
let _lastMouseRotate = 0;
let _lastCameraPos; // 1st vector of camera(), the position in 3d space 
let _lastCameraPoint; // 2nd vector of camera(), position camera is pointing at

let myFont;
function preload() {
  myFont = loadFont("resources/Litebulb 8-bit.ttf");
}

function setup() {
  createCanvas(640, 480, WEBGL);
  frameRate(60); // 24 is stop-motion
  _lastCameraPos = createVector(0, 0, 800);
  _lastCameraPoint = createVector(0, 0, 0);
  textFont(myFont);
  textSize(36);
}


function drawDebugAxis() {
  
  push();
  textSize(100);
  translate(-150,0,0);
  rotateY(radians(90));
  fill("blue");
  text("x", 0, 0);
  pop(); 

  push();
  textSize(100);
  translate(0,0,150);
  fill("red")
  text("z", 0, 0);
  pop(); 
  
  push();
  textSize(100);
  fill("green")
  translate(0, 150, 0);
  rotateX(radians(90));
  text("y", 0, 0);
  pop(); 
  
}

/**
 * Rotates the camera around the point's Y axis.
 * Credit to this video https://youtu.be/E9MnSQ9_hk0
 * @param {Number} theta rotation 
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
 * @param {Number} theta rotation 
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
  background(220);
        
  drawCamera();
        
  
  drawDebugAxis();

  push();
  fill("white");
  rotateY(radians(_boxx));
  box(100, 90);
  _boxx = (_boxx + 1) % 360 ;
  pop();
}

function drawCamera() {
  // draw camera point indicator
  push();
  rectMode(CENTER);
  rotateX(radians(90));
  fill("magenta");
  translate(_lastCameraPoint.x, _lastCameraPoint.z, 0);
  text("camerapoint", 0, 0);
  // rect(0, 0, 10, 10);
  pop();

  if (keyIsDown(RIGHT_ARROW)) {
    // console.log("move camera right");
    _lastCameraPoint.x++; 
  }
  if (keyIsDown(LEFT_ARROW)) {
    // console.log("move camera left");
    _lastCameraPoint.x--; 
  }
  if (keyIsDown(UP_ARROW)) {
    // console.log("move camera up");
    _lastCameraPoint.z--; 
  }
  if (keyIsDown(DOWN_ARROW)) {
    // console.log("move camera down");
    _lastCameraPoint.z++; 
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
  if (keyCode === 32) {
    ortho();
  }
  // Uncomment to prevent any default behavior.
  return false;
}