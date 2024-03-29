//import {GLOBALS} from './globals';
import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
//import {DI} from './di';
//import {AO} from './ao';
import {AI} from './ai';
import {hpStop} from './hp.stop';
import {GLOBALS} from "./globals";
import {clearHandlers, manuallyShutdownEverything, resetPidController, unixtimestamp} from "./func";

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
//  HP.defrost = true;
  // #debug2
  HP.continueRunAfterDefrost = true;
  console.log("DEBUG :: stopToDefrostAndContinue() reason", reason);
  hpStop(reason, false, () => runDefrostCycle(hp4wayMode, "stopToDefrostAndContinue() in #debug2"));

};

export const runDefrostCycle = (hp4wayMode='heating', where='') => {
  console.log("runDefrostCycle() is triggered from: ", where);
  // if emergencyShutdown... prevent defrost
  if(HP.emergencyShutdown) return false;

  if(HP.mode === 'defrost') {
    console.log("ALREADY DEFROSTING!!!!", where);
    return false;
  }



  console.log("---------------------------");
  console.log("STARTING DEFROSTING MODE!!!");
  console.log("---------------------------");

  HP.defrost = true;
  HP.mode = 'defrost';
  DO.hp4Way.set('cooling');

  DO.damperOutside.set('close');

  DO.hpFan.set('on');
  DO.hpFanOutput.set(40);

  DO.waterpumpCharging.set('on');

  // reset load2way controller
//  DO.load2Way.controller.reset();
  // set target to 0
//  DO.load2Way.controller.target(0);
  // set to 50%
  DO.load2Way.manualMode = true;
  DO.load2Way.set(65); // % of close...


  console.log("....waiting.....", 40, 'seconds');

  DO.hpOutput.set(0,true,true);

  HP.timeoutHandlers.defrost1.push(setTimeout(function() {
//    resetPidController(DO.load2Way);

//    DO.load2Way.manualMode = false;
//    DO.load2Way.controller?.setTarget(40);

    console.log("STARTING PUMP!", 20);
    HP.allowedToRun = true;
    HP.actualRunStartTimestamp = unixtimestamp();

    DO.hpAllowed.set('on');

    // allow pump idling a while before starting increase output
    HP.timeoutHandlers.defrost4.push(setTimeout(function() {

      DO.hpOutput.set(20);

      // turn ahuFan also on
      DO.ahuFan.set('on');
      DO.ahuFanOutput.set(10);

      HP.timeoutHandlers.defrost2.push(setInterval(function() {

        // increase ahuFan up to defrostMax %
        if(DO.ahuFanOutput.value < DO.ahuFanOutput.defrostMax) DO.ahuFanOutput.increase(2);


        console.log("TH.betweenCX_FAN.value", TH.betweenCX_FAN.value, TH.exhaust.value, TH.exhaust.value);

        // added exhaust as second triggering value if facing some th read lag
        // helps defrost to stop earlier
        if(TH.betweenCX_FAN.value > 10 || TH.exhaust.value > 10) {
          console.log("Triggered setTimeout for hpStop().. stopping loopCheck for temperature between CX and FAN");
          HP.timeoutHandlers.defrost3.push(setTimeout(function () {
            console.log("STOPPING DEFROST in 5sec");

            // replace this manually
//            hpStop(`STOPPING_DEFROST`);

            manuallyShutdownEverything();
            DO.load2Way.manualMode = false;

//            clearHandlers(clearTimeout, HP.timeoutHandlers.defrost3);
          }, 5 * 1000));
          clearHandlers(clearInterval, HP.timeoutHandlers.defrost2);
        }

        // /loopCheck
      }, 5_000));

      // / defrost4 timeout
    }, 45_000));

    // /setTimeout 1
  }, 40_000));

};
