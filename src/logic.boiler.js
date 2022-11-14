import {GLOBALS} from './globals';
import {HP} from './hp';
//import {DO} from './do';
import {TH} from './th';
import {DI} from './di';
//import {AO} from './ao';
//import {AI} from './ai';

import {
  unixtimestamp,
} from './func';

import {
  hpStop,
} from "./hp.stop";

export const boilerLogic = () => {
  // TODO: boiler checks if some is allowed or not... override rules with checks

  // TODO: implement hard limits...!

  const {
    boiler,
    debugLevels,
  } = GLOBALS;


  // boiler upper check minimum
  if( (TH.boilerUpper.value + boiler.deadZone) < boiler.upper.softMinimum) {
    boiler.upper.request = true;
//    GLOBALS.upperHeatingResistorAllowed = true;
  }
  // boiler upper check maximum
  if( (TH.boilerUpper.value - boiler.deadZone) > boiler.upper.softMaximum) {
    boiler.upper.request = false;
//    GLOBALS.upperHeatingResistorAllowed = false;
  }


  if(HP.mode === 'run') {

    // if th.boilermiddle is > minimum && th.boilermiddle < maximum === true
    if(
      ((TH.boilerUpper.value - boiler.deadZone) > boiler.upper.softMinimum) &&
      ((TH.boilerUpper.value + boiler.deadZone) < boiler.upper.softMaximum)
    ) {
      debugLevels.boilerDebug && console.log("boilerlogic :: upper running", HP.mode, "requesting true");
      boiler.upper.request = true;
    }

  }





  // boiler middle softMaximum
  if( (TH.boilerMiddle.value - boiler.deadZone) > boiler.middle.softMaximum) {
    boiler.middle.request = false;
  }

  // boiler middle check minimum
  if( (TH.boilerMiddle.value + boiler.deadZone) < boiler.middle.softMinimum) {
    boiler.middle.request = true;
  }



  if(HP.mode === 'run') {
    // if th.boilermiddle is > minimum && th.boilermiddle < maximum === true
    if(
      /*((TH.boilerMiddle.value - boiler.deadZone) > boiler.middle.softMinimum) && */
      ((TH.boilerMiddle.value + boiler.deadZone) < boiler.middle.softMaximum)
    ) {
//      console.log("boilerlogic :: middle running", HP.mode, "requesting true");
      boiler.middle.request = true;
    }

  }


  // boiler check lower minimum
  if( ( TH.boilerLower.value + boiler.deadZone) < boiler.lower.softMinimum) {
    boiler.lower.request = true;
  }

  // boiler check lower maximum
  if( (TH.boilerLower.value - boiler.deadZone) > boiler.lower.softMaximum) {
    boiler.lower.request = false;
  }

  // NOTE: this controls water heating request
  GLOBALS.heatToWater = (boiler.upper.demand && boiler.upper.request)
    || (boiler.middle.demand && boiler.middle.request)
    || (boiler.lower.demand && boiler.lower.request)
    || HP.continueRunAfterDefrost;




  if(![
    'starting',
    'run',
    'stopping',
    'alarmA',
    'manual',
    'defrost',
  ].includes(HP.mode) && !HP.emergencyShutdown && !HP.defrost) {
    const hours = new Date().getHours();
    // calculate if we should start by forced before nightElectricity ends
    const hourForceTrigger = (GLOBALS.nightElectricity.endHour - GLOBALS.nightElectricity.forceHoursBeforeEnd) >= hours && hours <= GLOBALS.nightElectricity.endHour;
    // if both demand and triggered is true...
    const nightElectricityOnForced = GLOBALS.nightElectricity.demand && hourForceTrigger;


    if((GLOBALS.heatToWater && GLOBALS.nightElectricity.demand) || GLOBALS.boostHotWater || nightElectricityOnForced) {

      // if threePhaseMonitor value is ok then start
      if(DI.threePhaseMonitor.value === 0) {

        if(HP.restartTimestamp + HP.restartDelay <= unixtimestamp()) {
//          console.log("LOGIC boiler :: Allowed to start after restartDelay... FINALLY!!!!!!!!!!!!!!!!! HP.mode = ", HP.mode);
          // TODO: what if we running something else ?!
          HP.program = 'heatToWater';
          if(HP.continueRunAfterDefrost) HP.continueRunAfterDefrost = false;
          HP.start();
        }
      }
    }
  }

  if([
    'run',
    'starting',
  ].includes(HP.mode)) {
    const hours = new Date().getHours();
    const hoursStop = GLOBALS.nightElectricity.endHour <= hours;

    // debugs:
    if(debugLevels.boilerDebug && !GLOBALS.heatToWater) console.log("hpStop::!GLOBALS.heatToWater true");
    if(debugLevels.boilerDebug && !GLOBALS.boostHotWater && hoursStop) console.log("hpStop::!GLOBALS.boostHotWater && hoursStop true");

    // stop when no boiler demand
    // stop also when !boostHotWater AND hoursStop
    if(!GLOBALS.heatToWater || (!GLOBALS.boostHotWater && hoursStop) ) {
      // stop
      if(HP.restartTimestamp + HP.minimumRunningTime <= unixtimestamp()) {
        HP.program = 'stop'
        console.log("no heatToWater demand, stopping");
        hpStop(`boiler logic, no heatToWater demand`);
      }

    }
  }


};
