// this is for cooling only

import { HP } from "./hp";
import { DO } from './do';

// TODO: move manualCoolingMode from func.js to here

export const setCoolingDemand = value => {
  if(value === 'on') {
    HP.coolingDemand = true;

    // this should be moved!!!
    if(isPidControllerActive(DO.hpOutput)) {
      DO.hpOutput.controller.setTarget(HP.cooling.minAhuTemp);
    }


  }
  if(value === 'off') {
    HP.coolingDemand = false;
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
};


export const hpCoolingLoop = () => {

  if(HP.controller !== null) {
    // we have some controller in use!
  }

};
