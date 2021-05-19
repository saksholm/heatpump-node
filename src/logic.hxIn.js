const GLOBALS = require('./globals');
import {TH} from './th';
import {HP} from './hp';

const {
  deadZone,
} = GLOBALS;

export const logicHxIn = () => {
  // we are above maximum hxIn... we should now stop things

  /**
   *   TODO: cooling mode can act more differently? or all modes ?
   *   ... add more hpFanOutput instead of stopping
   *   ... coolingMode uses lower hpFanOutput, so there is always possible to increase
   *   ... maybe it's better to be conditional... (if hpFanOutput is not xx%... increase it first
   *   ... and when exceeded limit.. stop)
   */


  if(
    (TH.hxIn.value + deadZone) >= HP.hxInMaximum &&
    ![
      'stop',
      'starting',
      'manual',
    ].includes(HP.mode)
  ) {


    // TODO: see above hpFanOutput thing .....^

    console.log(`HP.loop :: logicHxIn ::  hxIn + deadZone >= hxInMaximum... STOP HP, HP.mode = ${HP.mode}`);
    HP.stop();
  }
};
