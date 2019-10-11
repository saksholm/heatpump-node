import five from 'johnny-five';
import {
  Initialized,
} from './initialized.class';
import {GLOBALS} from './globals';
import {
  genericInitial,
  mqttPublish,
} from './func';

const initialized = new Initialized('AI');

const {
  Pin,
} = five;

export const AI = {
  board: null,
  interval: 2*1000,
  threshold: 2,
  condenserPde: {
    type: 'pde',
    name: 'Condenser PDE',
    pin: 'A0',
    pinMode: Pin.INPUT,
    value: 0,
    set: function(value) {
      this.value = value;
    },
    meltingPa: 40, // ?
    limitingPa: 50, // ?
    warningPa: 60, // ?
    mqttCommand: '',
    mqttState: '',
    output: null,
    initial: function() {
      this.output = new five.Sensor({pin: this.pin, freq: AI.interval, threshold: AI.threshold}),
      initialized.done(this.name);
    },
  },

};

AI.onChanges = () => {
  console.log("Mapping AI onChanges");
  Object.keys(AI).map(key => {
    const instance = AI[key];
    if(key !== "board" && typeof instance !== null && typeof instance === 'object') {
      if(instance.output !== null) {
        instance.output.on("change", function(value){
          instance.set(value);
          if(GLOBALS.debug) console.log(`${instance.name} value changed to ${value}`);
        });
        console.log(`AI, ${instance.name} onChanges watchers activated.... DONE`);
      }
    }
  });
};


AI.initial = board => genericInitial(AI, 'AI', board, AI.onChanges);