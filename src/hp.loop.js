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
import {calculateDynamicHPOutput} from './func';
import {de} from "date-fns/locale";

export const hpLoop = () => {
  HP.board.loop(GLOBALS.logicLoopInterval,() => {

    if(HP.dynamicHPOutput) {
      const getDynamicHPOutput = calculateDynamicHPOutput();
      if(getDynamicHPOutput !== DO.hpOutput.value) {
        DO.hpOutput.value = getDynamicHPOutput;
        if(GLOBALS.debugLevels.dynamicHPOutput) console.log("DEBUG::HP.loop::dynamicHPOutput value", getDynamicHPOutput, new Date().toISOString());
      }
    }

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
