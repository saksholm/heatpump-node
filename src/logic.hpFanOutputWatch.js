import {HP} from './hp';
import {DO} from './do';

import {
  unixtimestamp,
} from './func';
import {GLOBALS} from "./globals";


export const logicHpFanOutputWatch = () => {
  const timestamp = unixtimestamp();
  if(timestamp > (HP.fanWatchInterval + HP.nextLoopIntervalTimestamps.fan)) {

    // prevent hpFanOutput increasing when HP.mode = stop/starting/stopping
    if(![
      'stop',
      'starting',
      'stopping',
      'manual',
    ].includes(HP.mode)) {
      if(DO.hpFanOutput.value < DO.hpFanOutput.maxValue) {
        DO.hpFanOutput.increase(1);
        GLOBALS.debugLevels.hpFanOutput && console.log(`HP.loop :: increasing hpFanOutput (to ${DO.hpFanOutput.value}) by 1%, HP.mode = ${HP.mode}`);
      }
    }



    HP.nextLoopIntervalTimestamps.fan = timestamp;
  }
};
