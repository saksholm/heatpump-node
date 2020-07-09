import {HP} from './hp';
import {GLOBALS} from './globals';

export const coolingLogic = () => {


  // coolingDemand true... change mode to 'cooling'
  if(
    HP.coolingDemand &&
    [
      'run',
      'heating',
      'drying',
    ].includes(HP.mode)])
  {
    // have to check modes priority can we just stop and change mode
    if(GLOBALS.modesPriority[HP.mode] > GLOBALS.modesPriority['cooling']) {
      HP.stop(false, () => {
        HP.mode = 'cooling';
        HP.start();
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
      HP.stop();
  }
};
