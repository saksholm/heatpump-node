import five from 'johnny-five';
import {
  Initialized,
} from './initialized.class';
import {
  genericInitial,
  mqttPublish,
} from './func';
import {GLOBALS} from './globals';

const initialized = new Initialized('DI');

const {
  Pin,
} = five;

export const DI = {
  board: null,
  interval: 1*1000,
  hpAlarm: {
    type: 'digitalIn',
    name: 'HP Alarm',
    pin: 30,
    pinMode: Pin.PULLUP, // INPUT pulldown!!
    value: 0, // 0 = false, 1 = true .... pull down
    set: function(value) {
      this.value = value;
      mqttPublish(DI.board.mqttClient, this.mqttState, this.value);
    },
    interval: 200,
    mqttCommand: '',
    mqttState: 'hp/hpAlarm',
    output: null,
    initial: function() {
      this.output = new five.Sensor.Digital(this.pin);
      initialized.done(this.name);
    },
  },
/*
  kwhMeterPulse: {

  },
*/
/*
  const int     DI_KWHMETER_PULSE = 20; // DI 20 - KWH Meter pulse

  pinMode(DI_KWHMETER_PULSE, INPUT); // KWH metering - pulses

*/
};

DI.onChanges = () => {
  console.log("Mapping DI onChanges");
  Object.keys(DI).map(key => {
    const instance = DI[key];
    if(key !== "board" && typeof instance !== null && typeof instance === 'object') {
      if(instance.output !== null) {
        instance.output.on("change", function(){
          instance.set(instance.output.value);
          if(GLOBALS.debug) console.log(`${instance.name} value changed to ${instance.output.value}`);
        });
        console.log(`DI, ${instance.name} onChanges watchers activated.... DONE`);
      }
    }
  });
};

DI.initial = board => genericInitial(DI, 'DI', board, DI.onChanges);
