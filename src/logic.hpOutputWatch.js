import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';

import {
  isPidControllerActive,
  unixtimestamp,
} from './func';

export const logicHpOutputWatch = () => {
  // old enough to make new checks
  const timestamp = unixtimestamp();
  if(timestamp > (HP.outputWatchInterval + HP.nextLoopIntervalTimestamps.output) ) {

    // COOLING!!!
    if(HP.mode === 'cooling') {
      if(isPidControllerActive(DO.hpOutput)) {
        // calculate new output
        const newValue = Math.round( DO.hpOutput.controller.update(TH.ahuCirculationSupply.value) );
        // if new value is not the existing value.. we update
        if(newValue !== DO.hpOutput.value) {
          DO.hpOutput.set(newValue);
        }
      }
    }

    if(DO.load2Way.value >= 60 && DO.load2Way.value < 90) {
      if(
        DO.hpOutput.value !== DO.hpOutput.minValue &&
        ![
          'stop',
          'manual',
        ].includes(HP.mode)
      ) {
        DO.hpOutput.decrease(5);
        console.log(`HP.loop :: decreasing hpOutput (to ${DO.hpOutput.value}) by 5% because load2Way (${DO.load2Way.value}) is more than 60% open, HP.mode = ${HP.mode}`);
      }

    } else if(DO.load2Way.value >= 90) {
      // if hpOutput is already on minimum value we can stop things now?
      if(DO.hpOutput.value === DO.hpOutput.minValue) {

        // call only if not stop/stopping/starting
        if(![
            'stop',
            'stopping',
            'starting',
        ].includes(HP.mode)) {
          console.log(`HP.loop :: STOPPING HP, because load2Way (${DO.load2Way.value}) is more than 90% open and hpOutput is minimum, HP.mode = ${HP.mode}`);
          HP.stop();
        }
      } else { // if hpOutput is not minimum.. just decrease it by 10%
        DO.hpOutput.decrease(10);
      }
    }

    // do not allow
    if(![
      'stop',
      'stopping',
      'starting',
      'manual',
    ].includes(HP.mode)) {
      // if load2Way is <65 and hpOutput is not maxValue
      if(DO.load2Way.value < 50 && DO.hpOutput.value < DO.hpOutput.maxValue) {
        DO.hpOutput.increase(1);
        console.log(`HP.loop :: increasing hpOutput (to ${DO.hpOutput.value}) by 1% because load2Way (${DO.load2Way.value}) is less than 50%, HP.mode = ${HP.mode}`);
      }
    }


    HP.nextLoopIntervalTimestamps.output = timestamp;
  }
};
