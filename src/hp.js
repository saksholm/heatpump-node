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
  maxPower: 100, // 0-100 ... not use directly
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
  emergencyShutdown: false,
  mqtt: {
    status: {
      topic: 'hp/status',
    },
    emergency: {
      topic: 'hp/status',
      value: {
        value: 'emergencyStop',
        name: 'Emergency Stop'
      }
    }
  },
  mqttStatus: function(val) {
    if(val) {
      const {topic,value} = HP.mqtt[val];
      mqttPublish(HP.board.mqttClient, topic, value);
    }
  }
};

HP.start = function() {
  // if error... we don't want to start at all!!!
  if(HP.error) return false;
  if(HP.emergencyShutdown) return false;

  // if HP.mode is run or HP.allowedToRun is true... lets skip whole function!!
  if(HP.mode === 'run' || HP.allowedToRun === true) return false;

  console.log("\nStarting HP..... let's settle things up first\n");
  const {wait} = HP.board;

  HP.mode = 'run';
  console.log("HP mode is 'run'");

  const timeoutMillis = calculateTimeout(HP.restartTimestamp, HP.restartDelay, true);
  if(timeoutMillis/1000 !== 0) console.log(`\nWaiting for remain restartDelay ${timeoutMillis/1000}s before continuing\n`);
  wait(timeoutMillis, function() {
    HP.allowedToRun = true; // let's allow HP running (restartDelay is now over)
    console.log("HP allowed to run = true");
    DO.hpAllowed.set(true) //output.on(); // hp allowed relay to on
    console.log("hp allowed true");
    DO.waterpumpCharging.set("on");//output.on(); // waterpump charging relay to on
    console.log("waterpump charging true");
    DO.hpFan.set("on"); //output.on(); // Fan on
    console.log("hp fan on");

    // 4-way ?!??!



    DO.load2Way.controller.setTarget(HP.hxOutTarget);
    console.log(`load 2-way controller set to ${HP.hxOutTarget}c target out temp` )

    DO.load2Way.set(20); // let's open 2way valve 20%
    console.log("load 2-way to 20%");
    DO.hpFanOutput.set(20); // hp fan output to 20%
    console.log("hp fan output to 20%");

    // Dampers?

    if(TH.outside.value > 5) {
      DO.damperOutside.set("open");
      console.log("damper outside open");
      DO.damperConvection.set("close");
      console.log("damper convection close");

      DO.chgPumpRequest.set("off");
      console.log("chg pump off");
    } else {
      DO.damperOutside.set("close"); //output.off();
      console.log("damper outside close");
      DO.damperConvection.set("open"); //output.on();
      console.log("damper convection open");

      DO.chgPumpRequest.set("on");
      console.log("chg pump on");
    }



    // waiting extra 10s. to start pump.
    console.log("\nWaiting 10s more...\n");
    wait(10*1000, function() {
      // check if we are allowed to continue.. for example emergency stop before this happen
      if(HP.allowedToRun) {
        HP.actualRunStartTimestamp = unixtimestamp();
        DO.hpOutput.set(10); // set HP to 10% load
        console.log("hp output to 10%");
      }
    });

  });

};


HP.stop = function(emergency=false) {
  if(emergency) {
    HP.emergencyShutdown = true;
    HP.restartTimestamp = unixtimestamp();
    console.log("\n**********************************************");
    console.log("**                                          **");
    console.log("**          EMERGENCY SHUTDOWN              **");
    console.log("**                                          **");
    console.log("**********************************************\n");

    HP.mqttStatus('emergency')
  }
  const {wait} = HP.board;
  // let's check if minimumRunningTime is enough... if not.. we run it to end.
  // on emergency case we want to stop immediately.
  wait(emergency ? 0 : calculateTimeout(HP.actualRunStartTimestamp, HP.minimumRunningTime, true), () => {
    HP.mode = 'stop';
    console.log("HP mode 'stop'");
    HP.allowedToRun = false;
    console.log("HP allowedToRun false");

    DO.hpOutput.set(0); // shutdown output
    console.log("hpOutput 0");
    DO.hpAllowed.output.off();
    console.log("hpAllowed output off");


    // wait 20s before shutting water pump, 2-way valve
    console.log("\nWaiting 20s before continuing\n");
    wait(20000,() => {
      DO.waterpumpCharging.output.off(); // waterpump charging relay to on
      console.log("waterpump charging output off()");
      DO.load2Way.set(0); // let's open 2way valve 0%
      console.log("load 2-way to 0%");

      // wait 10s more before closing hp fan and close outside damper
      // and open convection damper
      console.log("\nWait 10s more...\n");
      wait(10000, () => {
        DO.hpFanOutput.set(0); // hp fan output to 0%
        console.log("hp fan output to 0%");

        DO.hpFan.output.off(); // Fan on
        console.log("hp fan output off()");

        DO.damperConvection.output.on();
        console.log("damper convection output on()");
        DO.damperOutside.output.off();
        console.log("damper outside output off()");


        console.log("\nStopped whole process\n");
        console.info("To run process again please type: 'emergencyReset()'");
      });

    });
  });

};

HP.loop = () => {
  HP.board.loop(GLOBALS.logicLoopInterval,() => {
/*
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
*/
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

//      if(GLOBALS.debug) console.log("this is fancy input pid", newValue, TH.hxOut.value);

    }

  });
};


HP.initial = board => genericInitial(HP, 'HP', board);
