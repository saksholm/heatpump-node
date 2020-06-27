// this is for cooling only

import { HP } from "./hp";
import { DO } from './do';

// TODO: move manualCoolinMode from func.js to here


export const manuaCoolingModeActivate = () => {
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

};
