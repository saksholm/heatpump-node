import {GLOBALS} from './globals';
import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
import {DI} from './di';
import {AO} from './ao';
import {AI} from './ai';

export const defrostLogic = () => {

  // DEFROST
  //TOOD: prevent this to run every run...
  if(HP.defrost === false && AI.condenserPde.value >= AI.condenserPde.defrostPa ) {
    // condenser Pa is over melting Pa limit
    HP.defrost = true;
    HP.mode = 'defrost';
    HP.mqttStatus('modeChange');
    // increase fanSpeed ?
    if(DO.hpFanOutput.value < DO.hpFanOutput.maxValue) {
      DO.hpFanOutput.set(DO.hpFanOutput.value + 10); // increase fan speed by 5%
    }

    if(DO.hpFanOutput.value === DO.hpFanOutput.maxValue ) {
      // cannot increase fanspeed in given bounds.. lower hpOutput
      DO.hpOutput.set(DO.hpOutput.set(DO.hpOutput.value - 10)); // decrease hpoutput by 5%
    }

  }

  if(HP.defrost === true && AI.condenserPde.value <= AI.condenserPde.cleanPa) {
    HP.defrost = false;
    HP.mode = 'heating';
    HP.mqttStatus('modeChange');

    DO.hpFanOutput.set(DO.hpFanOutput.value - 10);
    DO.hpOutput.set(DO.hpOutput.value + 10);

  }


};