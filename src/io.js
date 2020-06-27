import {GLOBALS} from './globals';
import {DO} from './do';
import {DI} from './di';
import {AO} from './ao';
import {AI} from './ai';
import {TH} from './th';
import {HP} from './hp';
import {LCD} from './lcd';
import {LOGIC} from './logic';

export const IO = {};

import {
  setStatus,
  manuaCoolingModeActivate,
} from './func';

import './cron';

IO.initial = board => {
  console.log("Start initialising io's");
  setStatus('Initialising io');


  // pass board instance to LOGIC.board
  if(LOGIC.board === null) LOGIC.board = board;

  // initialising I2C
  board.i2cConfig({});

  LCD.initial(board);
  DO.initial(board);
  DI.initial(board);
  //AO.initial(board); // not need at the moment
  AI.initial(board);
  TH.initial(board);
  HP.initial(board);


  board.wait(2000, () => {

    board.repl.inject({
      info: () => console.log("Hello, this is your info :D"),
      stop: () => HP.stop(true),
      emergencyReset: () => {
        if(HP.emergencyShutdown) HP.emergencyShutdown = false;
      },
      resetLcd: () => LCD.screen.initial(),
      manuaCoolingMode: () => manuaCoolingModeActivate(),
    });


    console.log("ACTIVE PINS", GLOBALS.activePins);

  });



};
