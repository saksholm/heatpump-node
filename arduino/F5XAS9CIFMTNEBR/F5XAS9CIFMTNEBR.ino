#include <OneWire.h>
#include <DallasTemperature.h>
 
// Data wire is plugged into pin 2 on the Arduino
#define ONE_WIRE_BUS1 35
#define ONE_WIRE_BUS2 36
#define ONE_WIRE_BUS3 37
#define ONE_WIRE_BUS4 38
 
// Setup a oneWire instance to communicate with any OneWire devices 
// (not just Maxim/Dallas temperature ICs)
OneWire oneWire1(ONE_WIRE_BUS1);
OneWire oneWire2(ONE_WIRE_BUS2);
OneWire oneWire3(ONE_WIRE_BUS3);
OneWire oneWire4(ONE_WIRE_BUS4);

 
// Pass our oneWire reference to Dallas Temperature.
DallasTemperature sensors1(&oneWire1);
DallasTemperature sensors2(&oneWire2);
DallasTemperature sensors3(&oneWire3);
DallasTemperature sensors4(&oneWire4);
 
void setup(void)
{
  // start serial port
  Serial.begin(9600);
  Serial.println("Dallas Temperature IC Control Library Demo");

  // Start up the library
  sensors1.begin();
  sensors2.begin();
  sensors3.begin();
  sensors4.begin();
}
 
 
void loop(void)
{
  Serial.print("1 Requesting temperatures...");
  sensors1.requestTemperatures(); // Send the command to get temperatures
  Serial.println("DONE");

  Serial.print("1 Temperature is: ");
  Serial.print(sensors1.getTempCByIndex(0)); // Why "byIndex"? 
    // You can have more than one IC on the same bus. 
    // 0 refers to the first IC on the wire
    delay(200);


  Serial.print("2 Requesting temperatures...");
  sensors2.requestTemperatures(); // Send the command to get temperatures
  Serial.println("DONE");

  Serial.print("2 Temperature is: ");
  Serial.print(sensors2.getTempCByIndex(0)); // Why "byIndex"? 
    // You can have more than one IC on the same bus. 
    // 0 refers to the first IC on the wire
    delay(200);


  Serial.print("3 Requesting temperatures...");
  sensors3.requestTemperatures(); // Send the command to get temperatures
  Serial.println("DONE");

  Serial.print("3 Temperature is: ");
  Serial.print(sensors3.getTempCByIndex(0)); // Why "byIndex"? 
    // You can have more than one IC on the same bus. 
    // 0 refers to the first IC on the wire
    delay(200);


  Serial.print("4 Requesting temperatures...");
  sensors4.requestTemperatures(); // Send the command to get temperatures
  Serial.println("DONE");

  Serial.print("4 Temperature is: ");
  Serial.print(sensors4.getTempCByIndex(0)); // Why "byIndex"? 
    // You can have more than one IC on the same bus. 
    // 0 refers to the first IC on the wire
    delay(1000);

}
