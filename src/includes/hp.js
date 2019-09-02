import five from 'johnny-five';
import {GLOBALS} from './globals';
import {DO} from './do';
import {TH} from './th';
import {
  unixtimestamp,
  calculateTimeout,
  mapPercentToPWM,
  genericInitial,
} from './func'

const {
  constrain,
} = five.Fn;


const HP = {
  board: null,
  allowedToRun: false,
  error: false,
  mode: 'stop',
  running: false,
  lastStopTime: 0,
  minimumRunningTime: 60*5, // 5min
  restartDelay: 60*5, // 5mins
  restartTimestamp: 1566932400,
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

  HP.mode = 'run';
  console.log("HP mode is 'run'");

  const timeoutMillis = calculateTimeout(HP.restartTimestamp, HP.restartDelay, true);
  wait(timeoutMillis, function() {
    HP.allowedToRun = true; // let's allow HP running (restartDelay is now over)
    console.log("HP allowed to run = true");
    DO.hpAllowed.output.on(); // hp allowed relay to on
    console.log("hp allowed output on()");
    DO.waterpumpCharging.output.on(); // waterpump charging relay to on
    console.log("waterpump charging output on()");
    DO.hpFan.output.on(); // Fan on
    console.log("hp fan output on()");

    // 4-way ?!??!



    DO.load2Way.set(20); // let's open 2way valve 20%
    console.log("load 2-way to 20%");
    DO.hpFanOutput.set(20); // hp fan output to 20%
    console.log("hp fan output to 20%");

    // Dampers?

    if(TH.outside.value > 5) {
      DO.damperOutside.output.on();
      console.log("damper outside output on()");
      DO.damperConvection.output.off();
      console.log("damper convection output off()");
    } else {
      DO.damperOutside.output.off();
      console.log("damper outside output off()");
      DO.damperConvection.output.on();
      console.log("damper convection output on()");
    }



    // waiting extra 10s. to start pump.
    wait(10*1000, function() {
      DO.hpOutput.set(10); // set HP to 10% load
      console.log("hp output to 10%");
    });


    console.log("Okay... let's start");
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


HP.stop = function() {
  // TODO:
};

HP.initial = board => genericInitial(HP, 'HP', board);


export {
  HP,
};
