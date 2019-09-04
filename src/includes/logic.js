import {GLOBALS} from './globals';
import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
import {DI} from './di';
import {AO} from './ao';
import {AI} from './ai';

import {

} from './func';

export const LOGIC = {};

LOGIC.loop = () => {

  setInterval(() => {


    // TODO: boiler checks if some if allowed or not... override rules with checks

    // boiler upper check minimum

    if( (TH.boilerUpper.value + GLOBALS.boiler.deadZone) < GLOBALS.boiler.upper.softMinimum) {
      GLOBALS.boiler.upper.request = true;
      GLOBALS.upperHeatingResistorAllowed = true;
    }
    // boiler upper check maximum
    if( (TH.boilerUpper.value - GLOBALS.boiler.deadZone) > GLOBALS.boiler.upper.softMaximum) {
      GLOBALS.boiler.upper.request = false;
      GLOBALS.upperHeatingResistorAllowed = false;
    }

    // boiler middle check minimum
    if( (TH.boilerMiddle.value + GLOBALS.boiler.deadZone) < GLOBALS.boiler.middle.softMinimum) {
      GLOBALS.boiler.middle.request = true;
      GLOBALS.heatToWater = true; // allow
    }
    // boiler middle hardMaximum
    if( (TH.boilerMiddle.value - GLOBALS.boiler.deadZone) > GLOBALS.boiler.middle.softMaximum) {
      GLOBALS.boiler.middle.request = false;
      GLOBALS.heatToWater = false;
    }

    // boiler check lower minimum
    if( ( TH.boilerLower.value + GLOBALS.boiler.deadZone) < GLOBALS.boiler.lower.softMinimum) {
      GLOBALS.boiler.lower.request = true;
      GLOBALS.heatToWater = true;

    }

    // boiler check lower maximum
    if( (TH.boilerLower.value - GLOBALS.boiler.deadZone) > GLOBALS.boiler.lower.softMaximum) {
      GLOBALS.boiler.lower.request = false;
      GLOBALS.heatToWater = false;
    }

// let's use this later...
//    HP.start();

  },GLOBALS.logicLoopInterval);


};
