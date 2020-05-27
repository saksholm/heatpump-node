import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
import {GLOBALS} from './globals';

import {
  unixtimestamp,
} from './func';


export const hotgasWatch = () => {
  const timestamp = unixtimestamp();
  // check if we need to bypass this part for a while?
  if(HP.nextLoopIntervalTimestamps.hotgas <= timestamp) {
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
      HP.nextLoopIntervalTimestamps.hotgas = timestamp +15;
    }
  }
};
