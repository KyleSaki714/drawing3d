// Kyle Santos

const int XPOTPIN = A0;
const int ZPOTPIN = A1;
const int YPOTPIN = A2;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
}

void loop() {
  // put your main code here, to run repeatedly:
  float xval = analogRead(XPOTPIN) / (float) 1023;
  float zval = analogRead(ZPOTPIN) / (float) 1023;
  float yval = analogRead(YPOTPIN) / (float) 1023;

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
  Serial.println(yval, 4);

  delay(50);
}
