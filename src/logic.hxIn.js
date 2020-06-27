import {TH} from './th';
import {HP} from './hp';
import {GLOBALS} from './globals';

const {
  deadZone,
} = GLOBALS;

export const logicHxIn = () => {
  // we are above maximum hxIn... we should now stop things
  if(
    (TH.hxIn.value + deadZone) >= HP.hxInMaximum &&
    ![
      'stop',
      'starting',
      'manual',
    ].includes(HP.mode)
  ) {
    console.log(`HP.loop :: logicHxIn ::  hxIn + deadZone >= hxInMaximum... STOP HP, HP.mode = ${HP.mode}`);
    HP.stop();
  }
};
