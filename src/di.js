import {
  Initialized,
} from './initialized.class';
import {genericInitial} from './func';

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

DI.initial = board => genericInitial(DI, 'DI', board);


export {DI};
