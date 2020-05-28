import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
import {GLOBALS} from './globals';

import {hotgasWatch} from './hp.hotgasWatch';

export const hpLoop = () => {
  HP.board.loop(GLOBALS.logicLoopInterval,() => {

    hotgasWatch();

    // some operator to handle if this should be active or not
    // count variable is basically some measurement
    // input is pure output...
    if(GLOBALS.dryRun || (HP.heatToWater && DO.load2Way.value !== 0)) {


      // update temperature to controller and get new value out
      const newValue = Math.round( DO.load2Way.controller.update(TH.hxOut.value) );
      // if new value is not the existing value.. we update
      if(newValue !== DO.load2Way.value) {
        DO.load2Way.set(newValue);
      }





    }

  });
};
