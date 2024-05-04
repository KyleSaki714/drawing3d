
const ROTATE_CAMERA_SPEED = 2.5;

let _boxx = 0;
let _boxy = 0;
let _curMouseRotate = 0; // current rotation along the y axis mapped to mouseX  
let _lastMouseRotate = 0;
let _lastCameraPos;


function setup() {
  createCanvas(640, 480, WEBGL);
  frameRate(60); // 24 is stop-motion
  _lastCameraPos = createVector(0, 0, 800);
}

// theta (int): 0 - 360
// cameraPos (p5.vector): position of camera
// center (p5.vector): point the camera is pointing at
// radius (int): camera distance from center
// function calcCameraPosition(theta, cameraPos, center, radius) {
//   let t = radians(theta);
//   console.log(cameraPos);
//   let x = (cameraPos.x - center.x) * cos(t) - (cameraPos.y - center.y) * sin(t) + center.x;
//   let y = (cameraPos.x - center.x) * sin(t) + (cameraPos.y - center.y) * cos(t) + center.y;
//   let z = center.z // + radius * math.sin(rad);
//   // console.log(z);
//   let res = createVector(x, y, z);
//   // console.log(res);
//   return res;
// }
function calcCameraPosition(theta, cameraPos, center, radius) {
  let t = radians(theta);
  // console.log(t);
  // console.log(cameraPos);
  let x = (cameraPos.x * cos(t)) - ((cameraPos.z) * sin(t));
  let z = (cameraPos.x * sin(t)) + ((cameraPos.z) * cos(t));
  let y = 0; // + radius * math.sin(rad);
  // console.log("x:" + x + " y: " + y + " z: " + z);
  let res = createVector(x, y, z);
  // console.log(res);
  return res;
}

function draw() {
  clear();
  background(220);
  
  _curMouseRotate = (mouseX / width) * 360;
//   // let x = _curMouseRotate * cos(frameCount * 0.01);
  
  if (_lastMouseRotate !== _curMouseRotate) {
    console.log(_curMouseRotate)
    let newCameraPos = calcCameraPosition(-_curMouseRotate, _lastCameraPos, createVector(0,0,0), 800);
    camera(newCameraPos.x, newCameraPos.y, newCameraPos.z);
    _lastCameraPos = newCameraPos;
    
  }
  
  if (keyIsDown(RIGHT_ARROW)) {
        console.log("right");
    let newCameraPos = calcCameraPosition(ROTATE_CAMERA_SPEED, _lastCameraPos, createVector(0,0,0), 800);
    camera(newCameraPos.x, newCameraPos.y, newCameraPos.z);
    _lastCameraPos = newCameraPos;
  } else if (keyIsDown(LEFT_ARROW)) {
    console.log("left");
    let newCameraPos = calcCameraPosition(-ROTATE_CAMERA_SPEED, _lastCameraPos, createVector(0,0,0), 800);
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
  translate(0,150,0);
  fill("green")
  circle(0, 100, 15);
  pop(); 
  
  // rotateY(radians(_boxx));
  box(100, 90);
  // _boxx = (_boxx + 1) % 360 ;
}


function keyPressed() {
  // if (keyCode === LEFT_ARROW) {
  // console.log("left");
  // } else if (keyCode === RIGHT_ARROW) {
  //   console.log("right");
  //   let newCameraPos = calcCameraPosition(1, _lastCameraPos, createVector(0,0,0), 800);
  //   camera(newCameraPos.x, newCameraPos.y, newCameraPos.z);
  //   _lastCameraPos = newCameraPos;
  // }
  


}