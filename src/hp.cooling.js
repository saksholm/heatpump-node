// this is for cooling only

import { HP } from "./hp";
import { DO } from './do';

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
  DO.hpFanOutput.set(20);

  DO.ahuFan.set('on');
  DO.ahuFanOutput.set(50);

  HP.allowedToRun = true;
};


export const hpCoolingLoop = () => {
  console.log("hpCoolingLoop triggered");

  setInterval(() => {
    // cooling loop

    // control AHU fan speed....




  }, 5000);

};
