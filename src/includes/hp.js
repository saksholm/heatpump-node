import {five} from 'johnny-five';
import {GLOBALS} from './globals';

const HP = {
  board: null,
  allowedToRun: false,
  error: false,
  running: false,
  lastStopTime: 0,
  minimumRunningTime: 60*5*1000, // 5min
  restartDelay: 60*5*1000, // 5mins
  restartTimestamp: 0,
  maxPower: 50, // 0-100
  minPower: 10, // 0-100
  minFan: 10, // 0-100
  maxFan: 60, // 0-100
  maxHotgas: 90, // 90c
  maxFluidline: 30, // TODO: ask????
};

HP.start = function() {
  console.log("Starting HP..... let's settle things up first");
  const {wait} = this.board;



  wait(5000, function() {
    console.log("trolololo");
  });

/*
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
*/
};


HP.initial = board => {
  if(HP.board === null) {
    HP.board = board;
  }
/*
  Object.keys(TH).map((key) => {
    const instance = TH[key];

    if(key !== "board" && typeof instance !== null && instance && typeof instance.initial === "function") {
      instance.initial(board);
    }
  });
  */
  console.log("HP initial setup............................................... DONE");
};


export {
  HP,
};
