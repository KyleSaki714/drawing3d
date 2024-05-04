
const ROTATE_CAMERA_SPEED = 1;

let _boxx = 0;
let _boxy = 0;
let _curMouseRotate = 0; // current rotation along the y axis mapped to mouseX  
let _lastMouseRotate = 0;
let _lastCameraPos;

let myFont;
function preload() {
  myFont = loadFont("resources/Litebulb 8-bit.ttf");
}

function setup() {
  createCanvas(640, 480, WEBGL);
  frameRate(60); // 24 is stop-motion
  _lastCameraPos = createVector(0, 0, 800);
  textFont(myFont);
  textSize(36);
}

/**
 * Rotates the camera around the Y axis.
 * Credit to this video https://youtu.be/E9MnSQ9_hk0
 * @param {Number} theta rotation 
 * @param {p5.Vector} cameraPos position of camera
 * @param {p5.Vector} center point the camera is pointing at
 * @param {Number} radius camera distance from center
 */
function rotateCameraAroundPointY(theta, cameraPos, center, radius) {
  let t = radians(theta);
  // console.log(t);
  // console.log(cameraPos);
  let x = ((cameraPos.x - center.x) * cos(t)) - ((cameraPos.z - center.z) * sin(t)) + center.x;
  let z = ((cameraPos.x - center.x) * sin(t)) + ((cameraPos.z - center.z) * cos(t)) + center.y;
  let y = cameraPos.y; // + radius * math.sin(rad);
  // console.log("x:" + x + " y: " + y + " z: " + z);
  let newCameraPos = createVector(x, y, z);
  // console.log(res);
  camera(newCameraPos.x, newCameraPos.y, newCameraPos.z);
  _lastCameraPos = newCameraPos;
}

function rotateCameraAroundPointX(theta, cameraPos, center, radius) {
  let t = radians(theta);
  // console.log(t);
  // console.log(cameraPos);
  let y = ((cameraPos.y - center.y) * cos(t)) - ((cameraPos.z - center.z) * sin(t)) + center.x;
  let z = ((cameraPos.y - center.y) * sin(t)) + ((cameraPos.z - center.z) * cos(t)) + center.y;
  let x = cameraPos.x; // + radius * math.sin(rad);
  // console.log("x:" + x + " y: " + y + " z: " + z);
  let newCameraPos = createVector(x, y, z);
  // console.log(res);
  camera(newCameraPos.x, newCameraPos.y, newCameraPos.z);
  _lastCameraPos = newCameraPos;
}

/**
 * Will rotate the camera around the Y axis
 * speed multiplier * 
 * @param {Number} speed 
 */
function rotateCameraAroundOrigin(speed) {
  rotateCameraAroundPointY(ROTATE_CAMERA_SPEED * speed, _lastCameraPos, createVector(0,0,0), 800);
}

function draw() {
  clear();
  background(220);
  
  _curMouseRotate = (mouseX / width) * 360;
//   // let x = _curMouseRotate * cos(frameCount * 0.01);
  
  // if (_lastMouseRotate !== _curMouseRotate) {
  //   console.log(_curMouseRotate)
  //   let newCameraPos = rotateCameraAroundPoint(-_curMouseRotate, _lastCameraPos, createVector(0,0,0), 800);
  //   camera(newCameraPos.x, newCameraPos.y, newCameraPos.z);
  //   _lastCameraPos = newCameraPos;
    
  // }

  let mouseVelx = mouseX - pmouseX;
  let mouseVely = mouseY - pmouseY;
  if ((mouseVelx !== 0 || mouseVely !== 0) && mouseIsPressed) {
    rotateCameraAroundPointY(ROTATE_CAMERA_SPEED * mouseVelx, _lastCameraPos, createVector(0,0,0), 800);
    rotateCameraAroundPointX(ROTATE_CAMERA_SPEED * mouseVely, _lastCameraPos, createVector(0,0,0), 800);
    // rotateCameraAroundOrigin(mouseVelx);
    // console.log("mouse move xvel: " + mouseVelx);
  }
  
  if (keyIsDown(RIGHT_ARROW)) {
    console.log("right");
    rotateCameraAroundOrigin()
  } else if (keyIsDown(LEFT_ARROW)) {
    console.log("left");
    let newCameraPos = rotateCameraAroundPointY(-ROTATE_CAMERA_SPEED, _lastCameraPos, createVector(0,0,0), 800);
    camera(newCameraPos.x, newCameraPos.y, newCameraPos.z);
    _lastCameraPos = newCameraPos;
  }

  _lastMouseRotate = _curMouseRotate;
  
  push();
  translate(0,0,150);
  fill("red")
  circle(0, 100, 15);
  pop(); 
  
  push();
  fill("green")
  translate(0, 50, 0);
  rotateX(radians(270));
  rectMode(CENTER);
  text("bottom", 0, 0);
  // circle(0, 100, 15);
  pop(); 
  
  // rotateY(radians(_boxx));
  box(100, 90);
  // _boxx = (_boxx + 1) % 360 ;
}
