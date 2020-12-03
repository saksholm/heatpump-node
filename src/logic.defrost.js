//import {GLOBALS} from './globals';
import {HP} from './hp';
import {DO} from './do';
//import {TH} from './th';
//import {DI} from './di';
//import {AO} from './ao';
import {AI} from './ai';
import {hpStop} from './hp.stop';
import {GLOBALS} from "./globals";

export const defrostLogic = () => {

  // DEFROST
  //TODO: prevent this to run every run...
  if(AI.condenserPde.active && HP.defrost === false && AI.condenserPde.value >= AI.condenserPde.defrostPa ) {
    // condenser Pa is over melting Pa limit
    HP.defrost = true;
    HP.mode = 'defrost';
    HP.mqttStatus('modeChange');
    // increase fanSpeed ?
    if(DO.hpFanOutput.value < DO.hpFanOutput.maxValue) {
      DO.hpFanOutput.set(DO.hpFanOutput.value + 10); // increase fan speed by 5%
    }

    if(DO.hpFanOutput.value === DO.hpFanOutput.maxValue ) {
      // cannot increase fan speed in given bounds.. lower hpOutput
      DO.hpOutput.set(DO.hpOutput.set(DO.hpOutput.value - 10)); // decrease hpOutput by 5%
    }

  }

  if(AI.condenserPde.active && HP.defrost === true && AI.condenserPde.value <= AI.condenserPde.cleanPa) {
    HP.defrost = false;
    HP.mode = 'heating';
    HP.mqttStatus('modeChange');

    DO.hpFanOutput.set(DO.hpFanOutput.value - 10);
    DO.hpOutput.set(DO.hpOutput.value + 10);

  }


};


export const stopDefrostContinue = () => {
  const hp4wayMode = DO.hp4Way.value;

  hpStop(`stop for defrosting`, false, () => {
    console.log("STARTING DEFROSTING MODE!!!");

    HP.mode = 'defrost';
    DO.hp4Way.set(hp4wayMode === 'heating' ? 'cooling' : 'heating');

    DO.damperOutside.set('close');

    DO.hpFan.set('on');
    DO.hpFanOutput.set(40);

    DO.waterpumpCharging.set('on');
    DO.load2Way.set(50);

    setTimeout(function() {
      console.log("STARTING PUMP!", 20);
      HP.allowedToRun = true;
      DO.hpOutput.set(20);
    }, 5* 1000);

    setTimeout(function () {
      hpStop(`stopping defrosting`);
    }, 30 * 1000);

  });

};