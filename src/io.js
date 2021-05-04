import {GLOBALS} from './globals';
import {DO} from './do';
import {DI} from './di';
//import {AO} from './ao';
import {AI} from './ai';
import {TH} from './th';
import {HP} from './hp';
import {LCD} from './lcd';
import {LOGIC} from './logic';

export const IO = {};

import {
  setStatus,
  mqttSubscribe,
  printTHTable,
  printHPObject,
  printDOObject,
  printAIObject,
  printDemandObject,
  printTimeoutHandlers,
  resetAlarms,
} from './func';

import {
  manualCoolingModeActivate,
} from './hp.cooling';

import {
  stopToDefrostAndContinue,
} from './logic.defrost';

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


  // subscribe global mqtt command topics
  GLOBALS.mqttCommandSubscribes.map(mqttTopic => {
    mqttSubscribe(board.mqttClient, mqttTopic.topic);
  });


  board.wait(2000, () => {

    board.repl.inject({
      info: () => console.log("Hello, this is your info :D"),
      stop: () => HP.stop(`REPL manual stop with emergency true`,true),
      emergencyReset: () => {
        if(HP.emergencyShutdown) HP.emergencyShutdown = false;
      },
      resetLcd: () => LCD.screen.initial(),
      manualCoolingMode: () => manualCoolingModeActivate(),
      hpMode: value => {
        if(HP.manual) {
          HP.mode = value;
        }
      },
      manualDefrost: () => stopToDefrostAndContinue(),
      debugTH: () => GLOBALS.debugLevels.th = !GLOBALS.debugLevels.th,
      debugPID: () => GLOBALS.debugLevels.load2WayControllerPid = !GLOBALS.debugLevels.load2WayControllerPid,
      debugHPFan: () => GLOBALS.debugLevels.hpFanOutput = !GLOBALS.debugLevels.hpFanOutput,
      debugHPOutput: () => GLOBALS.debugLevels.hpOutput = !GLOBALS.debugLevels.hpOutput,
      thTable: () => printTHTable(),
      printTHObject: () => {console.log("TH Object", TH)},
      printGLOBALSObject: () => {console.log("GLOBALS Objects", GLOBALS)},
      printHPObject: () => {console.log("HP Object", printHPObject())},
      printDOObject: () => {console.log("DO Object", printDOObject())},
      printAIObject: () => {console.log("AI Object", printAIObject())},
      printTimeoutHandlers: () => printTimeoutHandlers(),
      printDemand: () => {console.log("Demand", printDemandObject())},
      resetAlarm: () => resetAlarms(),
    });


    console.log("ACTIVE PINS", GLOBALS.activePins);

  });



};
