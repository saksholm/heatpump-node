import {HP} from './hp';
import {DO} from './do';


export const logicHpFanOutputWatch = timestamp => {
  if(timestamp > (HP.fanWatchInterval + HP.nextLoopIntervalTimestamps.fan)) {

    // prevent hpFanOutput increasing when HP.mode = stop/starting/stopping
    if(![
      'stop',
      'starting',
      'stopping',
      'manual',
    ].includes(HP.mode)) {
      DO.hpFanOutput.increase(1);
      console.log(`HP.loop :: increasing hpFanOutput (to ${DO.hpFanOutput.value}) by 1%, HP.mode = ${HP.mode}`);
    }



    HP.nextLoopIntervalTimestamps.fan = timestamp;
  }
};
