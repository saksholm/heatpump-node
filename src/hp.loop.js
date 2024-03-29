import {HP} from './hp';
import {DO} from './do';
import {GLOBALS} from './globals';
import {hotgasWatch} from './hp.hotgasWatch';
import {hpCoolingLoop} from './hp.cooling';
import {hpHeatingLoop} from './hp.heating';
import {hpWaterHeating} from './hp.waterHeating';

import {logicAlarms} from './logic.alarms';
import {logicLoad2WayController} from './logic.load2way';
import {logicHxIn} from './logic.hxIn';
import {logicHpOutputWatch} from './logic.hpOutputWatch';
import {logicHpFanOutputWatch} from './logic.hpFanOutputWatch';
import {dynamicHpOutputMax} from './logic.hpOutputDynamicMax';

import {de} from "date-fns/locale";

export const hpLoop = () => {
  HP.board.loop(GLOBALS.logicLoopInterval,() => {
    // hp allowed to run.. change max hp output value dynamically
    dynamicHpOutputMax();

    logicAlarms();
    hotgasWatch();


    // TBD: this switch is just a mock.. depend on HP.mode what to do

    // TODO: change to HP.program...!! different than mode
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

    logicHpOutputWatch();
    logicHpFanOutputWatch();

  });

  HP.board.loop(GLOBALS.logicLoopLoad2WayLoopInterval,() => {
    // this logic is only for heat to water....
    // boiler logic asking heat to water
    if(GLOBALS.dryRun || (GLOBALS.heatToWater && DO.load2Way.value !== 0)) {

      logicLoad2WayController();
      logicHxIn(); // stops when minValue is exceeded


    }
  });

};
