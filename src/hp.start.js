import {HP} from './hp';
import {DO} from './do';
//import {TH} from './th';

import {
  calculateTimeout,
  unixtimestamp,
  setStatus,
  resetPidController,
  clearDefrostIntervalHandlers, setHPMode,
} from './func';
import {GLOBALS} from "./globals";

export const hpStart = function() {
//  console.log("hpStart... HP.mode is now", HP.mode);
  // if error... we don't want to start at all!!!
  if(HP.error) {
    console.log("hpStart :: HP.error = true");
    return false
  }
  if(HP.emergencyShutdown) {
    console.log("hpStart :: HP.emergencyShutdown = true");
    return false;
  }
  if(HP.defrost) {
    console.log("hpStart :: HP.defrost = true");
    return false;
  }
  if(HP.afterDry) {
    console.log("hpStart :: HP.afterDry = true");
    return false;
  }
  if(!GLOBALS.boostHotWater && !GLOBALS.nightElectricity.demand) {
    console.log("hpStart :: !GLOBALS.boostHotWater && !GLOBALS.nightElectricity = false");
    return false;
  }
  if(GLOBALS.preventRun) {
    console.log("hpStart :: GLOBALS.preventRun = true");
    return false;
  }

  if(HP.mode === 'manual') console.log("HP is now in 'manual' mode........ Choose your poison!!");

  // if HP.mode is something on array or HP.allowedToRun is true... lets skip whole function!!
  if([
    'run',
    'starting',
    'stopping',
    'heating',
    'cooling',
    'drying',
    'alarmA',
    'manual',
    'defrost',
  ].includes(HP.mode) || HP.allowedToRun === true) return false;

  console.log("\nStarting HP..... let's settle things up first\n");
//  const {wait} = HP.board;


  if(HP.mode !== 'manual') {
    HP.mode = 'starting';
    HP.allowedToRun = true;
    console.log("HP mode is 'starting'", new Date().toISOString());
  }

  const timeoutMillis = calculateTimeout(HP.restartTimestamp, HP.restartDelay, true);
  if(timeoutMillis/1000 !== 0) console.log(`\nWaiting for remain restartDelay ${timeoutMillis/1000}s before continuing\n`);
  // use basic setTimeout to clear timeout easier

  HP.timeoutHandlers.startStep1 = setTimeout(() => {

    // clear stopHandlers?!
    HP.timeoutHandlers.stopStep1 && clearTimeout(HP.timeoutHandlers.stopStep1);
    HP.timeoutHandlers.stopStep2 && clearTimeout(HP.timeoutHandlers.stopStep2);
    HP.timeoutHandlers.stopStep3 && clearTimeout(HP.timeoutHandlers.stopStep3);
    HP.timeoutHandlers.stopStep4 && clearTimeout(HP.timeoutHandlers.stopStep4);
    HP.timeoutHandlers.afterDry && clearTimeout(HP.timeoutHandlers.afterDry);

    clearDefrostIntervalHandlers();


    // TODO: use GLOBALS.modesPriority to check which one is first


    if (GLOBALS.hvacCooling || GLOBALS.hvacDrying) {
      DO.hp4Way.set('cooling');
      setHPMode('cooling');

      if(GLOBALS.hvacDrying) {
        // TODO: afterHeating on!!!
      }
    } else {
      if(GLOBALS.heatToWater || GLOBALS.heatToAir) {
        DO.hp4Way.set('heating');
      }
    }

    HP.allowedToRun = true; // let's allow HP running (restartDelay is now over)
    console.log("HP.allowedToRun = true");

    DO.hpAllowed.set("on") // hp allowed relay to on
    console.log("DO.hpAllowed set to true");

    DO.waterpumpCharging.set("on"); // waterpump charging relay to on
    console.log("waterpump charging set to",true);

    DO.hpFan.set("on"); // Fan on
    // console.log("hp fan on");

    DO.hpFanOutput.set(20); // hp fan output to 20%
    console.log("hp fan output to 20%");



    // initialize if controller is null
    //if(DO.load2Way.controller === null) DO.load2Way.initializeController();

    // reset only resets sumError, lastError, lastTime internal parameters (not P,I,D params)
    console.log("CALLING resetPidController()");
    resetPidController(DO.load2Way, () => {
      DO.load2Way.manualMode = false;
      DO.load2Way.controller.setTarget(HP.hxOutTarget);
      console.log("DEBUG :: inside resetPidController callback", DO.load2Way.controller?.target && DO.load2Way.controller?.target);
      console.log(`load 2-way controller set to ${HP.hxOutTarget}c target out temp` )
    });




//    DO.load2Way.controller.reset();
//    console.log(`load 2-way pid controller reset!`);


// TODO: is this needed for manual mode?! have to check
// this is not affected because PID controller handles this

    DO.load2Way.set(20); // let's open 2way valve 20% manually
    console.log("load 2-way to 20%");


     // TODO: create additional watcher for outside/chgIn temps to change if needed!!!

    // TODO: change this back when CHG is ready!!!
//     if(TH.outside.value > 5) {
       DO.damperOutside.set("open");
       console.log("damper outside open");
       DO.damperConvection.set("close");
       console.log("damper convection close");

       DO.chgPumpRequest.set("off");
       console.log("chg pump off");
/*     } else {
       DO.damperOutside.set("close"); //output.off();
       console.log("damper outside close");
       DO.damperConvection.set("open"); //output.on();
       console.log("damper convection open");

       DO.chgPumpRequest.set("on");
       console.log("chg pump on");
     }
*/


     // waiting extra 30s. to start pump.
     console.log("\nWaiting 30s more...\n");
     HP.timeoutHandlers.startStep2 = setTimeout(() => {
       // check if we are allowed to continue.. for example emergency stop before this happen
       if(HP.allowedToRun) {
         setStatus('running');
         HP.mode = 'run';

         console.log("HP.mode = 'run'");
         HP.actualRunStartTimestamp = unixtimestamp();
         DO.hpOutput.set(25); // set HP to 15% load
         console.log("hp output to 25%");
         console.log("HP.actualRunStartTimestamp", HP.actualRunStartTimestamp, new Date().toISOString());

         clearTimeout(HP.timeoutHandlers.startStep1);
         clearTimeout(HP.timeoutHandlers.startStep2);

         console.log("-----------------------------------------------------");
       }
     },30_000);

  }, timeoutMillis);

};
