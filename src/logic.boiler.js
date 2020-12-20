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

  // boiler middle check minimum
  if( (TH.boilerMiddle.value + boiler.deadZone) < boiler.middle.softMinimum) {
    boiler.middle.request = true;
  }
  // boiler middle softMaximum
  if( (TH.boilerMiddle.value - boiler.deadZone) > boiler.middle.softMaximum) {
    boiler.middle.request = false;
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
    || (boiler.lower.demand && boiler.lower.request);


  if(![
    'starting',
    'run',
    'stopping',
    'alarmA',
    'manual',
    'defrost',
  ].includes(HP.mode) && !HP.emergencyShutdown && !HP.defrost) {

    if(GLOBALS.heatToWater) {

      // if threePhaseMonitor value is ok then start
      if(DI.threePhaseMonitor.value === 0) {

        if(HP.restartTimestamp + HP.restartDelay <= unixtimestamp()) {
          console.log("LOGIC boiler :: Allowed to start after restartDelay... FINALLY!!!!!!!!!!!!!!!!! HP.mode = ", HP.mode);
          // TODO: what if we running something else ?!
          HP.program = 'heatToWater';
          HP.start();
        }
      }
    }
  }

  if([
    'run',
    'starting',
  ].includes(HP.mode)) {
    if(!GLOBALS.heatToWater) {
      // stop
      if(HP.restartTimestamp + HP.minimumRunningTime <= unixtimestamp()) {
        HP.program = 'stop'
        hpStop(`boiler logic, no heatToWater demand`);
      }

    }
  }


};
