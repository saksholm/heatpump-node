import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
import {GLOBALS} from './globals';

import {
  unixtimestamp,
} from './func';
import {
  stopToDefrostAndContinue,
} from "./logic.defrost";
import {hpStop} from "./hp.stop";


export const hotgasWatch = () => {
  const timestamp = unixtimestamp();
  const {
    deadZone,
  } = GLOBALS;
  // check if we need to bypass this part for a while?
  if(HP.nextLoopIntervalTimestamps.hotgas <= timestamp) {
    // watch hotgas temp etc... safety things especially
    if(TH.hotgas.value > HP.maxHotgasEmergency) {
      hpStop('emergency hotgas stop',true);
    }

    if(TH.hotgas.value > (HP.maxHotgas + deadZone)) {
      console.log("HP hotgas is maybe little bit too hot...");

      // start defrosting only when heating mode and hotgas triggered
      if(DO.hp4Way.value === 'heating') {
        stopToDefrostAndContinue('HOTGAS_DEFROST');
      } else {

        // too hot hotgas! drop output demand by half
        if(DO.hpOutput.value > DO.hpOutput.minValue) {
          let cutOutputToHalf = Math.round(DO.hpOutput.value / 2);

          // if cutOutputToHalf is under minValue... set it to minValue
          if(cutOutputToHalf < DO.hpOutput.minValue) cutOutputToHalf = DO.hpOutput.minValue;

          DO.hpOutput.set(cutOutputToHalf);

          console.log("... cut hp output demand to half (or at least to minimum)");
        }

        /*
        NOTE: not relevant anymore because PID handles

        if(DO.load2Way.value < DO.load2Way.maxValue) {
          let doubleOutput = Math.round(DO.load2Way.value * 2);
          // check if doubled valve opening is over maximum... then set it to maximum
          if(doubleOutput > DO.load2Way.maxValue) doubleOutput = DO.load2Way.maxValue;

          DO.load2Way.set(doubleOutput);
          console.log("... and doubled load 2-way valve output (or at least to maximum)");
        }

         */

        // should put next legit check time?! so this have time to stabilize things
        // for 15s?
        HP.nextLoopIntervalTimestamps.hotgas = timestamp + HP.hotgasWatchInterval;

      }
    }
  }
};
