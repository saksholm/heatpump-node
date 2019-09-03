export const LOGIC = {};

// from old project
// TODO: to be converted to js.... whoah...

/*
void HPclass::loop() {

  if(HP_STATUS) {
    if(HP_OUTPUT < HP_OUTPUT_MAX) {
      hpOutput(HP_OUTPUT + 1);
    }

    if(HP_OUTPUT == HP_OUTPUT_MAX){
      hpOutput(HP_OUTPUT_MIN);
    }

    if(HP_FAN_OUTPUT < HP_FAN_OUTPUT_MAX) {
      hpFanOutput(HP_FAN_OUTPUT + 2);
    }

    if(HP_FAN_OUTPUT == HP_FAN_OUTPUT_MAX) {
      hpFanOutput(HP_FAN_OUTPUT_MIN);
    }
  }


}





void HPclass::hpOutput(int value) {
 if(HP_ALLOWED && HP_STATUS && ( (global.currentMillis - HP.HP_OUTPUT_LASTMS) >= HP.HP_OUTPUT_DELAY) ) {
   if(value < HP_OUTPUT_MIN) { value = HP_OUTPUT_MIN; }
   if(value > HP_OUTPUT_MAX) { value = HP_OUTPUT_MAX; }

   if(value >= HP_OUTPUT_MIN && value <= HP_OUTPUT_MAX) {
     HP_OUTPUT = value;
     HP_OUTPUT_LASTMS = global.currentMillis; // Set currentMillis to avoid constant changing...
//      Serial.print("HP_OUTPUT is now ");
//      Serial.print(value);
//      Serial.println("%.. should rev on");
     analogWrite(AO_HP, FUNCclass::mapOutputToPWM(HP_OUTPUT,12));
   } else {
     Serial.print("ERROR IN HP OUTPUT!!! CANNOT HANDLE VALUE.. OUT OF RANGE. VALUE: ");
     Serial.println(value);
   }
 }
}


void HPclass::stopHP() {
 HP_OUTPUT = 0;
 analogWrite(AO_HP, HP_OUTPUT);

 delay(2000);

 // shutdown outside damper;
 DAMPER_OUTSIDE_OUTPUT = 0;
 DAMPER_OUTSIDE_LASTMS = global.currentMillis;
//  analogWrite(AO_LF, DAMPER_OUTSIDE_OUTPUT);
 digitalWrite(DO_DAMPER_OUTSIDE, LOW);


 HP_STATUS = 0;
 digitalWrite(DO_HP_ALLOWED, LOW);
 HP_FAN_RESTART_LASTMS = global.currentMillis;

 delay(10000);
 LOAD_2WAY_OUTPUT = 0;
 LOAD_2WAY_LASTMS = global.currentMillis;
 analogWrite(AO_2WAY, LOAD_2WAY_OUTPUT);


 CHARGING_WATERPUMP = 0;
 digitalWrite(DO_WATERPUMP_CHARGING, LOW);
 CHARGING_WATERPUMP_LASTMS = global.currentMillis; //reset timer

//  HP_FAN_STATUS = 0;
 hpFan(false);
//  digitalWrite(DO_HP_FAN, HP_FAN_STATUS ? HIGH : LOW);
//  HP_FAN_OUTPUT = 0;
//  analogWrite(AO_HP_FAN, HP_FAN_OUTPUT);



 // change modes
 GLOBALclass::changeProgramMode(GLOBALclass::programModeStates::programChangingMode);

 GLOBALclass::changeGroundCircuitMode(GLOBALclass::groundCircuitModeStates::gCOff);
 GLOBALclass::changeHVACMode(GLOBALclass::hvacModeStates::hvacIdle);

}


void HPclass::startHP() {

 if( (global.currentMillis -  HP_RESTART_LASTMS) >= HP_RESTART_DELAY) {
   Serial.println("HP_RESTART_DELAY expired, we can now start HP");
   if(CHARGING_WATERPUMP == 0) {
     Serial.println("CHARGING_WATERPUMP is off.. lets tune first some 2-way valve output");

     LOAD_2WAY_OUTPUT = 30;// okok... minimum is exceeded?


     analogWrite(AO_2WAY,LOAD_2WAY_OUTPUT); // turn 2-way valve first 30% open

     delay(5000); // then wait 5 sec...

     // waterpump is not on.. we want to turn waterpump on first
     CHARGING_WATERPUMP = 1;
     Serial.println("CHARGING_WATERPUMP is now on");
     digitalWrite(DO_WATERPUMP_CHARGING, CHARGING_WATERPUMP ? HIGH : LOW);


//      delay(5000); // wait 5sec

   } else {

   // open outside damper;
   DAMPER_OUTSIDE_OUTPUT = 1;
//    analogWrite(AO_LF, LF_OUTPUT);
   digitalWrite(DO_DAMPER_OUTSIDE, HIGH);

   hpFan(true);

//    HP_FAN_STATUS = 1;
//    digitalWrite(DO_HP_FAN, HP_FAN_STATUS ? HIGH : LOW);
//    HP_FAN_OUTPUT = 30;
//    analogWrite(AO_HP_FAN, HP_FAN_OUTPUT);

   delay(2000);

   hp(true);
//    HP_STATUS = 1;
//    Serial.println("HP_STATUS is now RUNNING");
//    digitalWrite(DO_HP_ALLOWED, HP_STATUS ? HIGH : LOW); // turn HP on

   delay(2000);

   hpOutput(HP_OUTPUT_MIN);
//    HP_OUTPUT = 10;
//    delay(2000);
//    Serial.println("HP_OUTPUT is now 10%.. should rev on");
//    analogWrite(AO_HP, HP_OUTPUT); // 10% on.
   }


 }

}

void HPclass::hpFan(boolean value) {

 if(value == true) { // turning fan on

   HP_FAN_STATUS = 1;
   HP_FAN_OUTPUT = HP_FAN_OUTPUT_MIN;
   digitalWrite(DO_HP_FAN, global.relayLow ? LOW : HIGH);
   analogWrite(AO_HP_FAN, HP_FAN_OUTPUT);

   HP_FAN_RESTART_LASTMS = global.currentMillis;
 }

 if(value == false) { // turning fan off
   HP_FAN_STATUS = 0;
   HP_FAN_OUTPUT = 0;
   HP_FAN_RESTART_LASTMS = global.currentMillis;

   digitalWrite(DO_HP_FAN, global.relayLow ? LOW : HIGH);
   analogWrite(AO_HP_FAN, HP_FAN_OUTPUT);
 }
}

void HPclass::hp(boolean value) {
 if(value == true) {
   if( (global.currentMillis - HP_RESTART_LASTMS) >= HP_RESTART_DELAY) { // we want to be sure that restart delay is expired
     HP_STATUS = 1;
     HP_RESTART_LASTMS = global.currentMillis;
     digitalWrite(DO_HP_ALLOWED, HIGH);

     Serial.println("HP_STATUS is now RUNNING");
   }
 }
 if(value == false) {
   digitalWrite(DO_HP_ALLOWED, LOW);
   HP_RESTART_LASTMS = global.currentMillis;
 }
}

void HPclass::hpFanOutput(int value) {
 if(HP_ALLOWED && HP_STATUS && ( (global.currentMillis - HP.HP_FAN_OUTPUT_LASTMS) >= HP.HP_FAN_OUTPUT_DELAY) ) {
   if(value < HP_FAN_OUTPUT_MIN) { value = HP_FAN_OUTPUT_MIN; }
   if(value > HP_FAN_OUTPUT_MAX) { value = HP_FAN_OUTPUT_MAX; }

   if(value >= HP_FAN_OUTPUT_MIN && value <= HP_FAN_OUTPUT_MAX) {
     HP_FAN_OUTPUT = value;
     HP_FAN_OUTPUT_LASTMS = global.currentMillis; // Set currentMillis to avoid constant changing...
//      Serial.print("HP_OUTPUT is now ");
//      Serial.print(value);
//      Serial.println("%.. should rev on");
     analogWrite(AO_HP_FAN, HP_FAN_OUTPUT);
   } else {
<      Serial.print("ERROR IN HP FAN OUTPUT!!! CANNOT HANDLE VALUE.. OUT OF RANGE. VALUE: ");
     Serial.println(value);
   }
 }
}

void HPclass::damperOutside(boolean value) {
 if(value == true) {
   digitalWrite(DO_DAMPER_OUTSIDE, global.relayLow ? HIGH : LOW);
 }
 if(value == false) {
   digitalWrite(DO_DAMPER_OUTSIDE, global.relayLow ? LOW : HIGH);
 }
}

void HPclass::damperConvection(boolean value) {
 if(value == true) {
   digitalWrite(DO_DAMPER_CONVECTION, global.relayLow ? HIGH : LOW);
 }
 if(value == false) {
   digitalWrite(DO_DAMPER_CONVECTION, global.relayLow ? LOW : HIGH);
 }
}

void HPclass::load2wayOutput(int value) {

}

void LOGICclass::loop() {


 if(
   HP.HP_ALLOWED && // HP is allowed to run
   !HP.HP_STATUS && // HP status is missing -> not running?
   !HP.HP_ERROR && // HP error is false
   ( (global.currentMillis - HP.HP_RESTART_LASTMS) >= HP.HP_RESTART_DELAY) // HP restart delay is over
 ) {

   if(temperatures.TH_BOILER_MIDDLE <= (boiler.LOAD_START_BOILER_MIDDLE - boiler.LOAD_BOILER_DZ) ) { // HP is stop and TH_BOILER_MIDDLE is below or equal than start value-dz
   Serial.println("yep.. we need hot water, calling HP.startHP");
     global.changeHeatToMode(global.heatToWater);
     global.changeProgramMode(global.programHeating);
     HP.startHP();
   }

   // what we do with boiler.LOAD_START_BOILER_LOWER ? some special case maybe?

 }

 if(HP.HP_STATUS) { // HP is running

   if(!HP.HP_ALLOWED) { // HP is runnig but HP_ALLOWED turned to false.... stopping
     HP.stopHP();

   }

   if(HP.HP_ERROR) {
     HP.stopHP();
   }

   if(temperatures.TH_BOILER_MIDDLE >= (boiler.LOAD_STOP_BOILER_MIDDLE + boiler.LOAD_BOILER_DZ) ) { // reached boiler middle stop temperature+dz.. stop hp
     HP.stopHP();
   }

 }

}



*/
