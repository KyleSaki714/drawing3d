// Kyle Santos

const int XPOTPIN = A0;
const int ZPOTPIN = A1;
const int YPOTPIN = A2;
const int SLIDERPOTPIN = A3;
const int BUTTON0PIN = 4;

int _lastButtonPress = LOW;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(BUTTON0PIN, INPUT_PULLUP);
}

void loop() {
  // put your main code here, to run repeatedly:
  float xval = analogRead(XPOTPIN) / (float) 1023;
  float zval = analogRead(ZPOTPIN) / (float) 1023;
  float yval = analogRead(YPOTPIN) / (float) 1023;
  float sliderval = analogRead(SLIDERPOTPIN) / (float) 1023;

  // Serial.print("x: ");
  // Serial.print(xval, 4);
  // Serial.print(" z: ");
  // Serial.print(zval, 4);
  // Serial.print(" y: ");
  // Serial.println(yval, 4);

  // Serial.print("A0:");
  Serial.print(xval, 4);
  Serial.print(",");
  // Serial.print("A1:");
  Serial.print(zval, 4);
  Serial.print(",");
  // Serial.print("A2:");
  Serial.print(yval, 4);
  Serial.print(",");
  Serial.print(sliderval, 4);
  Serial.print(",");

  int btnval = digitalRead(BUTTON0PIN);
  // btnval != _lastButtonPress && 
  if (btnval == LOW) {
    Serial.println(HIGH);
  } else {
    Serial.println(LOW);
  }

  _lastButtonPress = btnval;

  delay(50);
}
