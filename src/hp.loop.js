import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
import {GLOBALS} from './globals';
import {
  unixtimestamp,
} from './func';

import {hotgasWatch} from './hp.hotgasWatch';
import {hpCoolingLoop} from './hp.cooling';
import {hpHeatingLoop} from './hp.heating';
import {hpWaterHeating} from './hp.waterHeating';

import {logicAlarms} from './logic.alarms';
import {logicLoad2WayController} from './logic.load2way';
import {logicHxIn} from './logic.hxIn';
import {logicHpOutputWatch} from './logic.hpOutputWatch';
import {logicHpFanOutputWatch} from './logic.hpFanOutputWatch';

const {
  deadZone,
} = GLOBALS;


export const hpLoop = () => {
  HP.board.loop(GLOBALS.logicLoopInterval,() => {
    const timestamp = unixtimestamp();

    logicAlarms();
    hotgasWatch();

    // do we need this?! :o
    if(GLOBALS.dryRun || (HP.heatToWater && DO.load2Way.value !== 0)) {

      // TBD: this switch is just a mock.. depend on HP.mode what to do
      switch(HP.mode) {
        case "cooling":
          // call cooling func
          hpCoolingLoop();
          break;
        case "heating":
          hpHeatingLoop();
          break;
        case "waterHeating":
          hpWaterHeating();
          break;
      }


      logicLoad2WayController();
      logicHxIn();
      logicHpOutputWatch(timestamp);
      logicHpFanOutputWatch(timestamp);

    }

  });
};
