//import {GLOBALS} from './globals';
import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
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


export const stopToDefrostAndContinue = (reason='MANUAL_DEFROST') => {
  // get mode before stopping
  const hp4wayMode = DO.hp4Way.value;
  HP.defrost = true;
  // #debug2
  hpStop(reason, false, () => runDefrostCycle(hp4wayMode, "stopToDefrostAndContinue() in #debug2"));

};

export const runDefrostCycle = (hp4wayMode='heating', where='') => {
  console.log("runDefrostCycle() is triggered from: ", where);
  // if emergencyShutdown... prevent defrost
  if(HP.emergencyShutdown) return false;

  console.log("---------------------------");
  console.log("STARTING DEFROSTING MODE!!!");
  console.log("---------------------------");

  HP.mode = 'defrost';
  DO.hp4Way.set(hp4wayMode === 'heating' ? 'cooling' : 'heating');

  DO.damperOutside.set('close');

  DO.hpFan.set('on');
  DO.hpFanOutput.set(40);

  DO.waterpumpCharging.set('on');
  DO.load2Way.set(50); // % of close...

  setTimeout(function() {
    console.log("STARTING PUMP!", 20);
    HP.allowedToRun = true;
    DO.hpAllowed.set('on');
    DO.hpOutput.set(20);

    // turn ahuFan also on
    DO.ahuFan.set('on');
    DO.ahuFanOutput.set(10);

    const loopCheck = setInterval(function() {

      // increase ahuFan up to defrostMax %
      if(DO.ahuFanOutput.value < DO.ahuFanOutput.defrostMax) DO.ahuFanOutput.increase(2);


      console.log("TH.betweenCX_FAN.value", TH.betweenCX_FAN.value);
      if(TH.betweenCX_FAN.value > 15) {
        console.log("Triggered setTimeout for hpStop().. stopping loopCheck for temperature between CX and FAN");
        setTimeout(function () {
          console.log("STOPPING DEFROST in 20sec");
          HP.defrost = false;
          hpStop(`STOPPING_DEFROST`);
        }, 20 * 1000);
        clearInterval(loopCheck);
      }

      // /loopCheck
    }, 5 * 1000);

    // /setTimeout
  }, 5* 1000);

};