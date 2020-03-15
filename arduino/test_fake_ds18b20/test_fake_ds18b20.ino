/*
  Adapted from UserDataWriteBatch.ino DallasTemperature library example
  Jan 25 2019

  Testing fake DS18B20 from China
  It appeared to work using the DallasTemperature library to write to the High/Low alarm setpoint, but it did not survive a power cycle
    upon further investigation, it appears the DallasTemperature library does not issue the 0xB8 (copy eeprom to scratchpad) command before reading the scratchpad
    as a result, the fake sensor does not actually save the High/Low alarm because it does not actually have any EEPROM
*/

#include <OneWire.h>
#include <DallasTemperature.h>
#define ONE_WIRE_BUS 38
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

uint8_t deviceCount = 0;
const uint8_t PARASITE = 0;
uint8_t highAlarmValue = 25;
uint8_t lowAlarmValue = 10;

void printAddress(DeviceAddress deviceAddress){
  for (uint8_t i = 0; i < 8; i++){
    if (deviceAddress[i] < 16) Serial.print("0"); // zero pad the address if necessary
    Serial.print(deviceAddress[i], HEX);
    if (i < 7) Serial.print(":");
  }
}

void setup(void)
{
  Serial.begin(115200);
  while (!Serial);
  Serial.println(__FILE__);
  Serial.println("Test writing data to DS18B20 alarm setpoints\n");
  Serial.print("DallasTemperature library version: ");
  Serial.println(DALLASTEMPLIBVERSION);

  sensors.begin();

  //deviceCount = sensors.getDS18Count();
  deviceCount = sensors.getDeviceCount();
  Serial.print("\n#devices: ");
  Serial.print(deviceCount);
  printMenu();
}

void loop(void){
  int c = 0;
  while (1){
    c = Serial.read();
    switch(c){
    case '1':
      method1();
      printMenu();
      break;
    case '2':
      method2();
      printMenu();
      break;
    default:
      break;
    }
  }
}

void printMenu(){
  Serial.print("\n\nEnter desired writing method");
  Serial.print("\n  1 - DallasTemperature setHighAlarmTemp/setLowAlarmTemp functions");
  Serial.print("\n  2 - Direct OneWire write commands");
}

void method1(){     // using DallasTemperature library setHighAlarmTemp/setLowAlarmTemp functions
  Serial.print("\n\nMethod 1\nCurrent alarm values on devices\n");
  readDevicesMethod1();
  
  Serial.print("\nNew Hi/Lo alarm values: ");
  highAlarmValue++;
  lowAlarmValue++;
  Serial.print(highAlarmValue);
  Serial.print("/");
  Serial.print(lowAlarmValue);

  Serial.print("\nWriting to devices");
  for (uint8_t index = 0; index < deviceCount; index++){
    Serial.print(".");
    DeviceAddress addr;
    sensors.getAddress(addr, index); // resets(no write), searches 0xF0(240) until addr is found
    sensors.setHighAlarmTemp(addr, highAlarmValue);
    sensors.setLowAlarmTemp(addr, lowAlarmValue);
  }
  
  Serial.println("\n\nNew alarm values stored on devices");
  readDevicesMethod1();
  
  Serial.println("Method 1 finished");
}

void readDevicesMethod1(){
  uint8_t hAlarmValue;
  uint8_t lAlarmValue;
  
  for (uint8_t index = 0; index < deviceCount; index++){
    DeviceAddress addr;
    sensors.getAddress(addr, index); // resets(no write), searches 0xF0(240) until addr is found
    printAddress(addr);
    
    hAlarmValue = sensors.getHighAlarmTemp(addr);
    lAlarmValue = sensors.getLowAlarmTemp(addr);

    Serial.print("\tHi/Lo: ");
    Serial.print(hAlarmValue); // writes select ROM 0x55(85), writes 8 hex addr values, writes read scratchpad 0xBE(190), reads 9 bytes of scratchpad data, returns high alarm scratchpad byte
    Serial.print("/");
    Serial.println(lAlarmValue); // same as getHighAlarmTemp but returns low alarm scratchpad byte
  }
}

void method2(){   // using direct OneWire write commands
  Serial.println("\n\nMethod 2\nCurrent alarm values on devices");
  readDevicesMethod2();
  
  Serial.print("\nNew Hi/Lo alarm values: ");
  highAlarmValue++;
  lowAlarmValue++;
  Serial.print(highAlarmValue);
  Serial.print("/");
  Serial.print(lowAlarmValue);
  
  Serial.print("\nWriting to devices");
  oneWire.reset_search();
  uint8_t addr[8];
  while (oneWire.search(addr)){
    if (OneWire::crc8(addr, 7) == addr[7]){
      Serial.print(".");
      oneWire.reset();
      oneWire.select(addr);
      oneWire.write(0x4E);           // Write to scratchpad
      oneWire.write(highAlarmValue); // Write high alarm value
      oneWire.write(lowAlarmValue);  // Write low alarm value
      oneWire.write(0x7F);           // Write configuration register, 12 bit temp res
      delay(30);  // dallas temp lib doesn't delay

      oneWire.reset();
      oneWire.select(addr);
      oneWire.write(0x48, PARASITE);  //copy scratchpad to eeprom, 1 - parasite power
      delay(20);                      // need at least 10ms eeprom write delay
      if (PARASITE) delay(10);
    } else {
      Serial.print("Bad device addr!");
    }
  }

  Serial.println("\n\nNew alarm values stored on devices");
  readDevicesMethod2();
  
  Serial.print("Method 2 finished");
}

void readDevicesMethod2(){   // using direct OneWire write commands
  uint8_t hAlarmValue;
  uint8_t lAlarmValue;
  uint8_t addr[8];
  uint8_t data[9];
  oneWire.reset_search();
  while (oneWire.search(addr)){
    printAddress(addr);
    if (OneWire::crc8(addr, 7) == addr[7]){
      oneWire.reset();
      oneWire.select(addr);    
      oneWire.write(0xB8);        // Copy eeprom to scratchpad cmd, missing from DallasTemperature library
      delay(50);
      oneWire.reset();
      oneWire.select(addr);
      oneWire.write(0xBE);        // Read scratchpad cmd
      delay(50);
      for (uint8_t i = 0; i < 9; i++){
        data[i] = 0;
        data[i] = oneWire.read();
      }
      hAlarmValue = data[2];   // byte 2 is high temp alarm
      lAlarmValue = data[3];    // byte 3 is low temp alarm

      Serial.print("\tHi/Lo: ");
      Serial.print(hAlarmValue);
      Serial.print("/");
      Serial.println(lAlarmValue);
    } else {
      Serial.println("\tBad device addr!");
    }
  }
}
