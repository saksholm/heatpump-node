// this is for cooling only

import { HP } from "./hp";
import { DO } from './do';
import {TH} from "./th";

import {
  isPidControllerActive, mqttPublish,
} from './func';
import {hpStart} from "./hp.start";
import {GLOBALS} from "./globals";

// TODO: move manualCoolingMode from func.js to here

export const setCoolingDemand = value => {
  if(value === 'on') {
    console.log("'state/iot/heatpump/coolingDemand' to on");

    mqttPublish(DO.board.mqttClient, 'coolingDemand', 'on');
    HP.coolingDemand = true;

    // this should be moved!!!
/*
    if(isPidControllerActive(DO.hpOutput)) {
      DO.hpOutput.controller.setTarget(HP.cooling.minAhuTemp);
    }
*/

    /**
     * TODO: create a change mechanism to switching from any other mode to cooling
     */



  }
  if(value === 'off') {
    if(HP.coolingDemand === true) {
      manualCoolingModeDeactivate();
    }
    HP.coolingDemand = false;
    console.log("'state/iot/heatpump/coolingDemand' to off");
    mqttPublish(DO.board.mqttClient, 'coolingDemand', 'off');
  }
};

export const manualCoolingModeActivate = () => {
  DO.hp4Way.set('cooling');

  DO.damperOutside.set('open');
  DO.load2Way.set(30);
  DO.waterpumpCharging.set('on');


  DO.hpFan.set('on');
  DO.hpFanOutput.set(10);

  DO.ahuFan.set('on');
  DO.ahuFanOutput.set(40);

  DO.hpOutput.set(10);

  HP.allowedToRun = true;
};

export const manualCoolingModeDeactivate = () => {
  HP.allowedToRun = false;
  // set waterpump off after 30s.
  setTimeout(() => {
    DO.waterpumpCharging.set('off');

    // turnoff hpFan
    setTimeout(() => {
      DO.hpFanOutput.set(0);
      DO.hpFan.set('off');
      DO.damperOutside.set('close');

      // turn off ahuFan
      setTimeout(() => {
        DO.ahuFanOutput(0);
        DO.ahuFan.set('off');
      }, 120_000);



    }, 60_000);

  }, 30_000)
};

export const hpCoolingLoop = () => {
  console.log("hpCoolingLoop triggered");

  DO.hp4Way.set('cooling');

  // control AHU intial fan speed....
  DO.ahuFan.set('on');
  DO.ahuFanOutput.set(30);

  // start waterpump
  DO.waterpumpCharging.set('on');
  DO.load2Way.set(40);

  // hpFan initial
  DO.hpFan.set('on');
  DO.hpFanOutput.set('10');

  // dynamic hp output
  HP.dynamicHPOutput = true;

  DO.hpOutput.set(20);


  setInterval(() => {
    // cooling loop

    // load2way logic
    if((TH.hxOut.value + 2) > HP.cooling.hxOutMax) {
      // open load2way for 1 step
      DO.load2Way.decrease();
      GLOBALS.debug && console.log("hpCoolingLoop()::HP.cooling.hxOutMax reached::load2way decrease, TH.hxOut.value/TH.hxOut.value+2/HP.cooling.hxOutMax", TH.hxOut.value, TH.hxOut.value +2, HP.cooling.hxOutMax);
    }
    if((TH.hxOut.value - 2) < HP.cooling.hxOutMin) {
      // close load2way for 1 step
      DO.load2Way.increase();
      GLOBALS.debug && console.log("hpCoolingLoop()::HP.cooling.hxOutMin reached::load2way increase, TH.hxOut.value/TH.hxOut.value-2/HP.cooling.hxOutMin", TH.hxOut.value, TH.hxOut.value -2, HP.cooling.hxOutMin);
    }


    // hp output logic

    if((TH.ahuCirculationSupply.value + 2) > HP.cooling.maxAhuTemp) {
      DO.hpOutput.increase();
      GLOBALS.debug && console.log("hpCoolingLoop()::HP.cooling.maxAhuTemp reached::hpOutput increase, TH.ahuCirculationSupply.value/TH.ahuCirculationSupply.value+2/HP.cooling.maxAhuTemp", TH.ahuCirculationSupply.value, TH.ahuCirculationSupply.value +2, HP.cooling.maxAhuTemp);
    }
    if((TH.ahuCirculationSupply.value - 2) < HP.cooling.minAhuTemp) {
      DO.hpOutput.decrease();
      GLOBALS.debug && console.log("hpCoolingLoop()::HP.cooling.minAhuTemp reached::hpOutput decrease, TH.ahuCirculationSupply.value/TH.ahuCirculationSupply.value-2/HP.cooling.minAhuTemp", TH.ahuCirculationSupply.value, TH.ahuCirculationSupply.value -2, HP.cooling.minAhuTemp);
    }


    // exhaust temp

    if((TH.exhaust.value + 2) > HP.cooling.exhaustMax) {
      DO.hpFanOutput.increase();
      GLOBALS.debug && console.log("hpCoolingLoop()::HP.cooling.exhaustMax reached::hpFanOutput increase, TH.exhaust.value/TH.exhaust.value+2/HP.cooling.exhaustMax", TH.exhaust.value, TH.exhaust.value +2, HP.cooling.exhaustMax);
    }

    if((TH.exhaust.value - 2) < HP.cooling.exhaustMin) {
      DO.hpFanOutput.decrease();
      GLOBALS.debug && console.log("hpCoolingLoop()::HP.cooling.exhaustMin reached::hpFanOutput decrease, TH.exhaust.value/TH.exhaust.value-2/HP.cooling.exhaustMin", TH.exhaust.value, TH.exhaust.value -2, HP.cooling.exhaustMin);
    }



  }, 15_000);

};
