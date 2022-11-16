import {HP} from './hp';
import {GLOBALS} from './globals';
import {hpCoolingLoop} from "./hp.cooling";
import {DO} from "./do";

export const coolingLogic = () => {


  // coolingDemand true... change mode to 'cooling'

  if(HP.coolingDemand) {
    console.log("coolingDemand debug :: HP.mode", HP.mode);
  }

  if(
    HP.coolingDemand &&
    [
      'run',
      'heating',
      'drying',
    ].includes(HP.mode))
  {
    // have to check modes priority can we just stop and change mode
    if(GLOBALS.modesPriority[HP.mode] > GLOBALS.modesPriority['cooling']) {
      HP.stop(`Switching to cooling mode`,false, () => {
//        HP.mode = 'cooling';
        console.log("logic.cooling.js::HP.start()", new Date().toISOString());
        HP.start();
        DO.hpOutput?.controller?.setTarget(GLOBALS.coolingTargetTemp);
        hpCoolingLoop();


      });
    }
  }

  // coolingDemand false... just stop if can

  if(
    HP.mode === 'cooling' &&
    !HP.coolingDemand &&
    ![
      'starting',
      'stopping',
      'alarmA'
    ].includes(HP.mode))
  {
      HP.stop(`Normal stop from cooling, no coolingDemand anymore`);
  }
};
