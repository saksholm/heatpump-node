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


export const HP = {
  board: null,
  allowedToRun: false,
  error: false,
  mode: 'stop',
  running: false,
  lastStopTime: 0,
  minimumRunningTime: 60*5, // 5min
  actualRunStartTimestamp: 0,
  restartDelay: 60*5, // 5mins
  restartTimestamp: 0,
  maxPower: 50, // 0-100 ... not use directly
  minPower: 10, // 0-100 ... not use directly
  minFan: 10, // 0-100 ... not use directly
  maxFan: 60, // 0-100 ... not use directly
  maxHotgas: 80, // 80c
  maxFluidline: 30, // TODO: ask????
  hxInMaximum: 35,
  hxOutTarget: 45,
  nextLoopIntervalTimestamps: { // object to handle interval check skips
    hotgas: 0,
  },
};

HP.start = function() {
  // if error... we don't want to start at all!!!
  if(HP.error) return false;

  // if HP.mode is run or HP.allowedToRun is true... lets skip whole function!!
  if(HP.mode === 'run' || HP.allowedToRun === true) return false;

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



    DO.load2Way.controller.setTarget(HP.hxOutTarget);
    console.log(`load 2-way controller set to ${HP.hxOutTarget}c target out temp` )

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

};


HP.stop = function(emergency=false) {

  // let's check if minimumRunningTime is enough... if not.. we run it to end.
  // on emergency case we want to stop immediately.
  wait(emergency ? 0 : calculateTimeout(HP.actualRunStartTimestamp, HP.minimumRunningTime, true), () => {
    HP.mode = 'stop';
    HP.allowedToRun = false;

    DO.hpOutput.set(0); // shutdown output
    DO.hpAllowed.output.off();


    // wait 20s before shutting water pump, 2-way valve
    wait(20000,() => {
      DO.waterpumpCharging.output.off(); // waterpump charging relay to on
      console.log("waterpump charging output off()");
      DO.load2Way.set(0); // let's open 2way valve 0%
      console.log("load 2-way to 0%");

      // wait 10s more before closing hp fan and close outside damper
      // and open convection damper
      wait(10000, () => {
        DO.hpFanOutput.set(0); // hp fan output to 0%
        console.log("hp fan output to 0%");

        DO.hpFan.output.off(); // Fan on
        console.log("hp fan output off()");

        DO.damperConvection.output.on();
        console.log("damper convection output on()");
        DO.damperOutside.output.off();
        console.log("damper outside output off()");


        console.log("Stopped whole process");
      });

    });
  });

};

HP.loop = () => {
  HP.board.loop(GLOBALS.logicLoopInterval,() => {

    // check if we need to bypass this part for a while?
    if(HP.nextLoopIntervalTimestamps.hotgas <= unixtimestamp()) {
      // watch hotgas temp etc... safety things especially
      if(TH.hotgas.value > (HP.maxHotgas + GLOBALS.deadZone)) {
        console.log("HP hotgas is maybe little bit too hot...");

        // too hot hotgas! drop output demand by half
        if(DO.hpOutput.value > DO.hpOutput.minValue) {
          const cutOutputToHalf = Math.round(DO.hpOutput.value / 2);
          DO.hpOutput.set(cutOutputToHalf);

          console.log("... cut hp output demand to half");
        }

        if(DO.load2Way.value < DO.load2Way.maxValue) {
          const doubleOutput = Math.round(DO.load2Way.value * 2);
          DO.load2Way.set(doubleOutput);
          console.log("... and doubled load 2-way valve output");
        }
        // should put next legit check time?! so this have time to stabilize things
        // for 15s?
        HP.nextLoopIntervalTimestamps.hotgas = unixtimestamp() +15;
      }
    }

    // some operator to handle if this should be active or not
    // count variable is basically some measurement
    // input is pure output...
    if(GLOBALS.dryRun || (HP.heatToWater && DO.load2Way.value !== 0)) {


      // update temperature to controller and get new value out
      const newValue = Math.round( DO.load2Way.controller.update(TH.hxOut.value) );
      // if new value is not the existing value.. we update
      if(newValue !== DO.load2Way.value) {
        DO.load2Way.set(newValue);
      }

      if(GLOBALS.debug) console.log("this is fancy input pid", newValue, TH.hxOut.value);

    }

  });
};


HP.initial = board => genericInitial(HP, 'HP', board);
