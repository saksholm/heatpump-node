import {
  Initialized,
} from './initialized.class';

const initialized = new Initialized('DI');

const DI = {
  board: null,
/*
  hpAlarm: {

  },
  kwhMeterPulse: {

  },
*/
/*
  const int     DI_HP_ALARM = 19; // DI 19 - HP Alarm
  const int     DI_KWHMETER_PULSE = 20; // DI 20 - KWH Meter pulse

  pinMode(DI_HP_ALARM, INPUT); // HP alarm
  pinMode(DI_KWHMETER_PULSE, INPUT); // KWH metering - pulses

*/
};

DI.initial = board => {
  if(DI.board === null) {
    DI.board = board;
  }

  Object.keys(DI).map((key,index) => {
    const instance = DI[key];

    if(key !== "board" && typeof instance !== null && instance && typeof instance.initial === "function") {
      instance.initial(board);
    }
  });
  console.log("DI initial setup............................................... DONE");
}


export {DI};
