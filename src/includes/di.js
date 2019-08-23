import {
  Initialized,
} from './initialized.class';

const initialized = new Initialized('DI');

const DI = {
  DI1: 'DI1',

/*
  const int     DI_HP_ALARM = 19; // DI 19 - HP Alarm
  const int     DI_KWHMETER_PULSE = 20; // DI 20 - KWH Meter pulse

  pinMode(DI_HP_ALARM, INPUT); // HP alarm
  pinMode(DI_KWHMETER_PULSE, INPUT); // KWH metering - pulses

*/
};

DI.initial = function() {
  Object.keys(this).map((key,index) => {
    const instance = this[key];

    if(typeof instance.initial === "function") {
      instance.initial(five);
    }
  });
  console.log("DI initial setup............................................... DONE");
}


export {DI};
