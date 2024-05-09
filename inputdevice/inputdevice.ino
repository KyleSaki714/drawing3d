// Kyle Santos

const int XPOTPIN = A0;
const int ZPOTPIN = A1;
// const int YPOTPIN = A2;
const int SLIDERPOTPIN = A3;
const int TRIMPOTPIN = A4;
const int BUTTON0PIN = 4;
const int BUTTON1PIN = 5;
const int BUTTON2PIN = 6;
const int BUTTON3PIN = 7;


int _lastButtonPress = LOW;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(BUTTON0PIN, INPUT_PULLUP);
  pinMode(BUTTON1PIN, INPUT_PULLUP);
  pinMode(BUTTON2PIN, INPUT_PULLUP);
  pinMode(BUTTON3PIN, INPUT_PULLUP);
}

void loop() {
  // put your main code here, to run repeatedly:
  float xval = analogRead(XPOTPIN) / (float) 1023;
  float zval = analogRead(ZPOTPIN) / (float) 1023;
  // float yval = analogRead(YPOTPIN) / (float) 1023;
  float sliderval = analogRead(SLIDERPOTPIN) / (float) 1023;
  float trimpotval = analogRead(TRIMPOTPIN) / (float) 1023;

  // Serial.print("x: ");
  // Serial.print(xval, 2);
  // Serial.print(" z: ");
  // Serial.print(zval, 2);
  // Serial.print(" y: ");
  // Serial.println(yval, 2);

  // Serial.print("A0:");
  Serial.print(xval, 2);
  Serial.print(",");
  // Serial.print("A1:");
  Serial.print(zval, 2);
  Serial.print(",");
  // Serial.print("A2:");
  // Serial.print(yval, 2);
  // Serial.print(",");
  Serial.print(sliderval, 2);
  Serial.print(",");

  Serial.print(trimpotval, 2);
  Serial.print(",");

  int btnval = digitalRead(BUTTON0PIN);
  // btnval != _lastButtonPress && 
  if (btnval == LOW) {
    Serial.print(HIGH);
  } else {
    Serial.print(LOW);
  }
  Serial.print(",");

  int btn1val = digitalRead(BUTTON1PIN);
  // btnval != _lastButtonPress && 
  if (btn1val == LOW) {
    Serial.print(HIGH);
  } else {
    Serial.print(LOW);
  }
  Serial.print(",");

  int btn2val = digitalRead(BUTTON2PIN);
  // btnval != _lastButtonPress && 
  if (btn2val == LOW) {
    Serial.print(HIGH);
  } else {
    Serial.print(LOW);
  }
  Serial.print(",");

    int btn3val = digitalRead(BUTTON3PIN);
  // btnval != _lastButtonPress && 
  if (btn3val == LOW) {
    Serial.println(HIGH);
  } else {
    Serial.println(LOW);
  }

  _lastButtonPress = btnval;

  delay(50);
}
