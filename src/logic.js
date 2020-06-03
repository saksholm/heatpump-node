import {GLOBALS} from './globals';
import {HP} from './hp';
import {DO} from './do';
import {TH} from './th';
import {DI} from './di';
import {AO} from './ao';
import {AI} from './ai';

import {boilerLogic} from './logic.boiler';
import {defrostLogic} from './logic.defrost';

export const LOGIC = {
  board: null,
};

LOGIC.loop = () => {

  // start LOGIC loop
  LOGIC.board.loop(GLOBALS.logicLoopInterval,() => {

    // manual mode hack
    if(HP.manual && HP.mode !== 'manual') {
      HP.mode = 'manual';
      HP.allowedToRun = true;
      HP.start();
    }

    boilerLogic();
    defrostLogic();

  }); // LOGIC.loop ends


};
