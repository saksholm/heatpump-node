import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';

export const logicHpOutputWatch = timestamp => {
  // old enough to make new checks
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



    if(DO.load2Way.value >= 85 && DO.load2Way.value < 95) {
      // lower hp output by 10%... if not already minValue
      if(
        DO.hpOutput.value !== DO.hpOutput.minValue &&
        ![
          'stop',
          'manual',
        ].includes(HP.mode)
      ) {
        DO.hpOutput.decrease(5);
        console.log(`HP.loop :: decreasing hpOutput (to ${DO.hpOutput.value}) by 5% because load2Way (${DO.load2Way.value}) is more than 85% open, HP.mode = ${HP.mode}`);
      }

    } else if(DO.load2Way.value >= 95) {
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
      if(DO.load2Way.value < 65 && DO.hpOutput.value < DO.hpOutput.maxValue) {
        DO.hpOutput.increase(1);
        console.log(`HP.loop :: increasing hpOutput (to ${DO.hpOutput.value}) by 1% because load2Way (${DO.load2Way.value}) is less than 65%, HP.mode = ${HP.mode}`);
      }
    }


    HP.nextLoopIntervalTimestamps.output = timestamp;
  }
};
